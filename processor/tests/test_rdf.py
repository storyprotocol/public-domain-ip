import unittest

from divider.rdf import RdfParser


class Test(unittest.TestCase):
    def test_paser_rdf(self):
        test_rdf_url = 'https://www.gutenberg.org/cache/epub/1399/pg1399.rdf'

        p = RdfParser(test_rdf_url)
        info = p.parse()

        self.assertEqual(info['title'], 'Anna Karenina')
        self.assertEqual(info['author'], 'Tolstoy, Leo, graf')
        self.assertEqual(info['publisher'], 'Project Gutenberg')
        self.assertEqual(info['issued'], '1998-07-01')
        self.assertEqual(info['rights'], 'Public domain in the USA.')
        self.assertEqual(info['language'], 'en')

        self.assertIn('Adultery -- Fiction', info['subjects'])
        self.assertIn('Didactic fiction', info['subjects'])
        self.assertIn('Love stories', info['subjects'])
        self.assertIn('Married women -- Fiction', info['subjects'])
        self.assertIn('Russia -- Fiction', info['subjects'])
