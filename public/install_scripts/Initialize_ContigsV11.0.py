#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)

import os, sys
import json,gzip
import argparse
from Bio import SeqIO
import datetime
from datetime import datetime,date
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(date.today())
sys.path.append('../homd-data/')
sys.path.append('../../homd-data/')
sys.path.append('../../config/')
from connect import MyConnection





# def fix_typo(dbs):
#   """ RISKY Don't Change the db"""
#   for db in dbs['ncbi']:
#       print(db)
#
#       q = "ALTER TABLE "+db+".`assembly_report' CHANGE `filed_value` `field_value` TEXT"

"""
appending:  SEQF3075  to:  JH378873.1
appending:  SEQF3075  to:  JH378874.1
appending:  SEQF3075  to:  JH378882.1
appending:  SEQF3075  to:  JH378872.1
appending:  SEQF3075  to:  JH378878.1
appending:  SEQF3075  to:  JH378891.1
appending:  SEQF3075  to:  JH378875.1
appending:  SEQF3075  to:  JH378883.1
appending:  SEQF3075  to:  JH378877.1
appending:  SEQF3075  to:  JH378876.1
appending:  SEQF3075  to:  JH378884.1
appending:  SEQF3075  to:  JH378889.1
appending:  SEQF3075  to:  JH378886.1
appending:  SEQF3075  to:  JH378887.1
appending:  SEQF3075  to:  JH378885.1
appending:  SEQF3075  to:  JH378890.1
appending:  SEQF3075  to:  JH378880.1
appending:  SEQF3075  to:  JH378888.1
appending:  SEQF3075  to:  JH378881.1
appending:  SEQF3075  to:  JH378892.1
appending:  SEQF3075  to:  JH378879.1
appending:  SEQF3075  to:  JH378893.1
"""
def run(args):
    #global master_lookup
    master_lookup = {}


    # using .gz files JUST NEED CONTIGS
    count = 0
    ## NCBI ONLY
    db = 'PROKKA'
    table = 'contig'
    q = "SELECT genome_id, mol_id from `"+db+"`.`"+table+"`"
    print(q)
    result = myconn.execute_fetch_select(q)
    for row in result:
        if row[1] not in master_lookup:
            master_lookup[row[1]] = [row[0]]
            #master_lookup[record.id] = seqid
        else:
            master_lookup[row[1]].append(row[0])

 


    file =  os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    print_dict(file, master_lookup)

def print_dict(filename, dict):
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)

if __name__ == "__main__":

    usage = """
    USAGE:
        Initialize_Annotation.py
         --reads data from the ORIGINAL PROKKA and NCBI annotation DBs
         ie:  PROKKA_SEQF3654 and NCBI_SEQF3654

        will print out the needed initialization files for homd
        Needs MySQL: tries to read your ~/.my.cnf_node

           -outdir Output directory [default]
        for homd site
           -host [localhost (default), homd_v4, homd_v3] :: db_host

        for debugging
          -pp  pretty print
          -o <outfile>  Change outfile name from 'taxonomy'*

    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    #parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
    #                                                help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Contigs',
                                                    help=" ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", default = './',
                         help = "Not usually needed if -host is accurate")
    #parser.add_argument("-anno", "--annotation", required = True, action = 'store', dest = "anno",
    #                     help = "PROKKA or NCBI")
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
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.46'
    elif args.dbhost == 'homd_v3':
        dbhost = '192.168.1.42'
    elif args.dbhost == 'homd_v41':
        dbhost = '192.168.1.58'
    elif args.dbhost == 'homd_dev':
        dbhost= '192.168.1.69'
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost = 'localhost'
        
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print('Using',args.dbhost,dbhost)
    myconn = MyConnection(host=dbhost,   read_default_file = "~/.my.cnf_node")

    print(args)
    

    run(args)
