// 20250121
// Debug script to understand htmlparser2 CDATA parsing

import { parseDocument } from 'htmlparser2';

// Test cases
const testCases = [
  '<search><![CDATA[hello]]></search>',
  '<search><![CDATA[]]></search>',
  '<search>raw text</search>',
  '<search>text<![CDATA[more]]>text</search>'
];

testCases.forEach((xml, index) => {
  console.log(`\n=== Test ${index + 1}: ${xml} ===`);
  
  const fullXml = `<edit path="test.js">${xml}<replace><![CDATA[new]]></replace></edit>`;
  const dom = parseDocument(fullXml, { xmlMode: true });
  const editNode = dom.children.find(child => child.type === 'tag' && child.name === 'edit');
  const searchNode = editNode.children.find(child => child.type === 'tag' && child.name === 'search');
  
  console.log('Number of children:', searchNode.children.length);
  
  if (searchNode.children.length > 0) {
    searchNode.children.forEach((child, i) => {
      console.log(`Child ${i}: type="${child.type}", data="${child.data || ''}", name="${child.name || ''}"`);
      if (child.type === 'cdata' && child.children) {
        console.log(`  CDATA has ${child.children.length} children:`);
        child.children.forEach((cdataChild, j) => {
          console.log(`    Child ${j}: type="${cdataChild.type}", data="${cdataChild.data || ''}"`);
        });
      }
    });
  }
});