#!/usr/bin/env python


import os, sys
import json
#from json import JSONEncoder
import argparse
#import ast

import datetime
ranks = ['domain','phylum','klass','order','family','genus','species','subspecies']
#ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())
sys.path.append('../homd-data/')
sys.path.append('../../homd-data/')
sys.path.append('../../config/')
from connect import MyConnection

# TABLES
taxon_tbl           = 'otid_prime'   # UNIQUE  - This is the defining table
genome_tbl = 'genomes'

master_tax_lookup={}
acceptable_genome_flags = ('11','12','21','91')
dropped_otids = ['9',   '15',  '16',  '55',  '65',
  '67',  '68',  '69',  '140', '143',
  '177', '210', '220', '255', '292','293','296',
  '310', '372', '395', '437', '446',
  '449', '452', '453', '462', '474',
  '486', '487', '502', '648', '729',
  '826']
nonoral_otids = ['982','983','984','986','987','988','989','990','991','994','995','996','997','998','999']

query_taxa ="""
SELECT otid, taxonomy_id, genus, species,
`warning`,
`status`,
ncbi_taxon_id as ncbi_taxid
from otid_prime
join taxonomy using(taxonomy_id)
join genus using(genus_id)
join species using(species_id)
"""
query_gene_count_no_flagid ="""
SELECT otid, seq_id, tlength
from {tbl}
ORDER BY otid
""".format(tbl=genome_tbl)


query_gene_count2 ="""
SELECT otid, seq_id
from {tbl}
ORDER BY otid
""".format(tbl=genome_tbl)

counts = {}
master_lookup = {}

def create_taxon(otid):

    taxon = {}
    taxon['otid'] = otid
    taxon['status'] = ''
    taxon['genus'] = ''
    taxon['species'] = ''
    taxon['warning'] = ''

    taxon['ncbi_taxid'] = ''
    taxon['genomes'] = []
    taxon['tlength_str'] = ''
    taxon['type_strains'] = []
    taxon['ref_strains'] = []
    taxon['rrna_sequences'] = []
    taxon['synonyms'] = []
    taxon['sites'] = []
    taxon['pangenomes'] = []
    return taxon






def run_taxa(args):
    global master_lookup
    #print(query_taxa)
    result = myconn.execute_fetch_select_dict(query_taxa)
    #split_code = '&lt;BR&gt;'


    #print(result)
    for obj in result:
        #print(obj)
        otid = str(obj['otid'])
        if otid not in master_lookup:
            # create ne taxon object with empty values
            taxonObj = create_taxon(otid)

            for n in obj:
                #print('n',n)
                toadd = str(obj[n]).strip()
                #print(n,toadd)
                #if n=='status' and toadd == 'Dropped':
                #   pass
                #else:
                if n=='status':
                    taxonObj['status'] = toadd
                if n=='genus':  #list
                    taxonObj['genus'] = toadd
                elif n=='species':  #list
                    taxonObj['species'] = toadd
                elif n=='warning':  #list
                    taxonObj['warning'] = toadd

                elif n=='ncbi_taxid':  #list
                    taxonObj['ncbi_taxid'] = toadd

                else:
                    #taxonObj[n] = toadd.replace('"','').replace("'","").replace(',','')
                    pass
            #master_lookup[obj['otid']] = ast.literal_eval(TaxonEncoder().encode(taxonObj))
            #print(taxonObj)
            master_lookup[otid] = taxonObj



        else:
            # is already in master list
            pass
    #print(master_lookup)


def run_get_genomes(args):  ## add this data to master_lookup
    global master_lookup
    global tlength_lookup
    ## SCREEN OUT BAD Genomes here in QUERY
    #print(query_gene_count_no_flagid)
    result = myconn.execute_fetch_select_dict(query_gene_count_no_flagid)

    tlength_lookup ={}

    for obj in result:
        #print(obj)
        otid = str(obj['otid'])
        if otid not in tlength_lookup:
            tlength_lookup[otid] = []
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['genomes'].append(obj['seq_id'])

            tlength_lookup[otid].append(obj['tlength'])

        else:
            sys.exit('problem with genome exiting')

def run_synonyms(args):
    global master_lookup
    q = """
    select otid, synonym from synonym
    """
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['synonyms'].append(obj['synonym'])
        else:
            sys.exit('problem with synonym exiting: '+otid)



def run_type_strain(args):
    global master_lookup
    q = """
    select otid, type_strain from type_strain
    """
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['type_strains'].append(obj['type_strain'])
        else:
            pass
            #sys.exit('problem with type_strain exiting: '+otid)



def run_sites(args):
    global master_lookup
    q = """
    select otid, site from site
    """
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['sites'].append(obj['site'])
        else:
            sys.exit('problem with site exiting')



def run_ref_strain(args):
    global master_lookup
    q = """
    select otid, reference_strain from ref_strain
    """
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['ref_strains'].append(obj['reference_strain'])
        else:
            sys.exit('problem with reference_strain exiting')

def run_rrna_sequences(ars):
    global master_lookup
    q = """
    select otid, rrna_sequence from rrna_sequence
    """
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            master_lookup[otid]['rrna_sequences'].append(obj['rrna_sequence'])
        else:
            sys.exit('problem with rrna_sequence exiting')

def run_pangenomes(args):
    global master_lookup
    q =  "SELECT otid, name as pangenome from pangenome"
    result = myconn.execute_fetch_select_dict(q)
    for obj in result:
        otid = str(obj['otid'])
        if otid in master_lookup:
            #if master_lookup[otid]['status'] != 'Dropped':
            if obj['pangenome'] not in master_lookup[otid]['pangenomes']:
                master_lookup[otid]['pangenomes'].append(obj['pangenome'])
        else:
            sys.exit('problem with rrna_sequence exiting')


def run_refseq(args):
    global refseq_lookup
    query_refseqid = "SELECT otid, refseqid, seqname, strain, genbank FROM taxon_refseqid"
    result = myconn.execute_fetch_select_dict(query_refseqid)
    refseq_lookup = {}
    for obj in result:
        #print(obj)
        otid = str(obj['otid'])

        if otid not in refseq_lookup:
            refseq_lookup[otid] = []
             #'refseqid': '956_1687', 'seqname': 'cinerea', 'strain': 'Strain: ATCC 14685', 'genbank': 'GB: NR_121687'}
        newobj = {}
        newobj['refseqid'] =  obj['refseqid']
        newobj['seqname']  =  obj['seqname']
        newobj['strain']   =  obj['strain']
        newobj['genbank']  =  obj['genbank']
        #newobj['status']   =  obj['status']
        #newobj['site']     =  obj['site']
        #newobj['flag']     =  obj['flag']
        refseq_lookup[otid].append(newobj)
    # tcount_wdropped=0
#     tcount_nodropped=0
#     for otid in refseq_lookup:
#         print('refseq',otid,len(refseq_lookup[otid]))
#         tcount_wdropped += len(refseq_lookup[otid])
#         if otid in nonoral_otids:
#            print('nonOralRef',otid)
#         if otid in dropped_otids:
#            print('dropped',otid)
#         else:
#            tcount_nodropped += len(refseq_lookup[otid])
#     print('Twdropped',tcount_wdropped) 
#     print('TNOdropped',tcount_nodropped) 
    file=os.path.join(args.outdir,args.outfileprefix+'RefSeqLookup.json')
    print_dict(file, refseq_lookup)



#############################

def run_info(args):  ## prev general,  On its own lookup
    global master_lookup
    q = "SELECT otid, general, prevalence, cultivability, disease_associations, phenotypic_characteristics FROM taxon_info"
    result = myconn.execute_fetch_select_dict(q)

    lookup = {}

    for obj in result:
        #print(obj)

        #print(n)
        otid = str(obj['otid'])
        # remove any double quotes but single quotes are ok (to preserve links)
        lookup[otid] = {}
        lookup[otid]['otid']    = otid
        lookup[otid]['culta']   = obj['cultivability'].strip()
        lookup[otid]['disease'] = obj['disease_associations'].strip()
        lookup[otid]['general'] = obj['general'].strip()
        lookup[otid]['pheno']   = obj['phenotypic_characteristics'].strip()
        lookup[otid]['prev']    = obj['prevalence'].strip()

    file = os.path.join(args.outdir,args.outfileprefix+'InfoLookup.json')
    print_dict(file, lookup)




def run_references(args):   ## REFERENCE Citations

    lookup = {}
    q =  "SELECT otid, pubmed_id,journal,authors,`title` from reference"
    result = myconn.execute_fetch_select_dict(q)

    for obj in result:
        #print(obj)
        otid = str(obj['otid'])

        #if otid not in lookup:
        if otid not in lookup:
            lookup[otid] = {}
        if 'pubs' not in lookup[otid]:
            lookup[otid]['pubs'] = []
        lookup[otid]['pubs'].append(
            {'pubmed_id':obj['pubmed_id'],
              'journal': obj['journal'].replace('"',"'").replace('&quot;',"'").replace('&#039;',"'").replace('\r',"").replace('\n',""),
              'authors': obj['authors'],
              'title':   obj['title'].replace('"',"'").replace('&quot;',"'").replace('&#039;',"'").replace('\r',"").replace('\n',"")
            })

    q2 =  """SELECT otid,
          NCBI_pubmed_search_count as a,
          NCBI_nucleotide_search_count as b,
          NCBI_protein_search_count as c,
          NCBI_genome_search_count as d,
          NCBI_taxonomy_search_count as e,
          NCBI_gene_search_count as f,
          NCBI_genomeP_search_count as g
          from extra_flat_info"""
    result = myconn.execute_fetch_select_dict(q2)
    for obj in result:
        otid = str(obj['otid'])
        if otid not in lookup:
            lookup[otid] = {}
        lookup[otid]['NCBI_pubmed_search_count'] = str(obj['a'])
        lookup[otid]['NCBI_nucleotide_search_count'] = str(obj['b'])
        lookup[otid]['NCBI_protein_search_count'] = str(obj['c'])
        lookup[otid]['NCBI_genome_search_count'] = str(obj['d'])
        lookup[otid]['NCBI_taxonomy_search_count'] = str(obj['e'])
        lookup[otid]['NCBI_gene_search_count'] = str(obj['f'])
        lookup[otid]['NCBI_genomeP_search_count'] = str(obj['g'])



    file = os.path.join(args.outdir,args.outfileprefix+'ReferencesLookup.json')
    print_dict(file, lookup)







def run_lineage(args):
    global counts
    global refseq_lookup
    global master_lookup
    """
    we need both a list and a lookup
    lookup:
    {
    "1": {
        "otid": 1,
        "domain": "Bacteria",
        "phylum": "Proteobacteria",
        "klass": "Alphaproteobacteria",
        ......

    list:
    [
    {
        "otid": 1,
        "domain": "Bacteria",
        "phylum": "Proteobacteria",
        "klass": "Alphaproteobacteria",
        ......


    select otid,domain,phylum,klass,`order`,family,genus,species
from otid_prime
JOIN taxonomy using(taxonomy_id)
JOIN domain using(domain_id)
JOIN phylum using(phylum_id)
JOIN klass using(klass_id)
JOIN `order` using(order_id)
JOIN family  using(family_id)
JOIN genus using(genus_id)
JOIN species  using(species_id)
JOIN subspecies  using(subspecies_id)
    """
## IMPORTANT -- DO NOT LET Dropped into hiearchy/Lineage/Counts
    qtax = """SELECT otid,domain,phylum,klass,`order`,family,genus,species,subspecies,status
        FROM otid_prime
        JOIN taxonomy using(taxonomy_id)
        JOIN domain using(domain_id)
        JOIN phylum using(phylum_id)
        JOIN klass using(klass_id)
        JOIN `order` using(order_id)
        JOIN family  using(family_id)
        JOIN genus using(genus_id)
        JOIN species  using(species_id)
        JOIN subspecies  using(subspecies_id)
        
      """

    result = myconn.execute_fetch_select_dict(qtax)


    obj_list = []
    obj_lookup = {}
    for obj in result:
        #print(obj)
        # for each otid build up the taxonomy from species => domain
        this_obj = {}

        otid = str(obj['otid'])

        # how many seqs??
        # Number of 16S rRNA RefSeqs ??
        num_genomes = len(master_lookup[otid]['genomes'])
        num_refseqs = 0
        if otid in refseq_lookup:
            num_refseqs = len(refseq_lookup[otid])

        # if otid in master_lookup and otid=='550':
#             print('otid',otid,' num genomes:',num_genomes)
        

        #if obj['domain']:
        this_obj['otid'] = otid
        this_obj['domain'] = obj['domain']
        this_obj['phylum'] =  obj['phylum']
        this_obj['klass'] =  obj['klass']
        this_obj['order'] =  obj['order']
        this_obj['family'] =  obj['family']
        this_obj['genus'] =  obj['genus']
        this_obj['species'] =  obj['genus']+' '+obj['species']
        tax_list = [this_obj['domain'],this_obj['phylum'],this_obj['klass'],this_obj['order'],this_obj['family'],this_obj['genus'],this_obj['species']]
        #if obj['subspecies']:
        this_obj['subspecies'] = obj['subspecies']
        tax_list.append(obj['subspecies'])


        obj_list.append(this_obj)
        if otid not in dropped_otids:
           obj_lookup[otid] = {}
           obj_lookup[otid] = this_obj
        #tax_list = [obj['domain'],obj['phylum'],obj['klass'],obj['order'],obj['family'],obj['genus'],obj['species']]
        #tax_list = obj_lookup.values()
        
        
        if obj['domain']:
            # send all otids including dropped and nonOralRef
            run_counts2(otid, tax_list, num_genomes, num_refseqs)

    file1 = os.path.join(args.outdir,args.outfileprefix+'Lineagelookup.json')
    file2 = os.path.join(args.outdir,args.outfileprefix+'Hierarchy.json')
    
    # only send otid that are not dropped
    print_dict(file1, obj_lookup)
    print_dict(file2, obj_list)

    file = os.path.join(args.outdir,args.outfileprefix+'Counts.json')
    print_dict(file, counts)

def run_counts2(otid, taxlist, gcnt, rfcnt):
    global counts
    #print(taxlist)


    for m in range(len(ranks)): # 7
        #tax_name = taxlist[m]

        sumdtaxname = []
        for d in range(m+1):
            sumdtaxname.append(taxlist[d])

        long_tax_name = ';'.join(sumdtaxname)

        if long_tax_name[-1] == ';':
            #remove it -- means subsp ==''
            continue
            #long_tax_name = long_tax_name[:-1]
        #print('long_tax_name ',long_tax_name)
        #print('otid ',otid)
#       longtaxname": {"taxcnt_least": 1, "gcnt_least": 5, "refcnt_least": 3   DEFAULT
#       taxcnt_wdropped  gncnt_wdropped  refcnt_wdropped
#       taxcnt_wnonoral  gncnt_wnonoral  refcnt_wnonoral

        
        if long_tax_name in counts:
            if otid in nonoral_otids or otid in dropped_otids:
                if otid in nonoral_otids:
                    counts[long_tax_name]["taxcnt_wnonoral"] += 1
                    counts[long_tax_name]['refcnt_wnonoral'] += rfcnt
                    counts[long_tax_name]['gcnt_wnonoral']   += gcnt
                else:  # in dropped only
                    counts[long_tax_name]["taxcnt_wdropped"] += 1
                    counts[long_tax_name]['refcnt_wdropped'] += rfcnt
                    counts[long_tax_name]['gcnt_wdropped']   += gcnt
            else:   #in neither least default
                counts[long_tax_name]["taxcnt"] += 1
                counts[long_tax_name]['refcnt']  += rfcnt
                counts[long_tax_name]['gcnt']    += gcnt
        else:
            # this will always be species
            counts[long_tax_name] = {}
            if otid in nonoral_otids or otid in dropped_otids:
                if otid in nonoral_otids:
                    counts[long_tax_name]["taxcnt"] = 0
                    counts[long_tax_name]['refcnt'] = 0
                    counts[long_tax_name]['gcnt']   = 0
                    counts[long_tax_name]["taxcnt_wnonoral"] = 1
                    counts[long_tax_name]['refcnt_wnonoral'] = rfcnt
                    counts[long_tax_name]['gcnt_wnonoral']   = gcnt
                    counts[long_tax_name]["taxcnt_wdropped"] = 0
                    counts[long_tax_name]['refcnt_wdropped'] = 0
                    counts[long_tax_name]['gcnt_wdropped']   = 0
                else:  # in dropped only
                    counts[long_tax_name]["taxcnt"] = 0
                    counts[long_tax_name]['refcnt'] = 0
                    counts[long_tax_name]['gcnt']   = 0
                    counts[long_tax_name]["taxcnt_wnonoral"] = 0
                    counts[long_tax_name]['refcnt_wnonoral'] = 0
                    counts[long_tax_name]['gcnt_wnonoral']   = 0
                    counts[long_tax_name]["taxcnt_wdropped"] = 1
                    counts[long_tax_name]['refcnt_wdropped'] = rfcnt
                    counts[long_tax_name]['gcnt_wdropped']   = gcnt
            else:   #in neither least default
                
                counts[long_tax_name]["taxcnt"] = 1
                counts[long_tax_name]['refcnt'] = rfcnt
                counts[long_tax_name]['gcnt']   = gcnt
                counts[long_tax_name]["taxcnt_wnonoral"] = 0
                counts[long_tax_name]['refcnt_wnonoral'] = 0
                counts[long_tax_name]['gcnt_wnonoral']   = 0
                counts[long_tax_name]["taxcnt_wdropped"] = 0
                counts[long_tax_name]['refcnt_wdropped'] = 0
                counts[long_tax_name]['gcnt_wdropped']   = 0
            
            
          #   counts[long_tax_name] = { "taxcnt": 1, "gcnt": gcnt, "refcnt": rfcnt,
#                 "taxcnt_wdropped": 1, "gcnt_wdropped": gcnt, "refcnt_wdropped": rfcnt,
#                 "taxcnt_wnonoral": 1, "gcnt_wnonoral": gcnt, "refcnt_wnonoral": rfcnt
#             }
    return counts    
        
def run_counts(otid, taxlist, gcnt, rfcnt):
    global counts
    #print(taxlist)


    for m in range(len(ranks)): # 7
        #tax_name = taxlist[m]

        sumdtaxname = []
        for d in range(m+1):
            sumdtaxname.append(taxlist[d])

        long_tax_name = ';'.join(sumdtaxname)

        if long_tax_name[-1] == ';':
            #remove it -- means subsp ==''
            continue
            #long_tax_name = long_tax_name[:-1]
        #print('long_tax_name ',long_tax_name)
        #print('otid ',otid)
        

# longtaxname": {"tax_cnt": 1, "gcnt": 5, "refcnt": 3   .... 
#NO dropped or nor:  774	8607	999 
# ALL    
        if long_tax_name in counts:
            if otid not in nonoral_otids and otid not in dropped_otids:  
               counts[long_tax_name]["taxcnt"] += 1
               counts[long_tax_name]['refcnt']  += rfcnt
               counts[long_tax_name]['gcnt']    += gcnt
        else:
            # this will always be species
            if otid not in nonoral_otids and otid not in dropped_otids: 
                counts[long_tax_name] = { "taxcnt": 1, "gcnt": gcnt, "refcnt": rfcnt}
#            else:
#               counts[long_tax_name] = { "taxcnt": 0, "gcnt": 0, "refcnt": 0}
    
    
    return counts

def get_mbps(x):
    #return str(float(x)/1000000) + 'Mbps'
    if x:
        return "{:#.3g}".format(float(x)/1000000)
    else:
        return "0"

def print_master_lookup(args):
    global master_lookup
    ## get genome length

    for otid in master_lookup:
        min_glength = 0
        max_glength = 0
        if len(master_lookup[otid]['genomes']) == 0:
            master_lookup[otid]['tlength_str'] = ''
        elif len(master_lookup[otid]['genomes']) == 1:
            master_lookup[otid]['tlength_str'] = get_mbps(tlength_lookup[otid][0]) + ' Mbps'
        else:
            #print('tlength_lookup[otid]',tlength_lookup[otid])
            min_glength = min(tlength_lookup[otid])
            max_glength = max(tlength_lookup[otid])
            #print('minmax',min_glength,max_glength)
            
            master_lookup[otid]['tlength_str'] = get_mbps(min_glength) +' - '+ get_mbps(max_glength)+ ' Mbps'

        #master_lookup[otid]['genomes'].append(obj['seq_id'])
        #master_lookup[otid]['tlengths'].append(obj['tlength'])
    file =  os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    print_dict(file, master_lookup)

def print_dict(filename, dict):
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)

if __name__ == "__main__":

    usage = """
    USAGE:
        homd_init_data.py

        will print out the need initialization files for homd
        Needs MySQL: tries to read your ~/.my.cnf_node

           -outdir Output directory [default]
        for homd site
           -host homd

        for debugging
          -pp  pretty print
          -o <outfile>  Change outfile name from 'taxonomy'*

    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
                                                    help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Taxon',
                                                    help=" ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", default = './',
                         help = "Not usually needed if -host is accurate")
    parser.add_argument("-host", "--host",
                        required = False, action = 'store', dest = "dbhost", default = 'localhost',
                        help = "choices=['homd',  'localhost']")
    parser.add_argument("-pp", "--prettyprint",
                        required = False, action = 'store_true', dest = "prettyprint", default = False,
                        help = "output file is human friendly")
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()")
    args = parser.parse_args()
    #parser.print_help(usage)
    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'
    if args.dbhost == 'homd_dev':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.46'
    elif args.dbhost == 'homd_prod':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.42'

    elif args.dbhost == 'localhost':
        #args.json_file_path = '/Users/avoorhis/programming/homd-data/json'
        args.DATABASE  = 'homd'
        dbhost='localhost'

    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    myconn = MyConnection(host=dbhost, db=args.DATABASE,   read_default_file = "~/.my.cnf_node")


    print(args)
    print('running taxa (run defs in order)')

    run_taxa(args)   # RUN FIRST in master_lookup => homd_data_taxalookup.json

    run_get_genomes(args)  # in master_lookup => homd_data_taxalookup.json
    run_synonyms(args)     # in master_lookup

    run_type_strain(args)  # in master_lookup

    run_sites(args)        # in master_lookup
    run_ref_strain(args)   # in master_lookup

    run_rrna_sequences(args)  # in master_lookup
    run_pangenomes(args)   # in master_lookup

    print_master_lookup(args)

    run_refseq(args)
    run_info(args)
    run_references(args)



     # run lineage AFTER to get counts
    run_lineage(args)

    print('\nFinished -- Now run: ./Initialize_Abundance.py (data from abundance table)\n')
    # run abundance after lineach because uses counts data
    # run abundance is now in its own script: Initialize_Abundance.py
    # but still adds to TaxonCounts.json file
    #run_abundance(args)
