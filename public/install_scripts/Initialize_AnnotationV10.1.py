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
sys.path.append('../../../homd-data/')
from connect import MyConnection
usable_annotations = ['ncbi','prokka']
# obj = {seqid:[]}             
def make_anno_object_prokka():

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
def make_anno_object_ncbi():

    new_obj={}
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
    
# "gid": "SEQF1003",
# "organism": "Atopobium rimae ATCC 49626 (actinobacteria)",
# "contigs": 9,
# "bases": 1626291,
# "CDS": "",
# "rRNA": "",
# "tRNA": "",
# "tmRNA": ""
def run(args,dbs):
    #global master_lookup
    master_lookup = {}
    # prokka first
    anno = 'prokka'
    for directory in os.listdir(args.prokka_indir):
        d = os.path.join(args.prokka_indir, directory)
        if os.path.isdir(d) and directory.startswith('SEQF'):
            gid = directory
            if gid not in master_lookup:
                master_lookup[gid] = {}
                master_lookup[gid]['prokka'] = make_anno_object_prokka()
                master_lookup[gid]['ncbi']   = make_anno_object_ncbi()
        
            for filename in os.listdir(d):
                f = os.path.join(d, filename)
                if os.path.isfile(f) and f.endswith('.txt'):
                    for line in open(f, 'r'):
                        line = line.strip()
                        #print(line)
                        i = line.split(':')
                        if line.startswith('organism'):
                            master_lookup[gid][anno]['organism'] = i[1].strip()
                        if line.startswith('contigs'):
                            master_lookup[gid][anno]['contigs'] = i[1].strip()
                        if line.startswith('bases'):
                            master_lookup[gid][anno]['bases'] = i[1].strip()
                        if line.startswith('CDS'):
                            master_lookup[gid][anno]['CDS'] = i[1].strip()
                        if line.startswith('rRNA'):
                            master_lookup[gid][anno]['rRNA'] = i[1].strip()
                        if line.startswith('tRNA'):
                            master_lookup[gid][anno]['tRNA'] = i[1].strip()
                        if line.startswith('tmRNA'):
                            master_lookup[gid][anno]['tmRNA'] = i[1].strip()
    
    #ncbi look at features
    anno = 'ncbi'
    for directory in os.listdir(args.ncbi_indir):
        d = os.path.join(args.ncbi_indir, directory)
        if os.path.isdir(d) and directory.startswith('SEQF'):
            gid = directory
            if gid not in master_lookup:
                master_lookup[gid] = {}
                master_lookup[gid]['prokka'] = make_anno_object_prokka()
                master_lookup[gid]['ncbi']   = make_anno_object_ncbi()
            print('directory',directory)
            for filename in os.listdir(d):
                f = os.path.join(d, filename)
                print('f',f)
                if os.path.isfile(f) and f.endswith('feature_count.txt.gz'):
                    CDSct = 0
                    rRNAct = 0
                    tRNAct = 0
                    tmRNAct = 0
                    for line in gzip.open(f, 'rt'):
                        line=line.strip()
                        i = line.split('\t')
                        print(i)
                        if line.startswith('CDS'):
                            CDSct += int(i[-1])
                        if line.startswith('rRNA'):
                            rRNAct += int(i[-1])
                        if line.startswith('tRNA'):
                            tRNAct += int(i[-1])
                        if line.startswith('tmRNA'):
                            tmRNAct += int(i[-1])
                    master_lookup[gid][anno]['CDS'] = str(CDSct)
                    master_lookup[gid][anno]['rRNA'] = str(rRNAct)
                    master_lookup[gid][anno]['tRNA'] = str(tRNAct)
                    master_lookup[gid][anno]['tmRNA'] = str(tmRNAct)
           
    file =  os.path.join(args.outdir,args.outfileprefix+'Lookup.json')  
    print_dict(file, master_lookup) 
    
def old_way(args,dbs):
    master_lookup = {}
    for db in dbs['prokka']:
        print('Running1',db)
        gid = db.split('_')[1]
        anno = 'prokka'
        
        
        if gid not in master_lookup:
            master_lookup[gid] = {}
            master_lookup[gid]['prokka'] = make_anno_object()
            master_lookup[gid]['prokka']['gid'] = gid
            master_lookup[gid]['ncbi']   = make_anno_object()
            master_lookup[gid]['ncbi']['gid'] = gid
        
        q = "SELECT * from "+db+".prokka"
        #print(q)
        result = myconn.execute_fetch_select_dict(q)
        for row in result:
            for n in row:
                if n in master_lookup[gid]['prokka']:
                    master_lookup[gid]['prokka'][n] = str(row[n]).strip()
                        
    # ncbi feature_count.txt  gzipped!
    # prokka SEQF10131/GCA_000392455.3.txt
    for db in dbs['ncbi']:
        print('Running2',db)
        gid = db.split('_')[1]
        anno = 'ncbi'
        # organism
        q1 = "select `field_value` from "+db+".assembly_stats WHERE field_name = 'Organism name'"
        resultq1 = myconn.execute_fetch_one(q1)
        organism = resultq1[0].strip()
        master_lookup[gid]['ncbi']['organism'] = organism
        # for CDS,rrna,trna,tmrna
        q2 = "SELECT `type`,count(*) AS count from "+db+".gff group by `type`"
        #print(q2)
        result2 = myconn.execute_fetch_select_dict(q2)
        for row in result2:
            #print(row)
            if row['type'] == 'CDS':
               master_lookup[gid]['ncbi']['CDS'] = row['count']
            if row['type'] == 'rRNA':
               master_lookup[gid]['ncbi']['rRNA'] = row['count']
            if row['type'] == 'tmRNA':
               master_lookup[gid]['ncbi']['tmRNA'] = row['count']
            if row['type'] == 'tRNA':
               master_lookup[gid]['ncbi']['tRNA'] = row['count']     
            
        q3 = "SELECT sum(bps) AS bases, count(*) AS contigs FROM "+db+".molecules "
        result3 = myconn.execute_fetch_select_dict(q3)
        for row in result3:
            #print(row)
            master_lookup[gid]['ncbi']['bases']   = int(row['bases'])
            master_lookup[gid]['ncbi']['contigs'] = int(row['contigs'])
            

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
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-AnnotationNEW',
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
        args.ncbi_indir = '/mnt/efs/bioinfo/projects/homd_add_genomes_V10.1/GCA_V10.1_all'
        args.prokka_indir = '/mnt/efs/bioinfo/projects/homd_add_genomes_V10.1/prokka_V10.1_all'
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost_old = 'localhost'
        args.ncbi_indir = '/Users/avoorhis/programming/homd-work/new_genomesV10.1/GCA_V10.1_all'
        args.prokka_indir = '/Users/avoorhis/programming/homd-work/new_genomesV10.1/prokka_V10.1_all'
        
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print()
    myconn = MyConnection(host=dbhost_old,   read_default_file = "~/.my.cnf_node")

    print(args)
    databases ={}
    #databases = find_databases(args)
    
    #print('dbs',databases)
    
    run(args,databases)
    
    