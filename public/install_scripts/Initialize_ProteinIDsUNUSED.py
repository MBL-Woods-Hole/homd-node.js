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
sys.path.append('../../../homd-data/')
from connect import MyConnection
usable_annotations = ['ncbi','prokka']
# obj = {seqid:[]}             
def make_anno_object():

    new_obj={}
    new_obj['gid'] = ''
    new_obj['organism'] = ''
    new_obj['contigs'] = ''
    new_obj['bases'] = ''
    new_obj['CDS'] = ''
    new_obj['rRNA'] = ''
    new_obj['tRNA'] = ''
    new_obj['tmRNA'] = ''
    ## ignore for now repeat_region, misc_RNA
    return new_obj

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
	    
def run(args, dbs):
    #global master_lookup
    master_lookup = []
    # prokka first
    for db in dbs['prokka']:
        print('Running1 prokka',db)
        gid = db.split('_')[1]
        anno = 'prokka'
        
        # pid = {anno,gid,gene,product}
        #if pid not in master_lookup:
        #    master_lookup[pid] = {}
            
        
        q = "SELECT gene,PID,product from "+db+".ORF_seq"
        #print(q)
        result = myconn.execute_fetch_select_dict(q)
        for row in result:
            #print(row)
            
            
            master_lookup.append( {'pid':row['PID'],'gene':row['gene'],'anno':anno,'gid':gid,'product':row['product']} )
            
#                         
    for db in dbs['ncbi']:
        print('Running1 prokka',db)
        gid = db.split('_')[1]
        anno = 'ncbi'
        
        # pid = {anno,gid,gene,product}
        #if pid not in master_lookup:
        #    master_lookup[pid] = {}
            
        
        q = "SELECT gene,PID,product from "+db+".ORF_seq"
        #print(q)
        result = myconn.execute_fetch_select_dict(q)
        for row in result:
            #print(row)
            
            master_lookup.append( {'pid':row['PID'],'gene':row['gene'],'anno':anno,'gid':gid,'product':row['product']} )
            

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
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-ProteinIDs',
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
        
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost_old = 'localhost'
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print()
    myconn = MyConnection(host=dbhost_old,   read_default_file = "~/.my.cnf_node")

    print(args)
    
    databases = find_databases(args)
    
    #print('dbs',databases)
    
    run(args,databases)
    
    