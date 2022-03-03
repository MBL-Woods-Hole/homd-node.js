#!/usr/bin/env python
# Actually runs under either python 2 or 3

# Copyright The Hyve B.V. 2014
# License: GPL version 3 or higher

import sys
import math
import warnings
from os import path
from itertools import repeat
import argparse
from lxml import objectify
import jinja2
import re



_filters = {}
def filter(func_or_name):
    "Decorator to register a function as filter in the current jinja environment"
    if isinstance(func_or_name, str):
        def inner(func):
            _filters[func_or_name] = func.__name__
            return func
        return inner
    else:
        _filters[func_or_name.__name__] = func_or_name.__name__
        return func_or_name


def color_idx(length):
    if length < 40:
        return 0
    elif length < 50:
        return 1
    elif length < 80:
        return 2
    elif length < 200:
        return 3
    return 4

@filter
def fmt(val, fmt):
    return format(float(val), fmt)

@filter
def firsttitle(hit):
    return hit.Hit_def.text.split('>')[0]

@filter
def othertitles(hit):
    """Split a hit.Hit_def that contains multiple titles up, splitting out the hit ids from the titles."""
    id_titles = hit.Hit_def.text.split('>')

    titles = []
    for t in id_titles[1:]:
        fullid, title = t.split(' ', 1)
        hitid, id = fullid.split('|', 2)[1:3]
        titles.append(dict(id = id,
                           hitid = hitid,
                           fullid = fullid,
                           title = title))
    return titles

@filter
def hitid(hit):
    hitid = hit.Hit_id.text
    s = hitid.split('|', 2)
    if len(s) >= 2:
        return s[1]
    return hitid

@filter
def hitdef(hit):
    hitdef = hit.Hit_def.text
    s = hitdef.split(' ')
    # ie s[0] = SEQF1595_KI535341.1
    return s[0]
    
@filter
def hittaxon(hit):
    hitdef = hit.Hit_def.text
    #SEQF1695_01380 hypothetical protein [HMT-105 Peptostreptococcaceae
    # match = 'HMT-
    r1 = re.search(r"HMT-(\d+)\s", hitdef)
    #s = hitdef.split(' ')
    return r1.group(1) if r1 is not None else 'NotFound'   # rmove [HMT-  5chars

@filter
def hitgenome(hit):
    hitdef = hit.Hit_def.text
    #SEQF1695_01380 hypothetical protein [HMT-105 Peptostreptococcaceae
    s = hitdef.split(' ')[0].split('_')
    #s = hitdef.split(' ')
    return s[0]

@filter
def seqid(hit):
    hitid = hit.Hit_id.text
    s = hitid.split('|', 2)
    if len(s) >= 3:
        return s[2]
    return hitid

@filter
def format_alignment1(string):
    #return "{:>7s}".format(string)
    l = len(string)
    pad = 10-l  # 'Query          '
    ret = string
    for n in range(pad):
       ret = "&nbsp;" + ret
    # if 1 ret~14   1-sl = 14
    # 213457 ret 14  6-sl = 14
    return ret
    
@filter
def format_alignment2(string):
    
    pad = 16  # '              '
    ret = ''
    for n in range(pad):
       ret = "&nbsp;" + ret
    return ret
@filter
def format_alignment3(string):
    #return "{:>7s}".format(string)
    l = len(string)
    pad = 8-l
    ret = string
    for n in range(pad):
       ret = "&nbsp;" + ret
    return ret
    #return "'{0:&nbsp;>15}'".format(string)
@filter
def alignment_pre(hsp):
    
    return (
        "\nQuery {:>7s}  {}  {}".format(hsp['Hsp_query-from'].text, hsp.Hsp_qseq, hsp['Hsp_query-to']) +
        "\n       {:>7s}  {}".format('', hsp.Hsp_midline) +
        "\nSubject{:>7s}  {}  {}\n".format(hsp['Hsp_hit-from'].text, hsp.Hsp_hseq, hsp['Hsp_hit-to'])
    )
    # string = '\n'+hsp['Hsp_query-from'].text + '  '+ hsp.Hsp_qseq+ '  '+ str(hsp['Hsp_query-to'])+ '\n'
#     string += '  ' + hsp.Hsp_midline +' ' +hsp['Hsp_hit-from'].text + '\n'
#     string += '  ' + hsp.Hsp_hseq +' '+ str(hsp['Hsp_hit-to'])
    #return string

@filter('len')
def blastxml_len(node):
    if node.tag == 'Hsp':
        return int(node['Hsp_align-len'])
    elif node.tag == 'Iteration':
        return int(node['Iteration_query-len'])
    raise Exception("Unknown XML node type: "+node.tag)
        

@filter
def asframe(frame):
    if frame == 1:
        return 'Plus'
    elif frame == -1:
        return 'Minus'
    elif frame == 0:
        return '0'
    raise Exception("frame should be either +1 or -1")

def genelink(hit, type='genbank', hsp=None):
    if not isinstance(hit, str):
        hit = hitid(hit)
    hit_parts = hit.split('_')
    link = "http://www.ncbi.nlm.nih.gov/nucleotide/{}?report={}&log$=nuclalign".format(hit_parts[1], type)
    if hsp != None:
        link += "&from={}&to={}".format(hsp['Hsp_hit-from'], hsp['Hsp_hit-to'])
    return link

def jblink(hit, type='jbrowse', hsp=None):
    if not isinstance(hit, str):
        hit = hitid(hit)
    # hit = SEQF1595_KI535341.1
    hit_parts = hit.split('_')
    #link = "http://www.homd.org/jbrowse/index.html?id={}&type=jbrowse&db=db".format(hit)
#from George:
# http://homd.org/jbrowse/index.html
# ?data=homd/[SEQID]&tracks=DNA,homd,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GCContent,GCSkew
# &loc=[ACCESSION]:[START]..[STOP]&highlight=[ACCESSION]:[START1]..[STOP1]
# http://www.homd.org/
# ?name=redirect
# &type=jbrowse
# &db=db
# &id=SEQF1683_GL637672.1
# &st=4520
# &sp=4595
# <Hsp_num>1</Hsp_num>
# <Hsp_bit-score>106.379</Hsp_bit-score>
# <Hsp_score>57</Hsp_score>
# <Hsp_evalue>1.12307e-24</Hsp_evalue>
# <Hsp_query-from>2</Hsp_query-from>   
# <Hsp_query-to>76</Hsp_query-to>   
# <Hsp_hit-from>169802</Hsp_hit-from>  st  highlight: st + Hsp_query-from
# <Hsp_hit-to>169728</Hsp_hit-to>     stp  highlight: st + Hsp_query-to
# <Hsp_query-frame>1</Hsp_query-frame>
# <Hsp_hit-frame>-1</Hsp_hit-frame>
# <Hsp_identity>69</Hsp_identity>
# <Hsp_positive>69</Hsp_positive>
# <Hsp_gaps>0</Hsp_gaps>
    #link = "http://www.homd.org/?name=redirect&type=jbrowse&db=db&id={}".format(hit)
    link = "http://www.homd.org/jbrowse/index.html"
    link += "?data=homd/{}&tracks=DNA,homd,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GCContent,GCSkew"
    link += "&loc={}:{}..{}&highlight={}:{}..{}".format(hit_parts[0],hit_parts[1],'','','','','')
    if hsp != None:
        link += "&st={}&sp={}".format(hsp['Hsp_hit-from'], hsp['Hsp_hit-to'])
    return link

def taxonlink(hit, type='taxon', hsp=None):
    if not isinstance(hit, str):
        hit = hitid(hit)
    link = "/taxa/tax_description?otid={}".format(hit)
    return link

def genomelink(hit, type='genome', hsp=None):
    if not isinstance(hit, str):
        hit = hitid(hit)
    link = "/genome/genome_description?gid={}".format(hit)
    return link
        
# javascript escape filter based on Django's, from https://github.com/dsissitka/khan-website/blob/master/templatefilters.py#L112-139
# I've removed the html escapes, since html escaping is already being performed by the template engine.

_base_js_escapes = (
    ('\\', r'\u005C'),
    ('\'', r'\u0027'),
    ('"', r'\u0022'),
    # ('>', r'\u003E'),
    # ('<', r'\u003C'),
    # ('&', r'\u0026'),
    # ('=', r'\u003D'),
    # ('-', r'\u002D'),
    # (';', r'\u003B'),
    # (u'\u2028', r'\u2028'),
    # (u'\u2029', r'\u2029')
)

# Escape every ASCII character with a value less than 32. This is
# needed a.o. to prevent html parsers from jumping out of javascript
# parsing mode.
_js_escapes = (_base_js_escapes +
               tuple(('%c' % z, '\\u%04X' % z) for z in range(32)))

@filter
def js_string_escape(value):
    """Escape javascript string literal escapes. Note that this only works
    within javascript string literals, not in general javascript
    snippets."""

    value = str(value)

    for bad, good in _js_escapes:
        value = value.replace(bad, good)

    return value

@filter
def hits(result):
    # sort hits by longest hotspot first
    return sorted(result.Iteration_hits.findall('Hit'),
                  key=lambda h: max(blastxml_len(hsp) for hsp in h.Hit_hsps.Hsp),
                  reverse=True)



class BlastVisualize:

    colors = ('black', 'blue', 'green', 'magenta', 'red')

    max_scale_labels = 10

    def __init__(self, input, templatedir, templatename):
        self.input = input
        self.templatename = templatename

        self.blast = objectify.parse(self.input).getroot()
        self.loader = jinja2.FileSystemLoader(searchpath=templatedir)
        self.environment = jinja2.Environment(loader=self.loader,
                                              lstrip_blocks=True, trim_blocks=True, autoescape=True)

        self._addfilters(self.environment)


    def _addfilters(self, environment):
        for filtername, funcname in _filters.items():
            try:
                environment.filters[filtername] = getattr(self, funcname)
            except AttributeError:
                environment.filters[filtername] = globals()[funcname]

    def render(self, output):
        template = self.environment.get_template(self.templatename)

        params = (('Query ID', self.blast["BlastOutput_query-ID"]),
                  ('Query definition', self.blast["BlastOutput_query-def"]),
                  ('Query length', self.blast["BlastOutput_query-len"]),
                  ('Program', self.blast.BlastOutput_version),
                  ('Database', self.blast.BlastOutput_db),
        )
        #print('params',params)
        output.write(template.render(blast=self.blast,
                                     iterations=self.blast.BlastOutput_iterations.Iteration,
                                     colors=self.colors,
                                     # match_colors=self.match_colors(),
                                     # hit_info=self.hit_info(),
                                     genelink=genelink,
                                     jblink=jblink,
                                     taxonlink=taxonlink,
                                     genomelink=genomelink,
                                     params=params))

    @filter
    def match_colors(self, result):
        """
        An iterator that yields lists of length-color pairs. 
        """

        query_length = blastxml_len(result)
        
        percent_multiplier = 100 / query_length

        for hit in hits(result):
            # sort hotspots from short to long, so we can overwrite index colors of
            # short matches with those of long ones.
            hotspots = sorted(hit.Hit_hsps.Hsp, key=lambda hsp: blastxml_len(hsp))
            table = bytearray([255]) * query_length
            for hsp in hotspots:
                frm = hsp['Hsp_query-from'] - 1
                to = int(hsp['Hsp_query-to'])
                table[frm:to] = repeat(color_idx(blastxml_len(hsp)), to - frm)

            matches = []
            last = table[0]
            count = 0
            for i in range(query_length):
                if table[i] == last:
                    count += 1
                    continue
                matches.append((count * percent_multiplier, self.colors[last] if last != 255 else 'transparent'))
                last = table[i]
                count = 1
            matches.append((count * percent_multiplier, self.colors[last] if last != 255 else 'transparent'))

            yield dict(colors=matches, link="#hit"+hit.Hit_num.text, defline=firsttitle(hit))

    @filter
    def queryscale(self, result):
        query_length = blastxml_len(result)
        skip = math.ceil(query_length / self.max_scale_labels)
        percent_multiplier = 100 / query_length
        for i in range(1, query_length+1):
            if i % skip == 0:
                yield dict(label = i, width = skip * percent_multiplier)
        if query_length % skip != 0:
            yield dict(label = query_length,
                       width = (query_length % skip) * percent_multiplier)

    @filter
    def hit_info(self, result):

        query_length = blastxml_len(result)

        for hit in hits(result):
            hsps = hit.Hit_hsps.Hsp

            cover = [False] * query_length
            for hsp in hsps:
                cover[hsp['Hsp_query-from']-1 : int(hsp['Hsp_query-to'])] = repeat(True, blastxml_len(hsp))
            cover_count = cover.count(True)

            def hsp_val(path):
                return (float(hsp[path]) for hsp in hsps)

            yield dict(hit = hit,
                       title = firsttitle(hit),
                       link_id = hit.Hit_num,
                       maxscore = "{:.1f}".format(max(hsp_val('Hsp_bit-score'))),
                       totalscore = "{:.1f}".format(sum(hsp_val('Hsp_bit-score'))),
                       cover = "{:.0%}".format(cover_count / query_length),
                       e_value = "{:.4g}".format(min(hsp_val('Hsp_evalue'))),
                       # FIXME: is this the correct formula vv?
                       ident = "{:.0%}".format(float(min(hsp.Hsp_identity / blastxml_len(hsp) for hsp in hsps))),
                       accession = hit.Hit_accession)


def main():
    default_template = path.join(path.dirname(__file__), 'blast2html.html.jinja')
    
    parser = argparse.ArgumentParser(description="Convert a BLAST XML result into a nicely readable html page",
                                     usage="{} [-i] INPUT [-o OUTPUT]".format(sys.argv[0]))
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('positional_arg', metavar='INPUT', nargs='?', type=argparse.FileType(mode='r'),
                             help='The input Blast XML file, same as -i/--input')
    input_group.add_argument('-i', '--input', type=argparse.FileType(mode='r'), 
                             help='The input Blast XML file')
    parser.add_argument('-o', '--output', type=argparse.FileType(mode='w'), default=sys.stdout,
                        help='The output html file')
    # We just want the file name here, so jinja can open the file
    # itself. But it is easier to just use a FileType so argparse can
    # handle the errors. This introduces a small race condition when
    # jinja later tries to re-open the template file, but we don't
    # care too much.
    parser.add_argument('--template', type=argparse.FileType(mode='r'), default=default_template,
                        help='The template file to use. Defaults to blast_html.html.jinja')

    args = parser.parse_args()
    if args.input == None:
        args.input = args.positional_arg
    if args.input == None:
        parser.error('no input specified')

    templatedir, templatename = path.split(args.template.name)
    args.template.close()
    if not templatedir:
        templatedir = '.'

    b = BlastVisualize(args.input, templatedir, templatename)
    b.render(args.output)


if __name__ == '__main__':
    main()

