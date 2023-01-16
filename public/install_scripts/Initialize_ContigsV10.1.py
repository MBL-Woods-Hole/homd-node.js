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
sys.path.append('../../../homd-data/')
#from connect import MyConnection



def find_databases(args):
    
    
    dbs = {}
    dbs['ncbi'] = []
    dbs['prokka'] = []
    for anno in dbs:
        q = "SHOW DATABASES LIKE '"+anno.upper()+"\_%'"
        print(q)
        result = myconn.execute_fetch_select(q)
        
        for row in result:
            db = row[0]
            print('found db ',db)
            if db[-8:] == 'template':
                continue
            dbs[anno].append(db)
    return dbs
    
# def fix_typo(dbs):
# 	""" RISKY Don't Change the db"""
# 	for db in dbs['ncbi']:
# 	    print(db)  
# 	    
# 	    q = "ALTER TABLE "+db+".`assembly_report' CHANGE `filed_value` `field_value` TEXT"  
	
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
def run(args, dbs):
    #global master_lookup
    master_lookup = {}
    
#     for db in dbs['ncbi']:
#         print('Running1',db)
#         
#         # comes from file: genomic.fna.gz
#         q = "SELECT accession, GC from "+db+".molecules"
#         
#         result = myconn.execute_fetch_select_dict(q)
#         for row in result:
#             
#             parts = row['accession'].split('|')
#             contig = parts[1]
#             seqid = parts[0]
#             gc = row['GC']
#             #print('contig',contig)
#             if contig not in master_lookup:
#                 #master_lookup[contig] = [{'sid':seqid,'gc':gc}]
#                 master_lookup[contig] = [seqid]
#             else:
#                 print('appending: ',seqid,' to: ',contig)
#                 #master_lookup[contig].append({'sid':seqid,'gc':gc})
#                 master_lookup[contig].append(seqid)
    # using .gz files JUST NEED CONTIGS
    count = 0
    for directory in os.listdir(args.indir):
        d = os.path.join(args.indir, directory)
        seqid = directory
        count +=1
        print(count,seqid)
        for filename in os.listdir(d):
            f = os.path.join(d, filename)
            #print('directory',directory)
            
            if os.path.isfile(f) and f.endswith('genomic.fna.gz') and not f.endswith('rna_from_genomic.fna.gz') \
                             and not f.endswith('cds_from_genomic.fna.gz'):
                with gzip.open(f, "rt") as handle:
                    for record in SeqIO.parse(handle, "fasta"):
                        #print(record.id)
                        #print(record.description)
                        
                        if record.id not in master_lookup:
                            master_lookup[record.id] = [seqid]
                            #master_lookup[record.id] = seqid
                        else:
                            master_lookup[record.id].append(seqid)
                            #print('DUPE',seqid,record.id)
                            #sys.exit() 
                            
    #print('master_lookup',master_lookup)           
    # for rec in master_lookup:
#        if len(master_lookup[rec]) >1:
#            print('More than one seqid for this accno:',rec)
    #for db in dbs['prokka']:
    #    print('Running2',db)
        
            

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
           -host homd
           
        for debugging
          -pp  pretty print
          -o <outfile>  Change outfile name from 'taxonomy'*
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    #parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
    #                                                help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-ContigsNEW',
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
    if args.dbhost == 'homd':
        #args.DATABASE  = 'homd'
        dbhost_old = '192.168.1.51'
        #dbhost_new = '192.168.1.40'
        args.indir = '/mnt/efs/bioinfo/projects/homd_add_genomes_V10.1/GCA_V10.1_all'
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost_old = 'localhost'
        args.indir = '/Users/avoorhis/programming/homd-work/new_genomesV10.1/GCA_V10.1_all'
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print()
    #myconn = MyConnection(host=dbhost_old,   read_default_file = "~/.my.cnf_node")

    print(args)
    databases ={}
    #databases = find_databases(args)
    
    #print('dbs',databases)
    
    run(args, databases)
    
    