import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog", ({ data }) => {
    // Filter out draft posts
    return data.draft !== true;
  });

  // Sort posts by date (newest first)
  const sortedPosts = blog.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    // Channel metadata
    title: "Ahmed Adel - Blog",
    description:
      "Thoughts on AI security, Python development, and open source contributions. Security researcher focused on LLM vulnerabilities and Python internals.",
    site: context.site!,
    // RSS items from blog posts
    items: sortedPosts.map((post) => {
      // Remove file extension from id to get the slug
      const slug = post.id.replace(/\.(mdx?|md)$/, "");
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${slug}/`,
        // Optional: include categories from tags
        categories: post.data.tags,
        // Optional: include author
        author: "Ahmed Adel",
      };
    }),
    // Additional channel elements
    customData: `<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<managingEditor>ahmed@ahmedalderai.com (Ahmed Adel)</managingEditor>
<webMaster>ahmed@ahmedalderai.com (Ahmed Adel)</webMaster>
<copyright>Copyright ${new Date().getFullYear()} Ahmed Adel. All rights reserved.</copyright>`,
    // Use pretty XML formatting
    trailingSlash: false,
  });
}
