import importlib.util
import pathlib
import unittest

HERE = pathlib.Path(__file__).parent
MODULE = HERE / 'import_ai.py'
if MODULE.exists():
    spec = importlib.util.spec_from_file_location('ai_import', MODULE)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
else:
    m = None

class ImportTests(unittest.TestCase):
    def test_implementation_exists(self):
        self.assertTrue(MODULE.exists(), 'AI study importer has not been implemented')

    @unittest.skipIf(m is None, 'implementation pending')
    def test_links_and_images(self):
        mapping = {'agent/mcp.md': '/ai-study/java-guide/agent/mcp.md', 'README.md': '/ai-study/java-guide/index.md'}
        self.assertEqual(m.rewrite_href('../agent/mcp.md', 'rag/rag-basis.md', mapping), mapping['agent/mcp.md'])
        self.assertEqual(m.rewrite_href('https://javaguide.cn/ai/agent/mcp.html', 'x.md', mapping), mapping['agent/mcp.md'])
        self.assertEqual(m.rewrite_href('../README.md', 'rag/rag-basis.md', mapping), mapping['README.md'])
        self.assertEqual(m.rewrite_href('../../java/a.md', 'rag/a.md', mapping), 'https://javaguide.cn/java/a.html')
        out = m.normalize_body('![图](https://example.org/a.png)\n', 'x.md', mapping)
        self.assertIn('[原图：图](https://example.org/a.png)', out)
        self.assertNotIn('![', out)

    @unittest.skipIf(m is None, 'implementation pending')
    def test_fenced_code_untouched(self):
        code = '```java\nString s = "![x](a.png) {{ x }}";\n```'
        self.assertIn(code, m.normalize_body(code, 'x.md', {}))
        graph = '```mermaid\nflowchart LR\n A --> B\n```'
        self.assertIn(graph, m.normalize_body(graph, 'x.md', {}))

    @unittest.skipIf(m is None, 'implementation pending')
    def test_metadata_and_h1(self):
        meta, body = m.split_frontmatter('---\ntitle: Example\ndescription: Detail\n---\nHello\n')
        self.assertEqual(meta['title'], 'Example')
        self.assertEqual(body, 'Hello\n')
        self.assertNotIn('\n# ', '\n' + m.normalize_body('# Old title\n## Part\nText\n', 'x.md', {}))

    @unittest.skipIf(m is None, 'implementation pending')
    def test_include_and_unsafe_markup(self):
        out = m.normalize_body('Text\n<!-- @include: @ads.md -->\n<script>alert(1)</script>\n{{ attack }}\n', 'x.md', {})
        self.assertNotIn('@include:', out)
        self.assertNotIn('<script>', out)
        self.assertNotIn('{{', out)
        self.assertIn('Text', out)

    @unittest.skipIf(m is None, 'implementation pending')
    def test_blob_integrity(self):
        self.assertEqual(m.blob_sha(b'hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
        with self.assertRaises(ValueError):
            m.verify_blob(b'hello\n', '0' * 40)

    @unittest.skipIf(m is None, 'implementation pending')
    def test_duplicate_heading_and_tabs(self):
        out = m.normalize_body('## 总结\n一\n## 总结\n二\n::: tabs\n@tab Java\n```java\na\n```\n:::\n', 'x.md', {})
        self.assertEqual(out.count('## 总结\n'), 1)
        self.assertNotIn('::: tabs', out)
        self.assertIn('Java', out)
        self.assertIn('二', out)

if __name__ == '__main__':
    unittest.main()
