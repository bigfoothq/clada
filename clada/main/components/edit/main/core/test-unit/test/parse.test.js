20250620

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEdit } from '../../src/parse.js';
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

describe('parseEdit', () => {
  it('parses basic exact search/replace', () => {
    const xml = '<edit path="src/app.js"><search><![CDATA[hello]]></search><replace><![CDATA[goodbye]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'exact',
        path: 'src/app.js',
        search: 'hello',
        replace: 'goodbye',
        count: 1
      }
    });
  });

  it('parses exact search with count', () => {
    const xml = '<edit path="test.py" count="3"><search><![CDATA[foo]]></search><replace><![CDATA[bar]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'exact',
        path: 'test.py',
        search: 'foo',
        replace: 'bar',
        count: 3
      }
    });
  });

  it('parses range search with start/end', () => {
    const xml = '<edit path="main.js"><search-start><![CDATA[function calculate(]]></search-start><search-end><![CDATA[}]]></search-end><replace><![CDATA[function compute() { return 42; }]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'range',
        path: 'main.js',
        searchStart: 'function calculate(',
        searchEnd: '}',
        replace: 'function compute() { return 42; }',
        count: 1
      }
    });
  });

  it('parses range search with count', () => {
    const xml = '<edit path="config.xml" count="2"><search-start><![CDATA[<item>]]></search-start><search-end><![CDATA[</item>]]></search-end><replace><![CDATA[<item>replaced</item>]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'range',
        path: 'config.xml',
        searchStart: '<item>',
        searchEnd: '</item>',
        replace: '<item>replaced</item>',
        count: 2
      }
    });
  });

  it('handles CDATA escaping', () => {
    const xml = '<edit path="data.xml"><search><![CDATA[text with ]]&gt; inside]]></search><replace><![CDATA[new ]]&gt; text]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'exact',
        path: 'data.xml',
        search: 'text with ]]> inside',
        replace: 'new ]]> text',
        count: 1
      }
    });
  });

  it('returns error for missing path attribute', () => {
    const xml = '<edit><search><![CDATA[test]]></search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'missing_path_attribute'
    });
  });

  it('returns error for empty search element', () => {
    const xml = '<edit path="file.js"><search><![CDATA[]]></search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'empty_search'
    });
  });

  it('allows empty replace element', () => {
    const xml = '<edit path="file.js"><search><![CDATA[old]]></search><replace><![CDATA[]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: true,
      value: {
        mode: 'exact',
        path: 'file.js',
        search: 'old',
        replace: '',
        count: 1
      }
    });
  });

  it('returns error for missing search element in exact mode', () => {
    const xml = '<edit path="file.js"><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'missing_search_element'
    });
  });

  it('returns error for missing replace element', () => {
    const xml = '<edit path="file.js"><search><![CDATA[old]]></search></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'missing_replace_element'
    });
  });

  it('returns error for both search and search-start elements', () => {
    const xml = '<edit path="file.js"><search><![CDATA[old]]></search><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'conflicting_search_modes'
    });
  });

  it('returns error for range mode missing search-end', () => {
    const xml = '<edit path="file.js"><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'missing_search_end'
    });
  });

  it('returns error for range mode missing search-start', () => {
    const xml = '<edit path="file.js"><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'missing_search_start'
    });
  });

  it('returns error for invalid count attribute', () => {
    const xml = '<edit path="file.js" count="abc"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'invalid_count'
    });
  });

  it('returns error for zero count attribute', () => {
    const xml = '<edit path="file.js" count="0"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'invalid_count'
    });
  });

  it('returns error for negative count attribute', () => {
    const xml = '<edit path="file.js" count="-1"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'invalid_count'
    });
  });

  it('returns error for empty search-start element', () => {
    const xml = '<edit path="file.js"><search-start><![CDATA[]]></search-start><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'empty_search_start'
    });
  });

  it('returns error for empty search-end element', () => {
    const xml = '<edit path="file.js"><search-start><![CDATA[start]]></search-start><search-end><![CDATA[]]></search-end><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'empty_search_end'
    });
  });

  it('returns error for mixed content - text outside CDATA in search', () => {
    const xml = '<edit path="file.js"><search>raw text</search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'malformed_xml'
    });
  });

  it('returns error for mixed content - text outside CDATA in replace', () => {
    const xml = '<edit path="file.js"><search><![CDATA[old]]></search><replace>raw text</replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'malformed_xml'
    });
  });

  it('returns error for mixed content - text and CDATA together', () => {
    const xml = '<edit path="file.js"><search>text<![CDATA[more]]>text</search><replace><![CDATA[new]]></replace></edit>';
    const node = xmlToNode(xml);
    const result = parseEdit(node);
    
    assert.deepEqual(result, {
      ok: false,
      error: 'malformed_xml'
    });
  });
});