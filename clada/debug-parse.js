20250121

import { parseDocument } from 'htmlparser2';

function inspectNode(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}type: "${node.type}", name: "${node.name || ''}", data: ${node.data ? `"${node.data}"` : 'undefined'}`);
  
  if (node.children && node.children.length > 0) {
    console.log(`${indent}children: [`);
    node.children.forEach((child, i) => {
      console.log(`${indent}  [${i}]:`);
      inspectNode(child, depth + 2);
    });
    console.log(`${indent}]`);
  }
}

// Test actual structure
const tests = [
  '<search><![CDATA[hello]]></search>',
  '<search><![CDATA[text with ]]&gt; inside]]></search>',
  '<search>raw text</search>',
  '<search>text<![CDATA[more]]></search>',
  '<search><![CDATA[]]></search>'
];

tests.forEach((xml, i) => {
  console.log(`\n=== Test ${i + 1} ===`);
  console.log(`XML: ${xml}`);
  const dom = parseDocument(xml, { xmlMode: true });
  const searchNode = dom.children.find(c => c.type === 'tag' && c.name === 'search');
  
  if (searchNode) {
    inspectNode(searchNode);
  }
});