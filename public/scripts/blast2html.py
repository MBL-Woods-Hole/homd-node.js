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
        #return int(node['Hsp_bit-score'])
    elif node.tag == 'Iteration':
        return int(node['Iteration_query-len'])
    raise Exception("Unknown XML node type: "+node.tag)

def myTitleSort(node, sort_field):
    t = str(node['Hit_def'])
    #print(t+'<br>')
    #hsps = node.Hit_hsps.Hsp
    #print(round(100*(min(hsp.Hsp_identity / blastxml_len(hsp) for hsp in hsps)),0),'<br>')
    result = t[t.rfind('[')+1:t.rfind(']')]
    tax = result.split()
    hmt = tax[0]
    genus = tax[1]
    species = tax[2]
    strain =   (' ').join(tax[3:])# everything else
    genus_sp_st = genus.lower()+' '+species.lower()+' '+strain.lower()
    if sort_field == 'genus_species_strain':
        return genus_sp_st
    if sort_field == 'strain':
        return strain

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
    #if args.dbhost == 'localhost':   # testing:will show in html
    #    print('hit',hit)
        #hit = SEQF1595_KI535341.1
    if args.db_type == 'protein':
        # needs to change for protein 
        # what about nucleotide?
        if args.anno == 'prokka':
           pid = hit
        else:
           pid = hit_parts[1]
        db = args.anno.upper()+'_'+hit_parts[0]
        query1 = "USE "+db+";"
        query2 = "SELECT m.accession, o.start, o.stop FROM molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID='"+pid+"'"
        if args.dbhost == 'localhost':   # testing
            query1 = "USE NCBI_SEQF1003;"
            query2 = "SELECT m.accession, o.start, o.stop FROM molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID='EEE16625.1'"
  
        try:
            args.myconn.execute_no_fetch(query1)
            result = args.myconn.execute_fetch_select_dict(query2)
            accession = result[0]['accession']
            start = result[0]['start']
            stop = result[0]['stop']
            hitfrom = start
            hitto = stop
            #print(accession)
            if int(start) > int(stop):
                hitfrom = stop
                hitto = start
            #print('acc',accession)
            gbacc = accession.split('|')[1]
        
            link = "http://www.ncbi.nlm.nih.gov/nucleotide/{}?report={}&log$=nuclalign".format(gbacc, type)
            link += "&from={}&to={}".format(hitfrom, hitto)
    
            
        except:
            link = "http://www.ncbi.nlm.nih.gov/nucleotide/{}?report={}&log$=nuclalign".format(hit_parts[1], type)
    
    else:
        link = "http://www.ncbi.nlm.nih.gov/nucleotide/{}?report={}&log$=nuclalign".format(hit_parts[1], type)
        if hsp != None:
            link += "&from={}&to={}".format(hsp['Hsp_hit-from'], hsp['Hsp_hit-to'])
    
    return link

def jblink(hit, type='jbrowse', hsp=None):
    
    """
    from George:
        http://homd.org/jbrowse/index.html
        ?data=homd/[SEQID]&tracks=DNA,homd,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at 0.37),GC Skew
        &loc=[ACCESSION]:[START]..[STOP]&highlight=[ACCESSION]:[START1]..[STOP1]
        
        <Hsp_hit-from>169802</Hsp_hit-from>  st  highlight: st + Hsp_query-from
        <Hsp_hit-to>169728</Hsp_hit-to>     stp  highlight: st + Hsp_query-to
    """
    
    if not isinstance(hit, str):
        hit = hitid(hit)
    # hit = SEQF1595_KI535341.1
    hit_parts = hit.split('_')
    link = "/jbrowse/index.html"
    loclink = ''
    
    if args.db_type == 'protein':
        """
        PROKKA-type:
          SEQF1595_01796
          Use PROKKA_SEQF1595;
          select m.accession, o.start, o.stop from molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID=' SEQF1595_01796'
        NCBI-type
          SEQF1595_ESK65362.1
          Use NCBI_SEQF1595;
          select m.accession, o.start, o.stop from molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID=' ESK65362.1'
        """
        if args.anno == 'prokka':
           pid = hit
        else:
           pid = hit_parts[1]
        db = args.anno.upper()+'_'+hit_parts[0]
        query1 = "USE "+db+";"
        query2 = "SELECT m.accession, m.GC, o.start, o.stop FROM molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID='"+pid+"'"
        
        if args.dbhost == 'localhost':
            query1 = "USE NCBI_SEQF1003;"
            query2 = "SELECT m.accession, m.GC, o.start, o.stop FROM molecules as m, ORF_seq as o where o.mol_id=m.id AND o.PID='EEE16625.1'"
        #print(query2)
        try:
            args.myconn.execute_no_fetch(query1)
            result = args.myconn.execute_fetch_select_dict(query2)
            accession = result[0]['accession']
            start = result[0]['start']
            stop = result[0]['stop']
            gc = result[0]['GC']
            hitfrom = start
            hitto = stop
            #print(accession)
            if int(start) > int(stop):
                hitfrom = stop
                hitto = start
            locfrom = int(hitfrom)-500
            if locfrom < 1:
                locfrom = 1
            loclink += "&loc={}:{}..{}".format(accession, str(locfrom), str(int(hitto)+500))
            loclink += "&highlight={}:{}..{}".format(accession, str(hitfrom), hitto)
        except:
            pass
        
            
    else:   # not protein
    #link = "/jbrowse/index.html?id={}&type=jbrowse&db=db".format(hit)
        acc = hit.replace('_','|')
        gc = '0.37'  # default -- This is wrong!
        
        if hsp != None:
            
            hitfrom = hsp['Hsp_hit-from']
            hitto = hsp['Hsp_hit-to']
        
            if int(hsp['Hsp_hit-from']) > int(hsp['Hsp_hit-to']):
                hitfrom = hsp['Hsp_hit-to']  # these are the highlights
                hitto = hsp['Hsp_hit-from']  # and the range is +/- 500
            locfrom = int(hitfrom)-500
            if locfrom < 1:
                locfrom = 1
            # if int(hitfrom) < 500:
#                lochitfrom = hitfrom
#             else:
#                lochitfrom = int(hitfrom)-500    
            loclink += "&loc={}:{}..{}".format(acc, str(locfrom), str(int(hitto)+500))
            loclink += "&highlight={}:{}..{}".format(acc, str(hitfrom), hitto)
            #link += "&st={}&sp={}".format(hsp['Hsp_hit-from'], hsp['Hsp_hit-to'])
    #print(link)
    link += "?data=homd/{}&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at {}),GC Skew".format(hit_parts[0], gc)
    link += loclink
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
    # sort hits by longest hotspot(hsp) first
#     return sorted(result.Iteration_hits.findall('Hit'),
#                   #key=lambda h: max(blastxml_len(hsp) for hsp in h.Hit_hsps.Hsp),
#                   key=lambda h: min(hsp.Hsp_identity / blastxml_len(hsp) for hsp in h.Hit_hsps.Hsp),
#                   #ident = "{:.0%}".format(float(min(hsp.Hsp_identity / blastxml_len(hsp) for hsp in hsps)))
#                   reverse=True)
                  
    return sorted(result.Iteration_hits.findall('Hit'),
                   #sort be two keys
                   key=lambda h: (round(100*(-min(hsp.Hsp_identity / blastxml_len(hsp) for hsp in h.Hit_hsps.Hsp)),0), # sort by genus?
                                  myTitleSort(h,'genus_species_strain')),
                                  reverse=False
                   
                   )
#     return sorted(result.Iteration_hits.findall('Hit'),
#             key=lambda h: myTitleSort(h,'genus_species_strain'),
#             reverse=False),
#                    key=lambda h: str(max(blastxml_len(hsp) for hsp in h.Hit_hsps.Hsp))+myTitleSort(h, 'genus_species_strain'), # sort by genus?
#                    reverse=True
#                    
#                    )

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
        dbase = '['+args.anno.upper()+'] '+self.blast.BlastOutput_db
        params = (('Query ID', self.blast["BlastOutput_query-ID"]),
                  ('Query definition', self.blast["BlastOutput_query-def"]),
                  ('Query length', self.blast["BlastOutput_query-len"]),
                  ('Program', self.blast.BlastOutput_version),
                  ('Database', dbase),
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
    def sort_result(self, result):
        #pass
        print('result[0]',result[0])
        for hit in hits(result):
           print(firsttitle(hit)+'<br>')
        #print('nnn')
    @filter
    def hit_info(self, result):
        #print('result[0]',result)
        #print('nn')
        query_length = blastxml_len(result)

        for hit in hits(result):
            #print('title',hit.Hit_def.text+'<br>')
            hsps = hit.Hit_hsps.Hsp

            cover = [False] * query_length
            for hsp in hsps:
                cover[hsp['Hsp_query-from']-1 : int(hsp['Hsp_query-to'])] = repeat(True, blastxml_len(hsp))
            cover_count = cover.count(True)

            def hsp_val(path):
                return (float(hsp[path]) for hsp in hsps)
            #print('firsttitle(hit)',firsttitle(hit)+'<br>')
            t = firsttitle(hit)
            result = t[t.rfind('[')+1:t.rfind(']')]
            #print('[result]',result+'<br>')
            tax = result.split()
            hmt = tax[0]
            genus = tax[1]
            species = tax[2]
            strain =   (' ').join(tax[3:])# everything else
            #print('hmt',hmt,'genus',genus,'species',species,'strain',strain,'<br>')
            yield dict(hit = hit,
                       title = t,
                       genus = genus,
                       species = species,
                       strain = strain,
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
    parser.add_argument('-dbhost', '--dbhost', dest = "dbhost", default='localhost',
                        help='Mysql DB Host')
    parser.add_argument('-anno', '--anno', dest = "anno", default='ncbi',
                        help='Annotation Type')
    parser.add_argument('-db_type', '--db_type', dest = "db_type", default='nucleotide',
                        help='nucleotide or protein')
    # We just want the file name here, so jinja can open the file
    # itself. But it is easier to just use a FileType so argparse can
    # handle the errors. This introduces a small race condition when
    # jinja later tries to re-open the template file, but we don't
    # care too much.
    parser.add_argument('--template', type=argparse.FileType(mode='r'), default=default_template,
                        help='The template file to use. Defaults to blast_html.html.jinja')
    global args
    global myconn
    args = parser.parse_args()
    sys.path.append(path.dirname(__file__)+'/../../../homd-data/')
    
    from connect import MyConnection
    
    args.myconn = MyConnection(host=args.dbhost,  read_default_file = "~/.my.cnf_node")
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
    global myconn
    main()

