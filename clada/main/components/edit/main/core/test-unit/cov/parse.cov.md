20250620

# parseEdit Covenant

## Basic exact search/replace

parseEdit(<edit path="src/app.js"><search><![CDATA[hello]]></search><replace><![CDATA[goodbye]]></replace></edit>)
→
{ok: true, value: {mode: 'exact', path: 'src/app.js', search: 'hello', replace: 'goodbye', count: 1}}

## Exact search with count

parseEdit(<edit path="test.py" count="3"><search><![CDATA[foo]]></search><replace><![CDATA[bar]]></replace></edit>)
→
{ok: true, value: {mode: 'exact', path: 'test.py', search: 'foo', replace: 'bar', count: 3}}

## Range search with start/end

parseEdit(<edit path="main.js"><search-start><![CDATA[function calculate(]]></search-start><search-end><![CDATA[}]]></search-end><replace><![CDATA[function compute() { return 42; }]]></replace></edit>)
→
{ok: true, value: {mode: 'range', path: 'main.js', searchStart: 'function calculate(', searchEnd: '}', replace: 'function compute() { return 42; }', count: 1}}

## Range search with count

parseEdit(<edit path="config.xml" count="2"><search-start><![CDATA[<item>]]></search-start><search-end><![CDATA[</item>]]></search-end><replace><![CDATA[<item>replaced</item>]]></replace></edit>)
→
{ok: true, value: {mode: 'range', path: 'config.xml', searchStart: '<item>', searchEnd: '</item>', replace: '<item>replaced</item>', count: 2}}

## CDATA escaping

parseEdit(<edit path="data.xml"><search><![CDATA[text with ]]&gt; inside]]></search><replace><![CDATA[new ]]&gt; text]]></replace></edit>)
→
{ok: true, value: {mode: 'exact', path: 'data.xml', search: 'text with ]]> inside', replace: 'new ]]> text', count: 1}}

## Missing path attribute

parseEdit(<edit><search><![CDATA[test]]></search><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'missing_path_attribute'}

## Empty search element

parseEdit(<edit path="file.js"><search><![CDATA[]]></search><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'empty_search'}

## Empty replace element

parseEdit(<edit path="file.js"><search><![CDATA[old]]></search><replace><![CDATA[]]></replace></edit>)
→
{ok: false, error: 'empty_replace'}

## Missing search element (exact mode)

parseEdit(<edit path="file.js"><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'missing_search_element'}

## Missing replace element

parseEdit(<edit path="file.js"><search><![CDATA[old]]></search></edit>)
→
{ok: false, error: 'missing_replace_element'}

## Both search and search-start elements

parseEdit(<edit path="file.js"><search><![CDATA[old]]></search><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'conflicting_search_modes'}

## Range mode missing search-end

parseEdit(<edit path="file.js"><search-start><![CDATA[start]]></search-start><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'missing_search_end'}

## Range mode missing search-start

parseEdit(<edit path="file.js"><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'missing_search_start'}

## Invalid count attribute

parseEdit(<edit path="file.js" count="abc"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'invalid_count'}

## Zero count attribute

parseEdit(<edit path="file.js" count="0"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'invalid_count'}

## Negative count attribute

parseEdit(<edit path="file.js" count="-1"><search><![CDATA[old]]></search><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'invalid_count'}

## Empty search-start element

parseEdit(<edit path="file.js"><search-start><![CDATA[]]></search-start><search-end><![CDATA[end]]></search-end><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'empty_search_start'}

## Empty search-end element

parseEdit(<edit path="file.js"><search-start><![CDATA[start]]></search-start><search-end><![CDATA[]]></search-end><replace><![CDATA[new]]></replace></edit>)
→
{ok: false, error: 'empty_search_end'}