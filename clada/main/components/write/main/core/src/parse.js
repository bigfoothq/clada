20250120

/**
 * Parses write XML node to extract path and content
 * @param {Object} node - htmlparser2 node with structure {name, attribs, children}
 * @returns {{ok: true, value: {path: string, content: string}} | {ok: false, error: {type: string, message: string}}}
 */
function parseWrite(node) {
  // Validate node structure
  if (!node || !node.attribs) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Invalid node structure' }
    };
  }

  // Check path attribute
  if (!('path' in node.attribs)) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Missing required attribute: path' }
    };
  }

  if (node.attribs.path === '') {
    return {
      ok: false,
      error: { type: 'path_validation', message: 'Empty path attribute' }
    };
  }

  // Check for children
  if (!node.children || node.children.length === 0) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Missing content' }
    };
  }

  // Check for any text nodes (mixed content is not allowed)
  const hasTextNode = node.children.some(child => 
    child.type === 'text' && child.data && child.data.trim() !== ''
  );
  
  // Check for CDATA content
  const cdataNode = node.children.find(child => child.type === 'cdata');
  
  if (hasTextNode) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Content must be wrapped in CDATA' }
    };
  }
  
  if (!cdataNode) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Content must be wrapped in CDATA' }
    };
  }

  // Extract content from CDATA node
  let content = '';
  if (cdataNode) {
    // For CDATA nodes, the content is in the children as text nodes
    const cdataChildren = cdataNode.children || [];
    content = cdataChildren
      .filter(child => child.type === 'text')
      .map(child => child.data || '')
      .join('');
  }

  // Build result object
  const result = {
    ok: true,
    value: {
      path: node.attribs.path,
      content: content
    }
  };

  // Parse append attribute if present and valid
  if ('append' in node.attribs) {
    if (node.attribs.append === 'true') {
      result.value.append = true;
    } else if (node.attribs.append === 'false') {
      result.value.append = false;
    }
    // Invalid values are ignored (append remains undefined)
  }

  return result;
}

export { parseWrite };