export function getHijriDate(
  date: Date = new Date(),
  lang: "en" | "ar" = "en",
): string {
  const locale = lang === "ar" ? "ar-SA-u-ca-islamic" : "en-US-u-ca-islamic";

  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (e) {
    console.error("Hijri date formatting failed:", e);
    return "";
  }
}
