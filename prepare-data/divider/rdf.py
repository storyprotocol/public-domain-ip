from rdflib import Graph, Namespace


class RdfParser:
    def __init__(self, rdf_url):
        self.g = Graph()
        self.g.parse(rdf_url, format="application/rdf+xml")

    def get_basic_info(self):
        query = """
        SELECT ?ebook ?title ?author ?publisher ?issued ?rights ?language 
    WHERE {
        ?ebook rdf:type pgterms:ebook ;
               dcterms:title ?title ;
               dcterms:issued ?issued ;
               dcterms:language/rdf:value ?language ;
               dcterms:rights ?rights ;
               dcterms:publisher ?publisher .
    }
        """
        results = self.g.query(query)
        for result in results:
            ret = {
                "title": str(result.title),
                "publisher": str(result.publisher),
                "issued": str(result.issued),
                "rights": str(result.rights),
                "language": str(result.language),
            }
            return ret
        raise Exception('Can not get basic info from rdf file.')

    def get_subjects(self):
        query = """
        SELECT ?subject
            WHERE {
                ?ebook dcterms:subject/rdf:value ?subject.
                }
        """
        results = self.g.query(query)
        ret = []
        for result in results:
            ret.append(str(result.subject))
        return ret

    def parse(self):
        ret = self.get_basic_info()
        ret['subjects'] = self.get_subjects()
        ret['authors'] = self.get_authors()
        return ret

    def get_authors(self):
        query = """
        SELECT ?name WHERE {
          ?ebook dcterms:creator/pgterms:name ?name.
        }
        """
        results = self.g.query(query)
        ret = []
        for result in results:
            ret.append(str(result.name))
        return ret
