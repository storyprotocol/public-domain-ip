import csv

from exceptions import CsvFormatError


class CsvReader:
    def __init__(self, file_path):
        self.file_path = file_path

    @staticmethod
    def is_header_valid(header_row):
        return ['title', 'author', 'url', 'type', 'params', 'series'] == header_row

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
                        'params': row[4],
                        'series': row[5],
                    })
                except IndexError:
                    raise CsvFormatError(f'CSV file row : {row} is incorrect.')

        return ret
