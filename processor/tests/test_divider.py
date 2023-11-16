import unittest

from divider.divider import GenericDivider, AnchorDivider, ContentDivider, divider_factory


class Test(unittest.TestCase):
    def test_generic_divider(self):
        test_url = 'https://www.gutenberg.org/cache/epub/11/pg11-images.html'

        d = GenericDivider(url=test_url)
        chapters = []
        for chapter in d.divide():
            chapters.append(chapter)

        self.assertEqual(len(chapters), 12)
        self.assertTrue(chapters[0]['content'].startswith('Alice was beginning to get very tired of'))
        self.assertTrue('So she set to work, and very soon finished off the cake.' in chapters[0]['content'])
        self.assertEqual(chapters[0]['title'], 'CHAPTER I. Down the Rabbit-Hole')

        self.assertTrue(chapters[-1]['content'].startswith(
            '“Here!” cried Alice, quite forgetting in the flurry of the moment how large'))
        self.assertTrue('and the happy summer days.' in chapters[-1]['content'])
        self.assertEqual(chapters[-1]['title'], 'CHAPTER XII. Alice’s Evidence')

    def test_anchor_divider(self):
        test_url = 'https://www.gutenberg.org/cache/epub/46/pg46-images.html'
        d = AnchorDivider(url=test_url, anchor_list=['link1', 'link2', 'link3', 'link4', 'link5'])
        chapters = []
        for chapter in d.divide():
            chapters.append(chapter)

        self.assertEqual(len(chapters), 5)
        self.assertEqual(chapters[0]['title'], 'MARLEY’S GHOST')
        self.assertTrue(
            chapters[0]['content'].startswith('Marley was dead: to begin with. There is no doubt whatever about that.'))
        self.assertTrue(
            'went straight to bed, without undressing, and fell asleep upon the instant.' in chapters[0]['content'])

        self.assertEqual(chapters[-1]['title'], 'THE END OF IT')
        self.assertTrue(chapters[-1]['content'].startswith('Yes! and the bedpost was his own.'))
        self.assertTrue('as Tiny Tim observed, God bless Us, Every One!' in chapters[-1]['content'])

    def test_content_divider(self):
        test_url = 'https://www.gutenberg.org/cache/epub/1399/pg1399-images.html'
        d = ContentDivider(url=test_url, sep_filters={'name': 'h3'})
        chapters = []
        for chapter in d.divide():
            chapters.append(chapter)

        self.assertEqual(len(chapters), 34 + 35 + 32 + 23 + 33 + 32 + 31 + 19)
        self.assertEqual(chapters[0]['title'], 'PART ONE - Chapter 1')
        self.assertTrue(chapters[0]['content'].startswith('Happy families are all alike;'))
        self.assertTrue('he said to himself in despair, and found no answer.' in chapters[0]['content'])

        self.assertEqual(chapters[-1]['title'], 'PART EIGHT - Chapter 19')
        self.assertTrue(chapters[-1]['content'].startswith('Going out of the nursery and being again alone'))
        self.assertTrue('which I have the power to put into it.”' in chapters[-1]['content'])

    def test_divider_factory(self):
        ret = divider_factory('1', 'https://www.gutenberg.org/cache/epub/1399/pg1399-images.html', '')
        self.assertIsInstance(ret, GenericDivider)

        ret = divider_factory('2', 'https://www.gutenberg.org/cache/epub/1399/pg1399-images.html', '')
        self.assertIsInstance(ret, AnchorDivider)

        ret = divider_factory('3', 'https://www.gutenberg.org/cache/epub/1399/pg1399-images.html', '')
        self.assertIsInstance(ret, ContentDivider)
