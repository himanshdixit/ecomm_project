const ALLOWED_TAGS = new Set(["p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li", "h2", "h3", "blockquote", "a"]);
const BLOCKED_TAGS = ["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "meta", "link", "base"];

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeEntities = (value = "") =>
  String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const sanitizeHref = (value = "") => {
  const trimmed = String(value).trim();

  if (!trimmed) {
    return "";
  }

  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed.replace(/\"/g, "&quot;");
  }

  return "";
};

export const stripHtml = (value = "") => {
  const withoutTags = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h2|h3|li|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, " ");

  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
};

export const plainTextToRichText = (value = "") => {
  const blocks = String(value)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return "";
  }

  return blocks
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export const sanitizeRichTextHtml = (value = "") => {
  let html = String(value || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(new RegExp(`<(${BLOCKED_TAGS.join("|")})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, "gi"), "")
    .replace(new RegExp(`<(${BLOCKED_TAGS.join("|")})\\b[^>]*\\/?>(?:<\\/\\1>)?`, "gi"), "")
    .replace(/<\s*div\b[^>]*>/gi, "<p>")
    .replace(/<\s*\/\s*div\s*>/gi, "</p>")
    .replace(/<(?!\/?[a-z0-9]+\b)[^>]+>/gi, "");

  html = html.replace(/<\s*(\/?)([a-z0-9]+)([^>]*)>/gi, (match, closing, rawTagName, rawAttrs) => {
    const tagName = String(rawTagName || "").toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      return "";
    }

    if (closing) {
      return `</${tagName}>`;
    }

    if (tagName === "a") {
      const hrefMatch = String(rawAttrs || "").match(/href\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))/i);
      const href = sanitizeHref(hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || "");
      return href ? `<a href="${href}" rel="noopener noreferrer">` : "<a>";
    }

    return `<${tagName}>`;
  });

  html = html
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<blockquote>\s*<\/blockquote>/gi, "")
    .replace(/<p>(\s*<br\s*\/?>\s*)+<\/p>/gi, "")
    .trim();

  return html;
};

export const normalizeRichTextInput = (value = "") => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (/<\/?[a-z][\s\S]*>/i.test(normalized)) {
    return sanitizeRichTextHtml(normalized);
  }

  return plainTextToRichText(normalized);
};

export const createRichTextMarkup = (value = "") => ({
  __html: sanitizeRichTextHtml(normalizeRichTextInput(value)),
});
