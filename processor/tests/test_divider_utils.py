import unittest

from divider.constants import SPACE_STR
from divider.utils import get_worlds, list_to_content, clean_content, parse_anchor_params


class Test(unittest.TestCase):
    def test_get_worlds(self):
        ret = get_worlds('where are you?')
        self.assertEqual(ret, 3)

        ret = get_worlds('Actions speak louder than words.')
        self.assertEqual(ret, 5)

        ret = get_worlds('A journey of a thousand miles begins with a single step.')
        self.assertEqual(ret, 11)

        ret = get_worlds("Don't put all your eggs in one basket.")
        self.assertEqual(ret, 8)

    def test_list_to_content(self):
        ret = list_to_content(['where', 'are', 'you'])
        self.assertEqual(ret, 'where\nare\nyou')

        ret = list_to_content(['where', 'are', '', 'you'])
        self.assertEqual(ret, 'where\nare\nyou')

        ret = list_to_content(['where', 'are', '\n', 'you'])
        self.assertEqual(ret, 'where\nare\nyou')

    def test_clean_content(self):
        ret = clean_content('where       are      you?')
        self.assertEqual(ret, 'where are you?')

        ret = clean_content('where    {223} {223}  are  [232] {2323} [223]    you?')
        self.assertEqual(ret, 'where are you?')

        ret = clean_content('where  @#$SPACE*(&   {223} {223}  are  [232] {2323} [223]    you?')
        self.assertEqual(ret, 'where \n are you?')

    def test_parse_anchor_params(self):
        ret = parse_anchor_params('link01,link02,link03,link04,link05')
        self.assertEqual(ret, ['link01', 'link02', 'link03', 'link04', 'link05'])

        ret = parse_anchor_params('pre1,link{01-05}')
        self.assertEqual(ret, ['pre1', 'link01', 'link02', 'link03', 'link04', 'link05'])

        ret = parse_anchor_params('pre{01-05},link{01-05}')
        self.assertEqual(ret, ['pre01', 'pre02', 'pre03', 'pre04', 'pre05', 'link01',
                               'link02', 'link03', 'link04', 'link05'])

        ret = parse_anchor_params('link{01-05}')
        self.assertEqual(ret, ['link01', 'link02', 'link03', 'link04', 'link05'])

        ret = parse_anchor_params('link{01-12}')
        self.assertEqual(ret, ['link01', 'link02', 'link03', 'link04', 'link05', 'link06',
                               'link07', 'link08', 'link09', 'link10', 'link11', 'link12'])

        ret = parse_anchor_params('chapter{01-12}')
        self.assertEqual(ret, ['chapter01', 'chapter02', 'chapter03', 'chapter04', 'chapter05', 'chapter06',
                               'chapter07', 'chapter08', 'chapter09', 'chapter10', 'chapter11', 'chapter12'])
