#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)

import os, sys
import json,gzip
import argparse
import datetime
from datetime import datetime,date
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(date.today())
sys.path.append('../homd-data/')
sys.path.append('../../homd-data/')
sys.path.append('../../config/')
from connect import MyConnection
usable_annotations = ['ncbi','prokka']




def run(args):
    master_lookup ={}
    
    
    
    # prokka first
    
    #q = "SELECT seq_id,protein_id,accession,product FROM `"+args.db+"`.`"+args.table+"` "+args.limit
    q = "SELECT seq_id,protein_id,accession,product FROM `"+args.db+"`.`"+args.table+"`"
    q += " WHERE seq_id like 'SEQF"+args.num+"%' " +args.limit
    
    print(q)
    # seq_id-protein_id is UNIQUE
    fields = ['seq_id','protein_id','accession','product']
    file =  os.path.join(args.outdir,args.outfileprefix+args.db+args.num+'Search.list')
    fh = open(file,'w')
    
    #SELECT seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%end%'
    result = myconn.execute_fetch_select(q)
    count = 0
    for row in result:
       print(row)
       unique = row[0]+'|'+row[1]
       string = row[2]+'|'+row[3]
       #"SEQF4098|MBX3952457.1": "QGBS01000001.1|hypothetical protein",
       master_lookup[unique] = string
       fh.write(args.dbanno.lower()+'|'+unique+'|'+string+'\n')
       count += 1
    
    #fh.write(' '+str(count))
    fh.write('\n')
    fh.close()
    #print_dict(file, master_lookup)


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
           -host homd

        for debugging
          -pp  pretty print
          -o <outfile>  Change outfile name from 'taxonomy'*

    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    #parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
    #                                                help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-ORF',
                                                    help=" ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", default = './',
                         help = "Not usually needed if -host is accurate")
    parser.add_argument("-db", "--database", required = False, action = 'store', dest = "dbanno", default='NCBI',
                        help = "PROKKA or NCBI")
    parser.add_argument("-host", "--host",
                        required = False, action = 'store', dest = "dbhost", default = 'localhost',
                        help = "choices=['homd',  'localhost']")
    parser.add_argument("-pp", "--prettyprint",
                        required = False, action = 'store_true', dest = "prettyprint", default = False,
                        help = "output file is human friendly")
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()")
    parser.add_argument("-n", "--num",   required=False,  action="store",    dest = "num", default='1',
                                                    help="")
    parser.add_argument("-l", "--limit",   required=False,  action="store",    dest = "limit", default='',
                                                    help="")                                                
    args = parser.parse_args()

    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'
    if args.dbhost == 'homd':
        #args.DATABASE  = 'homd'
        
        dbhost = '192.168.1.42'
        
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost = 'localhost'
        

    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    # SELECT seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%end%'
    myconn = MyConnection(host=dbhost,   read_default_file = "~/.my.cnf_node")
    
    
    args.db = args.dbanno.upper()+'_meta'
    args.table='orf'
    if args.limit:
       args.limit = "limit "+args.limit
    
    run(args)