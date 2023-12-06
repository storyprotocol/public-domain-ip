import csv

from exceptions import CsvFormatError


class CsvReader:
    def __init__(self, file_path):
        self.file_path = file_path

    @staticmethod
    def is_header_valid(header_row):
        return ['title', 'author', 'url', 'type', 'params', 'series', 'nlp_option'] == header_row

    def get_series(self, row):
        clo_five = self.get_value_from_line(row, 5, '')
        if clo_five.upper() in ('FALSE', 'TRUE'):
            return ''
        return clo_five

    def get_divide_chapter(self, row):
        clo_five = self.get_value_from_line(row, 5, '')
        if clo_five.upper() in ('FALSE', 'TRUE'):
            return clo_five.upper() == 'TRUE'
        return False
    
    def get_nlp_option(self, row):
        clo_six = self.get_value_from_line(row, 6, '')
        if clo_six.upper() in ('CHAPTER', 'SERIES'):
            return clo_six.upper()
        return 'BOOK'

    @staticmethod
    def get_value_from_line(row, index, default=None):
        try:
            return row[index]
        except IndexError:
            if default is not None:
                return default
            raise

    def read(self):
        ret = []
        with open(self.file_path) as file:
            reader = csv.reader(file)
            if not self.is_header_valid(next(reader)):
                raise CsvFormatError('CSV file format is incorrect.')
            for line, row in enumerate(reader, 1):
                try:
                    ret.append({
                        'title': row[0],
                        'author': row[1],
                        'url': row[2],
                        'type': row[3],
                        'params': self.get_value_from_line(row, 4, ''),
                        'series': self.get_series(row),
                        'nlp_option': self.get_nlp_option(row)
                    })
                except IndexError:
                    raise CsvFormatError(f'CSV file row : {row} is incorrect.')

        return ret
