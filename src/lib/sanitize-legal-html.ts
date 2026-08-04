const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const VOID_TAGS = new Set(["br", "hr"]);

const ALLOWED_ATTRIBUTES = new Set([
  "href",
  "target",
  "rel",
  "colspan",
  "rowspan",
  "scope",
]);

const ALLOWED_REL_VALUES = new Set(["nofollow", "noopener", "noreferrer"]);
const ALLOWED_SCOPE_VALUES = new Set(["col", "colgroup", "row", "rowgroup"]);

/**
 * Kizárólag a jogi dokumentumokhoz szükséges, biztonságos HTML-részhalmazt
 * engedi át. Nem támaszkodik böngésző API-ra, ezért SSR és kliensoldalon azonos.
 */
export function sanitizeLegalHtml(html: string) {
  let sanitized = "";
  let cursor = 0;

  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor);

    if (tagStart === -1) {
      sanitized += html.slice(cursor);
      break;
    }

    sanitized += html.slice(cursor, tagStart);

    const tagEnd = findTagEnd(html, tagStart + 1);
    if (tagEnd === -1) {
      sanitized += "&lt;" + html.slice(tagStart + 1);
      break;
    }

    const rawTag = html.slice(tagStart + 1, tagEnd);
    sanitized += sanitizeTag(rawTag);
    cursor = tagEnd + 1;
  }

  return sanitized;
}

function findTagEnd(html: string, start: number) {
  let quote: '"' | "'" | null = null;

  for (let index = start; index < html.length; index += 1) {
    const character = html[index];

    if (quote) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === ">") {
      return index;
    }
  }

  return -1;
}

function sanitizeTag(rawTag: string) {
  const tagMatch = rawTag.match(/^\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)/);
  if (!tagMatch) {
    return "";
  }

  const closing = tagMatch[1] === "/";
  const tagName = tagMatch[2].toLowerCase();

  if (!ALLOWED_TAGS.has(tagName)) {
    return "";
  }

  if (closing) {
    return VOID_TAGS.has(tagName) ? "" : `</${tagName}>`;
  }

  const attributes = parseAttributes(rawTag.slice(tagMatch[0].length));
  const opensNewWindow = attributes.some(
    ([name, value]) => name === "target" && value === "_blank",
  );

  if (tagName === "a" && opensNewWindow) {
    const relAttribute = attributes.find(([name]) => name === "rel");
    if (relAttribute) {
      relAttribute[1] += " noopener noreferrer";
    } else {
      attributes.push(["rel", "noopener noreferrer"]);
    }
  }

  const safeAttributes: string[] = [];
  const seenAttributes = new Set<string>();

  for (const [name, value] of attributes) {
    if (seenAttributes.has(name)) {
      continue;
    }

    const safeAttribute = sanitizeAttribute(tagName, name, value);
    if (safeAttribute) {
      seenAttributes.add(name);
      safeAttributes.push(safeAttribute);
    }
  }

  return `<${tagName}${safeAttributes.length ? ` ${safeAttributes.join(" ")}` : ""}>`;
}

function parseAttributes(source: string) {
  const attributes: Array<[string, string]> = [];
  let cursor = 0;

  while (cursor < source.length) {
    while (/\s/.test(source[cursor] ?? "")) {
      cursor += 1;
    }

    if (cursor >= source.length || source[cursor] === "/") {
      break;
    }

    const nameMatch = source.slice(cursor).match(/^[^\s=/>]+/);
    if (!nameMatch) {
      cursor += 1;
      continue;
    }

    const name = nameMatch[0].toLowerCase();
    cursor += nameMatch[0].length;

    while (/\s/.test(source[cursor] ?? "")) {
      cursor += 1;
    }

    let value = "";
    if (source[cursor] === "=") {
      cursor += 1;
      while (/\s/.test(source[cursor] ?? "")) {
        cursor += 1;
      }

      const quote = source[cursor];
      if (quote === '"' || quote === "'") {
        cursor += 1;
        const valueStart = cursor;
        while (cursor < source.length && source[cursor] !== quote) {
          cursor += 1;
        }
        value = source.slice(valueStart, cursor);
        if (source[cursor] === quote) {
          cursor += 1;
        }
      } else {
        const valueMatch = source.slice(cursor).match(/^[^\s>]+/);
        value = valueMatch?.[0] ?? "";
        cursor += value.length;
      }
    }

    attributes.push([name, value]);
  }

  return attributes;
}

function sanitizeAttribute(tagName: string, name: string, rawValue: string) {
  if (!ALLOWED_ATTRIBUTES.has(name)) {
    return null;
  }

  if (name === "href") {
    if (tagName !== "a" || !isSafeHref(rawValue)) {
      return null;
    }
    rawValue = decodeHtmlEntities(rawValue);
  } else if (name === "target") {
    if (tagName !== "a" || !["_blank", "_self"].includes(rawValue)) {
      return null;
    }
  } else if (name === "rel") {
    if (tagName !== "a") {
      return null;
    }

    const safeRel = rawValue
      .toLowerCase()
      .split(/\s+/)
      .filter((value) => ALLOWED_REL_VALUES.has(value));

    if (safeRel.length === 0) {
      return null;
    }

    rawValue = [...new Set(safeRel)].join(" ");
  } else if (name === "colspan" || name === "rowspan") {
    if (
      !["td", "th"].includes(tagName) ||
      !/^(?:[1-9]|[1-9][0-9]|100)$/.test(rawValue)
    ) {
      return null;
    }
  } else if (name === "scope") {
    if (tagName !== "th" || !ALLOWED_SCOPE_VALUES.has(rawValue.toLowerCase())) {
      return null;
    }
    rawValue = rawValue.toLowerCase();
  }

  return `${name}="${escapeAttribute(rawValue)}"`;
}

function isSafeHref(rawHref: string) {
  const decodedHref = decodeHtmlEntities(rawHref).trim();
  const protocolProbe = [...decodedHref]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 0x20 && codePoint !== 0x7f;
    })
    .join("");

  if (
    decodedHref.startsWith("/") ||
    decodedHref.startsWith("./") ||
    decodedHref.startsWith("../") ||
    decodedHref.startsWith("#")
  ) {
    return !decodedHref.startsWith("//");
  }

  return /^(?:https?:|mailto:|tel:)/i.test(protocolProbe);
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    colon: ":",
    newline: "\n",
    tab: "\t",
  };

  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));?/gi,
    (match, decimal: string, hexadecimal: string, named: string) => {
      const codePoint = decimal
        ? Number.parseInt(decimal, 10)
        : hexadecimal
          ? Number.parseInt(hexadecimal, 16)
          : null;

      if (codePoint !== null) {
        if (
          !Number.isFinite(codePoint) ||
          codePoint < 0 ||
          codePoint > 0x10ffff
        ) {
          return "";
        }
        return String.fromCodePoint(codePoint);
      }

      return namedEntities[named.toLowerCase()] ?? match;
    },
  );
}

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
