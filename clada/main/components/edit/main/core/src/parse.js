// 20250121

/**
 * Parse an <edit> XML node into an edit task
 * @param {Object} node - Parsed XML node from htmlparser2
 * @returns {{ok: true, value: Object} | {ok: false, error: string}}
 */
export function parseEdit(node) {
  // Extract path attribute
  const path = node.attribs?.path;
  if (!path) {
    return { ok: false, error: 'missing_path_attribute' };
  }

  // Find child elements
  const childElements = getChildElements(node);
  const searchEl = findElement(childElements, 'search');
  const searchStartEl = findElement(childElements, 'search-start');
  const searchEndEl = findElement(childElements, 'search-end');
  const replaceEl = findElement(childElements, 'replace');

  // Detect mode and validate structure
  const hasExactSearch = !!searchEl;
  const hasRangeSearch = !!(searchStartEl || searchEndEl);

  if (hasExactSearch && hasRangeSearch) {
    return { ok: false, error: 'conflicting_search_modes' };
  }

  if (!hasExactSearch && !hasRangeSearch) {
    return { ok: false, error: 'missing_search_element' };
  }

  if (!replaceEl) {
    return { ok: false, error: 'missing_replace_element' };
  }

  // Extract count if present
  let count = 1;
  if (node.attribs?.count !== undefined) {
    const parsed = parseInt(node.attribs.count, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return { ok: false, error: 'invalid_count' };
    }
    count = parsed;
  }

  // Build result based on mode
  if (hasExactSearch) {
    // Exact mode validation and extraction
    const searchResult = extractCDATA(searchEl);
    if (!searchResult.ok) return searchResult;
    if (searchResult.value === '') {
      return { ok: false, error: 'empty_search' };
    }

    const replaceResult = extractCDATA(replaceEl);
    if (!replaceResult.ok) return replaceResult;

    return {
      ok: true,
      value: {
        mode: 'exact',
        path,
        search: searchResult.value,
        replace: replaceResult.value,
        count
      }
    };
  } else {
    // Range mode validation and extraction
    if (!searchStartEl) {
      return { ok: false, error: 'missing_search_start' };
    }
    if (!searchEndEl) {
      return { ok: false, error: 'missing_search_end' };
    }

    const startResult = extractCDATA(searchStartEl);
    if (!startResult.ok) return startResult;
    if (startResult.value === '') {
      return { ok: false, error: 'empty_search_start' };
    }

    const endResult = extractCDATA(searchEndEl);
    if (!endResult.ok) return endResult;
    if (endResult.value === '') {
      return { ok: false, error: 'empty_search_end' };
    }

    const replaceResult = extractCDATA(replaceEl);
    if (!replaceResult.ok) return replaceResult;

    return {
      ok: true,
      value: {
        mode: 'range',
        path,
        searchStart: startResult.value,
        searchEnd: endResult.value,
        replace: replaceResult.value,
        count
      }
    };
  }
}

/**
 * Get all child elements (excluding text nodes)
 * @param {Object} node - Parent node
 * @returns {Array} Child elements
 */
function getChildElements(node) {
  if (!node.children) return [];
  return node.children.filter(child => child.type === 'tag');
}

/**
 * Find first child element by name
 * @param {Array} elements - Child elements
 * @param {string} name - Element name to find
 * @returns {Object|null} Found element or null
 */
function findElement(elements, name) {
  return elements.find(el => el.name === name) || null;
}

/**
 * Extract CDATA content from element
 * Enforces that all content must be in CDATA sections per CML protocol
 * @param {Object} element - XML element
 * @returns {{ok: true, value: string} | {ok: false, error: string}}
 */
function extractCDATA(element) {
  if (!element.children || element.children.length === 0) {
    return { ok: true, value: '' };
  }

  // Collect text content from CDATA nodes only
  let textContent = '';
  
  for (const child of element.children) {
    if (child.type === 'text') {
      // Direct text nodes not allowed - all content must be in CDATA
      return { ok: false, error: 'malformed_xml' };
    } else if (child.type === 'cdata') {
      // CDATA nodes have their content as text children
      if (child.children) {
        for (const cdataChild of child.children) {
          if (cdataChild.type !== 'text') {
            return { ok: false, error: 'malformed_xml' };
          }
          textContent += cdataChild.data || '';
        }
      }
    } else {
      // Any other node type is malformed
      return { ok: false, error: 'malformed_xml' };
    }
  }
  
  // Unescape CDATA escape sequences
  const unescaped = textContent.replace(/]]&gt;/g, ']]>');
  
  return { ok: true, value: unescaped };
}