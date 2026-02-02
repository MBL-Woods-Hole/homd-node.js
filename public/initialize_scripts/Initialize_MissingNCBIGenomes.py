#!/usr/bin/env python

import os,sys,re,csv
import argparse
import operator
from datetime import datetime,date
import requests
import json
sys.path.append('/Users/avoorhis/programming/')
sys.path.append('/home/ubuntu/homd-work/')
from connect import MyConnection,mysql


table=''
today = str(date.today())
genomes_table = 'genomesV11.0'
all_genome_collector = {}
ncbi_genome_collector = {}
bakta_genome_collector = {}

def get_all_genomes():
    q = "SELECT genome_id as gid from homd.`"+genomes_table+'`'
    #q = "SELECT genome_id as gid, otid from `"+table+'` limit 10'
    
    rows = myconn.execute_fetch_select_dict(q)
    for row in rows:
        #print(row)
        all_genome_collector[row['gid']] = 1

def get_ncbi_genomes():
    q = "SELECT DISTINCT genome_id as gid from NCBI.info"
    #q = "SELECT genome_id as gid, otid from `"+table+'` limit 10'
    
    rows = myconn.execute_fetch_select_dict(q)
    for row in rows:
        #print(row)
        ncbi_genome_collector[row['gid']] = 1
        

    
def run(args):
    
    
    missing_collector  = []
    #missing_collector['ncbi'] = []
    #missing_collector['bakta'] = []
    for gid in all_genome_collector:
        
        if gid not in ncbi_genome_collector:
            missing_collector.append(gid)
        
        # if gid not in bakta_genome_collector:
#             missing_collector['bakta'].append(gid)
#     
    file =  os.path.join(args.outdir,args.outfileprefix+'.json')
    print_dict(file, missing_collector)
    print('count missing NCBI',len(missing_collector))
    
def print_dict(filename, dict):
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)
        
    
def write_to_db(lst):
    
    for q in lst:
        
        if args.write_to_db:
            myconn.execute_no_fetch(q)
            print('Updating',q)
        else:
            print('Add -w to CL to Update:',q)
            
    
if __name__ == "__main__":

    usage = """
    USAGE:
        ./Initialize_MissingNCBIGenomes
        
        Should be run on server with all NCBI and PROKKA Genomes
        

    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    #parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
    #                                                help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-MissingGenomes',
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
    if args.dbhost == 'homd_v3':
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
    get_all_genomes()
    get_ncbi_genomes()
    #get_bakta_genomes()
    run(args)
    
   



