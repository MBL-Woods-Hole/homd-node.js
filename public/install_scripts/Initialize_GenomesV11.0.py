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
taxon_tbl  = 'otid_prime'   # UNIQUE  - This is the defining table
genome_tbl = 'genomesV11.0'
gncbi_tbl = 'genomes_ncbiV11.0'
gprokka_tbl = 'genomes_prokkaV11.0'

#SELECT genome_id as gid, otid, strain, category, organism, contigs, combined_size, GC
#   FROM `genomesV11.0`
# genomes_query = """
#    SELECT genome_id as gid, MAG as mag,otid, strain, `genomes_ncbiV11.0`.assembly_level as level,  `genomesV11.0`.organism, `genomesV11.0`.contigs, `genomesV11.0`.combined_size, `genomesV11.0`.GC
#    FROM `genomesV11.0`
#    JOIN `genomes_ncbiV11.0` using(genome_id)
# """
genomes_query = "SELECT genome_id as gid, MAG as mag,has_phage as phage,otid, strain, `"+gncbi_tbl+"`.assembly_level as level,"
genomes_query += " `"+genome_tbl+"`.organism, `"+genome_tbl+"`.contigs, `"+genome_tbl+"`.combined_size, `"+genome_tbl+"`.GC"
genomes_query += " FROM `"+genome_tbl+"`"
genomes_query += " JOIN `"+gncbi_tbl+"` using(genome_id)"



def create_genome(gid):  # basics - page1 Table: genomes  seqid IS UNIQUE
    """  alternative to a Class which seems to not play well with JSON

 
    """
    genome = {}
    genome['gid']       = gid
    genome['otid']      = ''   # index table
    genome['organism']  = ''   # table 1
    genome['contigs']  = ''   # table 1
    genome['combined_size']   = ''   # table 1
    genome['strain']    = ''  # table 1
    genome['gc']        = ''   # table 2
    genome['level']  = ''   # Complete Genome,Scaffold,Contig,Chromosome,MAG
    genome['mag']  = ''
    genome['has_phage']  = ''
    return genome



master_lookup = {}


def run_first(args):
    
    global master_lookup
    #print(first_genomes_query)
    result = myconn.execute_fetch_select_dict(genomes_query)

    for obj in result:
        #print('obj',obj)

        if obj['gid'] not in master_lookup:
            taxonObj = create_genome(obj['gid'])
            taxonObj['organism']     = obj['organism']
            taxonObj['contigs']    = obj['contigs']
            taxonObj['combined_size']     = obj['combined_size']
            taxonObj['strain']      = obj['strain']
            taxonObj['gc']          = obj['GC']
            taxonObj['level']    = obj['level']
            taxonObj['mag']    = obj['mag']
            taxonObj['phage']    = obj['phage']
            taxonObj['otid']        = obj['otid']
        else:
            sys.exit('duplicate gid',obj['gid'])
        master_lookup[obj['gid']] = taxonObj
    #print(master_lookup)

# def run_second(args):
#     """  add otid to Object """
#     global master_lookup
#     g_query ="""
#     SELECT seq_id as gid, otid
#     from genomes
#     ORDER BY gid
#     """
#     result = myconn.execute_fetch_select_dict(g_query)
# 
#     for obj in result:
#          if obj['gid'] in master_lookup:
#             master_lookup[obj['gid']]['otid'] = str(obj['otid'])
    #print(master_lookup)

# def run_third(args):
#     """ Add Pangenome List to Object"""
#     global master_lookup
#     g_query ="""
#     SELECT genome_id as gid, pangenome_name as pangenome
#     from pangenome_genome
#     ORDER BY gid
#     """
#     result = myconn.execute_fetch_select_dict(g_query)
# 
#     for obj in result:
#          if obj['gid'] in master_lookup:
#             master_lookup[obj['gid']]['pangenomes'].append(obj['pangenome'])



if __name__ == "__main__":

    usage = """
    USAGE:
        ./Initialize_Genome.py -host <myslqhost>

        will print out the need initialization files for homd
        Needs MySQL: tries to read your ~/.my.cnf_node

        -outdir/--out_directory Output directory [default is ./]
        for homd mysql connect
        -host [localhost (default), homd_v4, homd_v3] :: db_host

        for debugging
        -pp/--prettyprint  -easier read (for people) outfile
        -o/--outfileprefix <outfile>  Change outfile name from 'homdData-Genome'*
        -v/--verbose   chatty
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
    if args.dbhost == 'homd_v4':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.46'
    elif args.dbhost == 'homd_v3':
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.42'
    elif args.dbhost == 'homd_v41':
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.58'
    elif args.dbhost == 'homd_dev':
        dbhost= '192.168.1.69'
        args.DATABASE  = 'homd'
    elif args.dbhost == 'localhost':  #default
        args.DATABASE = 'homd'
        dbhost = 'localhost'
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print('Using',args.dbhost,dbhost)
    myconn = MyConnection(host=dbhost, db=args.DATABASE,  read_default_file = "~/.my.cnf_node")

    print(args)
    run_first(args)
    #run_second(args) # otid
    #run_third(args)  #pangenomes
    filename = os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(master_lookup, outfile, indent=args.indent)