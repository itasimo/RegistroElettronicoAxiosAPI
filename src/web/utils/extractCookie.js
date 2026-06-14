/**
 * Extract a cookie value from a `Set-Cookie` header.
 *
 * This function accepts either a single header string or an array of header
 * strings (some HTTP clients expose `set-cookie` as an array). It performs an
 * exact cookie-name match (does not match substrings), decodes the value and
 * returns `null` when the header or cookie is not present.
 *
 * @param {string | string[] | null | undefined} setCookieHeader - The `Set-Cookie` header
 *        value or an array of such header strings.
 * @param {string} cookieName - Name of the cookie to extract (exact match).
 * @returns {string|null} The decoded cookie value, or `null` if not found.
 *
 * @example
 * extractCookie('foo=1; Path=/; HttpOnly', 'foo') // -> '1'
 * extractCookie(['foo=1; Path=/', 'bar=2; Path=/'], 'bar') // -> '2'
 */
export default function extractCookie(setCookieHeader, cookieName) {
  if (!setCookieHeader || !cookieName) return null;
  
  // Normalize the header to a single string
  const header = Array.isArray(setCookieHeader) 
    ? setCookieHeader.join(', ') 
    : String(setCookieHeader);
  
  // Escape special regex characters in the cookie name
  const escapedName = String(cookieName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Regex to find all occurrences of the cookie
  const cookiePattern = new RegExp(`${escapedName}=([^;]+)`, 'gi');
  
  let lastMatch = null;
  let match;
  
  // Find all matches and keep the last one
  while ((match = cookiePattern.exec(header)) !== null) {
    lastMatch = match[1];
  }
  
  return lastMatch ? decodeURIComponent(lastMatch) : null;
}