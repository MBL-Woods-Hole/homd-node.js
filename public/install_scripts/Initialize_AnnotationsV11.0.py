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
# obj = {seqid:[]}

# def get_seqid_ver_gcaid(file):
#     gid_list = {}
#     with open(file, 'r') as handle:
#         for line in handle:
#             line = line.strip().split('\t')
#             gid_list[line[0]] = {}
#             gid_list[line[0]]['n'] = line[1]
#             gid_list[line[0]]['gca'] = line[2]
#     return gid_list
# def get_seqids_from_new_genomes_file(file):
#     file_list = []
#     with open(file, 'r') as handle:
#         first_line = handle.readline()
#         for line in handle:
#             
#             line = line.strip().split('\t')
#             if line[1].startswith('SEQF'):
#                 if '.' in line[1]:
#                     file_list.append(line[1].split('.')[0])
#                 else:
#                     file_list.append(line[1])
#     
#     #print(file_list,len(file_list))
#     return file_list

def make_anno_object():

    new_obj={}
    new_obj['organism'] = ''
    new_obj['contigs'] = ''
    new_obj['bases'] = ''
    new_obj['CDS'] = ''
    new_obj['rRNA'] = ''
    new_obj['tRNA'] = ''
    new_obj['tmRNA'] = ''
    ## ignore for now repeat_region, misc_RNA
    return new_obj


# def find_databases(args):
# 
# 
#     dbs = {}
#     dbs['ncbi'] = []
#     dbs['prokka'] = []
#     for anno in dbs:
#         q = "SHOW DATABASES LIKE '"+anno.upper()+"\_%'"
#         print(q)
#         result = myconn.execute_fetch_select(q)
# 
#         for row in result:
#             db = row[0]
#             print('found db ',db)
#             if db[-8:] == 'template':
#                 continue
#             dbs[anno].append(db)
#     return dbs

# "gid": "SEQF1003",
# "organism": "Atopobium rimae ATCC 49626 (actinobacteria)",
# "contigs": 9,
# "bases": 1626291,
# "CDS": "",
# "rRNA": "",
# "tRNA": "",
# "tmRNA": ""
def get_seqids(args):
    lst = []
    q1 = "SELECT genome_id from `homd`.`genomesV11.0`"
    rows = myconn.execute_fetch_select(q1)
    for row in rows:
        lst.append(row[0])
    return lst
def run(args):
    #global master_lookup
    master_lookup = {}
    
    
    # prokka first
    
    #q_prokka_base = "SELECT organism,contigs,bases,CDS,rRNA,tRNA,tmRNA FROM `PROKKA_meta`.`prokka_info` WHERE genome_id='%s'"
    #q_ncbi_base = "SELECT organism,contigs,bases,CDS,rRNA,tRNA,tmRNA FROM `NCBI_meta`.`ncbi_info` WHERE genome_id='%s'"
    q_prokka_base = "SELECT organism,contigs, gene,CDS,rRNA,tRNA,tmRNA,mRNA FROM `homd`.`genomes_prokkaV11.0` WHERE genome_id='%s'"
    q_ncbi_base   = "SELECT organism,contigs, gene,CDS,rRNA,tRNA,tmRNA,mRNA FROM `homd`.`genomes_ncbiV11.0`   WHERE genome_id='%s'"
    fields = ['organism','contigs','gene','CDS','rRNA','tRNA','tmRNA','mRNA']
    
    for gid in args.seqids_from_db:
        #print(gid)
        anno = 'prokka'
        
        
        if not gid in master_lookup:
            master_lookup[gid]={}
        if 'prokka' not in master_lookup[gid]:
            master_lookup[gid]['prokka']={}
        
        q1 = q_prokka_base % (gid)
        #print(q1)
        row = myconn.execute_fetch_select(q1)
            
        if myconn.cursor.rowcount > 0:
            
            master_lookup[gid][anno]['organism'] = row[0][0]
            master_lookup[gid][anno]['contigs']  = row[0][1]
            master_lookup[gid][anno]['gene']    = row[0][2]
            master_lookup[gid][anno]['CDS']      = row[0][3]
            master_lookup[gid][anno]['rRNA']     = row[0][4]
            master_lookup[gid][anno]['tRNA']     = row[0][5]
            master_lookup[gid][anno]['tmRNA']    = row[0][6]
            master_lookup[gid][anno]['mRNA']    = row[0][7]
    
   
        anno = 'ncbi'
        if 'ncbi' not in master_lookup[gid]:
            master_lookup[gid]['ncbi']={}
        q2 = q_ncbi_base % (gid)
        row = myconn.execute_fetch_select(q2)
            
        if myconn.cursor.rowcount > 0:
            
            master_lookup[gid][anno]['organism'] = row[0][0]
            master_lookup[gid][anno]['contigs']  = row[0][1]
            master_lookup[gid][anno]['gene']    = row[0][2]
            master_lookup[gid][anno]['CDS']      = row[0][3]
            master_lookup[gid][anno]['rRNA']     = row[0][4]
            master_lookup[gid][anno]['tRNA']     = row[0][5]
            master_lookup[gid][anno]['tmRNA']    = row[0][6]
            master_lookup[gid][anno]['mRNA']    = row[0][7]

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
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Annotation',
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
    elif args.dbhost == 'homd_dev':
        dbhost = '192.168.1.58'
    elif args.dbhost == 'localhost':  #default
        dbhost = 'localhost'
        

    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print('Using',args.dbhost,dbhost)
    myconn = MyConnection(host=dbhost,   read_default_file = "~/.my.cnf_node")
    #seqid_file = 'new_gca_selected_8148_seqID.csv'
    #args.seqids_from_file = get_seqids_from_new_genomes_file(seqid_file)
    #args.seqid_ver_gcaid = get_seqid_ver_gcaid('seqid_ver_gcaid.txt')
    args.seqids_from_db = get_seqids(args)

    run(args)