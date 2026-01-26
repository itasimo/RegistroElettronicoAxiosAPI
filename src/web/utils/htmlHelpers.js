/**
 * Combined HTML helpers: parser + DOM helper utilities that work in both
 * browser `Document` environments and Node.js using `node-html-parser`.
 */

/**
 * Parse an HTML string and return a DOM-like root suitable for querying.
 * In browsers returns a `Document`; in Node.js returns node-html-parser root.
 * @param {string} htmlString
 */
export function htmlParser(htmlString) {
    let doc;

    if (typeof DOMParser !== "undefined") {
        const parser = new DOMParser();
        doc = parser.parseFromString(htmlString, "text/html");
    } else {
        // Lazy require to avoid bundling node-only dependency in browser builds
        // eslint-disable-next-line global-require
        const { parse: parseHTML } = require("node-html-parser");
        doc = parseHTML(htmlString);
    }

    return doc;
}

/**
 * Get trimmed textual content of an element in a cross-runtime way.
 * Returns empty string for null/undefined.
 * @param {any} el
 * @returns {string}
 */
export function innerText(el) {
    if (!el) return "";
    
    // Handle string inputs (HTML strings)
    if (typeof el === "string") {
        // Remove script and style tags and their content
        let text = el.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // Remove HTML comments
        text = text.replace(/<!--[\s\S]*?-->/g, '');
        
        // Replace block-level elements with newlines
        text = text.replace(/<(br|p|div|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|section|article|header|footer|nav)[^>]*>/gi, '\n');
        
        // Remove all remaining HTML tags
        text = text.replace(/<[^>]+>/g, '');
        
        // Decode HTML entities
        text = text.replace(/&nbsp;/g, ' ')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'");
        
        // Collapse multiple whitespace characters and trim
        text = text.replace(/\s+/g, ' ')
                   .replace(/\n\s+/g, '\n')
                   .replace(/\s+\n/g, '\n')
                   .replace(/\n+/g, '\n')
                   .trim();
        
        return text;
    }
    
    // Original DOM element handling
    if (typeof el.textContent !== "undefined" && el.textContent !== null) return String(el.textContent).trim();
    if (typeof el.text !== "undefined" && el.text !== null) return String(el.text).trim();
    if (typeof el.innerText !== "undefined" && el.innerText !== null) return String(el.innerText).trim();
    
    try {
        return String(el.toString()).trim();
    } catch (e) {
        return "";
    }
}

/**
 * Get inner HTML of an element in a cross-runtime way.
 * Returns empty string for null/undefined.
 * @param {any} el
 * @returns {string}
 */
export function innerHTML(el) {
    if (!el) return "";
    if (typeof el.innerHTML !== "undefined" && el.innerHTML !== null) return String(el.innerHTML);
    if (typeof el.toString === "function") return String(el.toString());
    return "";
}

/**
 * Get attribute value in a cross-runtime way.
 * Returns null when the attribute is not present.
 * @param {any} el
 * @param {string} name
 * @returns {string|null}
 */
export function attrOf(el, name) {
    if (!el) return null;
    if (typeof el.getAttribute === "function") return el.getAttribute(name) ?? null;
    if (el.attrs && typeof el.attrs === "object") return el.attrs[name] ?? null;
    if (el.rawAttrs && typeof el.rawAttrs === "string") {
        const m = new RegExp(name + "=\\\"([^\\\"]*)\\\"").exec(el.rawAttrs);
        return m ? m[1] : null;
    }
    return null;
}

/**
 * Get all the data-* attribute values in a cross-runtime way.
 * Returns an empty object when no data attributes are present.
 * @param {any} el
 * @returns {Object}
 * @example
 * // Given <div id="myDiv" data-user="123" data-role="admin"></div>
 * const div = document.getElementById("myDiv");
 * const dataAttrs = dataset(div);
 * console.log(dataAttrs);
 * // Output: { user: "123", role: "admin" }
 * 
 * @example
 * // In Node.js with node-html-parser
 * const { parse } = require("node-html-parser");
 * const root = parse('<div id="myDiv" data-user="123" data-role="admin"></div>');
 * const div = root.querySelector("#myDiv");
 * const dataAttrs = dataset(div);
 * console.log(dataAttrs);
 * // Output: { user: "123", role: "admin" }
 * 
 * @example
 * // Handling absence of data-* attributes
 * const div = document.createElement("div");
 * const dataAttrs = dataset(div);
 * console.log(dataAttrs);
 * // Output: {}
 * 
 * @example
 * // Given <div id="myDiv" data-user="123" data-my-role="admin"></div>
 * const div = document.getElementById("myDiv");
 * const dataAttrs = dataset(div);
 * console.log(dataAttrs["myRole"]);
 * // Output: "admin"
 */
export function dataset(el) {
    if (!el) return {};

    // If an HTML string is passed, parse and use the first element
    if (typeof el === "string") {
        const doc = htmlParser(el);
        let first = null;
        if (doc && doc.body && doc.body.firstElementChild) first = doc.body.firstElementChild;
        else if (doc && typeof doc.querySelector === "function") first = doc.querySelector("*");
        else if (doc && Array.isArray(doc.childNodes) && doc.childNodes.length) first = doc.childNodes.find(n => n && n.nodeType === 1) || doc.childNodes[0];
        if (!first) return {};
        return dataset(first);
    }

    const out = {};

    const hyphenToCamel = (s) => s.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());

    // Browser DOM: use element.dataset when available
    if (el.dataset && typeof el.dataset === "object") {
        for (const k in el.dataset) {
            if (Object.prototype.hasOwnProperty.call(el.dataset, k)) out[k] = el.dataset[k];
        }
        return out;
    }

    // Browser DOM with attributes NamedNodeMap
    if (el.attributes && typeof el.attributes.length === "number") {
        for (let i = 0; i < el.attributes.length; i++) {
            const a = el.attributes[i];
            if (!a || !a.name) continue;
            if (a.name.startsWith("data-")) {
                const name = a.name.slice(5);
                out[hyphenToCamel(name)] = a.value;
            }
        }
        return out;
    }

    // node-html-parser: attrs object
    if (el.attrs && typeof el.attrs === "object") {
        for (const fullName of Object.keys(el.attrs)) {
            if (fullName && fullName.startsWith("data-")) {
                const name = fullName.slice(5);
                out[hyphenToCamel(name)] = el.attrs[fullName];
            }
        }
        return out;
    }

    // node-html-parser: rawAttrs string
    if (el.rawAttrs && typeof el.rawAttrs === "string") {
        const re = /\bdata-([a-zA-Z0-9:-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
        let m;
        while ((m = re.exec(el.rawAttrs)) !== null) {
            const name = m[1];
            const value = m[2] ?? m[3] ?? m[4] ?? "";
            out[hyphenToCamel(name)] = value;
        }
        return out;
    }

    return out;
}

/**
 * Query multiple nodes and always return a plain array.
 * @param {any} root
 * @param {string} selector
 * @returns {Array<any>}
 */
export function querySelectorAll(root, selector) {
    if (!root) return [];
    if (typeof root.querySelectorAll === "function") return Array.from(root.querySelectorAll(selector));
    if (typeof root.querySelectorAll !== "undefined") return root.querySelectorAll(selector) || [];
    return [];
}

/**
 * Query first matching node or null.
 * @param {any} root
 * @param {string} selector
 * @returns {any|null}
 */
export function querySelector(root, selector) {
    if (!root) return null;
    if (typeof root.querySelector === "function") return root.querySelector(selector);
    if (typeof root.querySelectorAll !== "undefined") {
        const nodes = root.querySelectorAll(selector);
        return (nodes && nodes.length) ? nodes[0] : null;
    }
    return null;
}

/**
 * Convenience: find an <a> inside `el` and return its `href` (or null).
 * @param {any} el
 * @returns {string|null}
 */
export function firstAnchorHref(el) {
    const a = querySelector(el, "a");
    return attrOf(a, "href");
}


/**
 * Helper function to decode HTML entities in text
 * Converts HTML entity codes (e.g., &#39;, &quot;) to their character equivalents
 * @param {string} text - Text potentially containing HTML entities
 * @returns {string} Text with HTML entities decoded
 */
export function decodeHtmlEntities(text) {
    return text
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&#x([a-f\d]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&([a-z]+);/gi, (match, entity) => {
            const entities = {
                'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', 'apos': "'", 'nbsp': ' '
            };
            return entities[entity.toLowerCase()] || match;
        });
}

const defaultExport = {
    htmlParser,
    innerText,
    attrOf,
    dataset,
    querySelectorAll,
    querySelector,
    firstAnchorHref,
    decodeHtmlEntities,
};

export default defaultExport;
