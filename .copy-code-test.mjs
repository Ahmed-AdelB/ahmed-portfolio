import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const blogDir = path.resolve("src/content/blog");
const slugs = fs
  .readdirSync(blogDir)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.replace(/\.mdx$/, ""));

let allPass = true;
for (const slug of slugs) {
  const res = await fetch(`http://127.0.0.1:4321/blog/${slug}/`);
  const html = await res.text();
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const scripts = Array.from(document.querySelectorAll("script"))
    .map((script) => script.textContent || "")
    .filter(Boolean);
  const copyScript = scripts.find((script) =>
    script.includes("COPY_RESET_DELAY"),
  );
  if (!copyScript) {
    console.log(`${slug}: copy script not found => FAIL`);
    allPass = false;
    continue;
  }
  dom.window.eval(copyScript);

  const codeBlocks = document.querySelectorAll(".prose pre > code");
  const buttons = document.querySelectorAll(".prose pre .copy-code-button");
  const wrapped = document.querySelectorAll(".prose pre.code-block");

  const passed =
    codeBlocks.length === buttons.length &&
    codeBlocks.length === wrapped.length;
  if (!passed) allPass = false;
  console.log(
    `${slug}: code blocks=${codeBlocks.length}, buttons=${buttons.length}, wrapped=${wrapped.length} => ${passed ? "PASS" : "FAIL"}`,
  );
}

process.exitCode = allPass ? 0 : 1;
