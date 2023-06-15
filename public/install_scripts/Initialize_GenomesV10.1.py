#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)

import os, sys
import json
import argparse

import datetime
from datetime import datetime,date
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(date.today())
sys.path.append('../homd-data/')
sys.path.append('../../homd-data/')
sys.path.append('../../config/')
from connect import MyConnection

# TABLES
#update_date_tbl = 'static_genomes_update_date'  # this seems to be the LONG list of gids -- use it first then fill in
#index_tbl       = 'seqid_otid_index'   # match w/ otid OTID Not Unique
genomes_tbl = 'genomes' #  has genus,species,status,#ofcontigs,combinedlength,
#seq_extra_tbl   = 'genomes_homd_extra' # has ncbi_id,ncbi_taxid,GC --and alot more
# 1 --annotated at HOMD with NCBI ANNOTATION
# 12 --annotated at HOMD without NCBI Annotation
# 21 --Genomes with NCBI annotation
# Plus 91 is for those Nonoralref genomes
acceptable_genome_flags = ('11','12','21','91')
# first_query ="""
#     SELECT seq_id as gid, date
#     from {tbl}
#     ORDER BY gid
# """.format(tbl=update_date_tbl)
# 2

# in db change gc_comment to genbank_assembly (MBL) VARCHAR(20)
# change genbank_acc to genbank_accession:
# change goldstamp_id to ncbi_biosample
# change ncbi_id to ncbi_bioproject
# isolate origin varchar(200)
first_genomes_query_no_flagid ="""
    SELECT seq_id as gid,
    organism,
    genus,
    species,
    genomes.status,
    ncontigs,
    tlength,

    culture_strain as ccolct,
    submitter as submitter,

    ncbi_bioproject as ncbi_bpid,
    ncbi_taxonid,
    isolate_origin as io,
    gc,
    ncbi_assembly_name as asmbly_name,
    gb_assembly   as gb_asmbly,
    refseq_assembly as rs_asmbly,
    ncbi_biosample as  ncbi_bsid

    from genomes
    JOIN otid_prime using(otid)
    JOIN taxonomy using(taxonomy_id)
    JOIN genus using(genus_id)
    JOIN species using(species_id)

""".format(tbl1=genomes_tbl)


def create_genome(gid):  # basics - page1 Table: genomes  seqid IS UNIQUE
    """  alternative to a Class which seems to not play well with JSON

    1 otid                              #table1
    2  homd seqid                       #table1
    3  genus species                    #table1
    4  genome sequence name  # How is this different than genus-species?
    5  comments on name
    6  culture collection entry number  # table
    7  isolate origin                   # table2
    8  sequencing status                # table
    9  ncbi tax(genome)id                       # table1
    10 ncbi genome bioproject id        # table
    11 ncbi genome biosample id         # table
    12 genbank acc id                   # table2
    13 genbank assbly id                # table
    14 number of contigs and singlets      # table
    15 combined lengths (bps)           # table
    16 GC percentage                   # table1
    17 sequencing center           # table1

    20 16s rna gene sequence           # table  ????
    21 comments                    # table
    """
    genome = {}
    genome['gid']       = gid
    genome['otid']      = ''   # index table
    genome['organism']     = ''   # table 1
    genome['genus']     = ''   # table 1
    genome['species']     = ''   # table 1
    genome['status']    = ''   # table 1
    genome['ncontigs']  = ''   # table 1
    genome['submitter'] = ''   # table 1
    genome['tlength']   = ''   # table 1
    genome['ccolct']    = ''  # table 1
    genome['gc']        = ''   # table 2
    genome['ncbi_taxonid'] = ''   # table 2
    genome['ncbi_bpid']     = ''   # table 2
    genome['ncbi_bsid'] = ''
    genome['io']        = ''   # table 2

    genome['asmbly_name']    = ''
    genome['gb_asmbly'] = ''
    genome['rs_asmbly'] = ''
    genome['pangenomes'] = []   # array of pangenome names

    return genome



master_lookup = {}


def run_first(args):
    """ date not used"""
    global master_lookup
    #print(first_genomes_query)
    result = myconn.execute_fetch_select_dict(first_genomes_query_no_flagid)

    for obj in result:
        #print(obj)

        if obj['gid'] not in master_lookup:
            taxonObj = create_genome(obj['gid'])
            taxonObj['organism']     = obj['organism']
            taxonObj['genus']       = obj['genus']
            taxonObj['species']     = obj['species']
            taxonObj['status']      = obj['status']
            taxonObj['ncontigs']    = obj['ncontigs']
            taxonObj['submitter']   = obj['submitter']
            taxonObj['tlength']     = obj['tlength']
            taxonObj['ccolct']      = obj['ccolct']
            taxonObj['gc']          = obj['gc']
            taxonObj['ncbi_taxonid'] = obj['ncbi_taxonid']
            taxonObj['ncbi_bpid']   = obj['ncbi_bpid']
            taxonObj['ncbi_bsid']   = obj['ncbi_bsid']
            taxonObj['io']          = obj['io']
            taxonObj['gb_asmbly']   = obj['gb_asmbly']
            taxonObj['rs_asmbly']   = obj['rs_asmbly']
            taxonObj['asmbly_name'] = obj['asmbly_name']


        else:
            sys.exit('duplicate gid',obj['gid'])
        master_lookup[obj['gid']] = taxonObj
    #print(master_lookup)

def run_second(args):
    """  add otid to Object """
    global master_lookup
    g_query ="""
    SELECT seq_id as gid, otid
    from genomes
    ORDER BY gid
    """
    result = myconn.execute_fetch_select_dict(g_query)

    for obj in result:
         if obj['gid'] in master_lookup:
            master_lookup[obj['gid']]['otid'] = str(obj['otid'])
    #print(master_lookup)

def run_third(args):
    """ Add Pangenome List to Object"""
    global master_lookup
    g_query ="""
    SELECT seq_id as gid, name as pangenome
    from pangenome
    ORDER BY gid
    """
    result = myconn.execute_fetch_select_dict(g_query)

    for obj in result:
         if obj['gid'] in master_lookup:
            master_lookup[obj['gid']]['pangenomes'].append(obj['pangenome'])



if __name__ == "__main__":

    usage = """
    USAGE:
        homd_init_genome_data.py

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
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Genome',
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

    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'
    if args.dbhost == 'homd_dev':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.46'
    elif args.dbhost == 'homd_prod':
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.42'

    elif args.dbhost == 'localhost':  #default
        args.DATABASE = 'homd'
        dbhost = 'localhost'
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print()
    myconn = MyConnection(host=dbhost, db=args.DATABASE,  read_default_file = "~/.my.cnf_node")

    print(args)
    run_first(args)
    run_second(args) # otid
    run_third(args)  #pangenomes
    filename = os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(master_lookup, outfile, indent=args.indent)