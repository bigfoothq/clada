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
  if (!node.attribs.path) {
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

  // Extract content from CDATA
  if (!node.children || node.children.length === 0) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Missing content' }
    };
  }

  // Find CDATA node
  const cdataNode = node.children.find(child => child.type === 'cdata');
  if (!cdataNode) {
    return {
      ok: false,
      error: { type: 'malformed_xml', message: 'Content must be wrapped in CDATA' }
    };
  }

  // Extract content from CDATA node
  const content = cdataNode.data || '';

  return {
    ok: true,
    value: {
      path: node.attribs.path,
      content: content
    }
  };
}

export { parseWrite };