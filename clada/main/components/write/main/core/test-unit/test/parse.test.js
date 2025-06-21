20250119

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseWrite } from '../../src/parse.js';
import { parseDocument } from 'htmlparser2';

/**
 * Parse XML string to node using htmlparser2
 * Matches how orchestrator will provide nodes
 */
function xmlToNode(xml) {
  const dom = parseDocument(xml, { xmlMode: true });
  // Find first element node (skip text nodes)
  return dom.children.find(child => child.type === 'tag');
}

describe('parseWrite', () => {
  it('extracts path and content from valid write node', () => {
    const node = xmlToNode('<write path="file.txt"><![CDATA[hello]]></write>');
    
    const result = parseWrite(node);
    assert.ok(result.ok);
    assert.equal(result.value.path, 'file.txt');
    assert.equal(result.value.content, 'hello');
  });

  it('handles multi-line content preserving newlines', () => {
    const content = '#!/bin/bash\necho "line 1"\necho "line 2"\necho "line 3"';
    const node = xmlToNode(`<write path="script.sh"><![CDATA[${content}]]></write>`);
    
    const result = parseWrite(node);
    assert.ok(result.ok);
    assert.equal(result.value.content, content);
  });

  it('handles empty content', () => {
    const node = xmlToNode('<write path="empty.txt"><![CDATA[]]></write>');
    
    const result = parseWrite(node);
    assert.ok(result.ok);
    assert.equal(result.value.content, '');
  });

  it('errors on missing path attribute', () => {
    const node = xmlToNode('<write><![CDATA[content]]></write>');
    
    const result = parseWrite(node);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'malformed_xml');
    assert.match(result.error.message, /Missing required attribute: path/);
  });

  it('errors on empty path attribute', () => {
    const node = xmlToNode('<write path=""><![CDATA[content]]></write>');
    
    const result = parseWrite(node);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'path_validation');
    assert.match(result.error.message, /Empty path attribute/);
  });

  it('errors on non-CDATA content', () => {
    const node = xmlToNode('<write path="file.txt">raw content</write>');
    
    const result = parseWrite(node);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'malformed_xml');
    assert.match(result.error.message, /Content must be wrapped in CDATA/);
  });

  it('errors on missing content', () => {
    const node = xmlToNode('<write path="file.txt"></write>');
    
    const result = parseWrite(node);
    assert.ok(!result.ok);
    assert.equal(result.error.type, 'malformed_xml');
    assert.match(result.error.message, /Missing content/);
  });

  it('parses append attribute when true', () => {
    const node = xmlToNode('<write path="log.txt" append="true"><![CDATA[new line]]></write>');
    
    const result = parseWrite(node);
    assert.ok(result.ok);
    assert.equal(result.value.path, 'log.txt');
    assert.equal(result.value.content, 'new line');
    assert.equal(result.value.append, true);
  });

  it('parses append attribute when false', () => {
    const node = xmlToNode('<write path="data.txt" append="false"><![CDATA[overwrite]]></write>');
    
    const result = parseWrite(node);
    assert.ok(result.ok);
    assert.equal(result.value.path, 'data.txt');
    assert.equal(result.value.content, 'overwrite');
    assert.equal(result.value.append, false);
  });
});