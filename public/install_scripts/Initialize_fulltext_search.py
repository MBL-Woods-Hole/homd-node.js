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


integers = ['0','1','2','3','4','5','6','7','8','9']

def run(args):
    master_lookup ={}
    if args.dbanno.upper() == 'PROKKA':
        args.from_db = 'PROKKA_meta'
        args.to_table = 'prokka_orf_search2'
    elif args.dbanno.upper() == 'NCBI':
        args.from_db = 'NCBI_meta'
        args.to_table = 'ncbi_orf_search2'
    else:
        sys.exit('no DB')
    args.from_table = 'orf'
    args.to_db = 'ANNO_search'
    
    
    # prokka first
    
    #q = "SELECT seq_id,protein_id,accession,product FROM `"+args.db+"`.`"+args.table+"` "+args.limit
    #q_from = "SELECT seq_id,protein_id,IFNULL(accession, ''),product,IFNULL(length_na, ''),IFNULL(length_aa, ''),IFNULL(gene, ''),stop,start"
    q_from = "SELECT protein_id, product"
    
    q_from += " FROM `"+args.from_db+"`.`"+args.from_table+"`"
    q_from += " WHERE seq_id like 'SEQF%s%%' "
    
    #q_to = "INSERT ignore into `"+args.to_db+"`.`"+args.to_table+"` (protein_id, search_text)"
    q_to = "INSERT ignore into `"+args.to_db+"`.`"+args.to_table+"` (protein_id, product)"
    q_to += " VALUES('%s','%s')"
    # 
    #https://stackoverflow.com/questions/45669229/does-mysqls-fulltext-search-return-the-same-results-for-myisam-and-innodb#:~:text=There%20are%20actually%20some%20notable,excluded%20in%20the%20MyISAM%20results.
    # LOAD DATA LOCAL INFILE 'homd_PROKKA_ORF_Search-1-sql.tsv' INTO TABLE prokka_orf_search FIELDS TERMINATED BY 
    #'\t' IGNORE 1 LINES (protein_id,search_text);
    for num in integers:
        seqidnumber = args.num+num
        q2 = q_from % (seqidnumber)
        print(q2)
        result = myconn.execute_fetch_select(q2)
        count = 0
        if len(result) == 0:
            print('no data')
        for row in result:
            #print(row)
            # pid = row[1]
#             prod = row[3].replace("'","")  #product
#             text = '|'.join([row[0],pid,row[2],prod,row[4],row[5],row[6],row[7],row[8]])
            
            pid = row[0]
            prod = row[1].replace("'","")  #product
            
            #print(text)
            q = q_to % (pid, prod)
            #print(q)
            if pid:
                myconn.execute_no_fetch(q)
        print('Done with SEQF'+seqidnumber)




if __name__ == "__main__":

    usage = """
    USAGE:
        Initialize_Search.py
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
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", 
default='homdData-ORF',
                                                    help=" ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", 
default = './',
                         help = "Not usually needed if -host is accurate")
    parser.add_argument("-db", "--database", required = False, action = 'store', dest = "dbanno", default='NCBI',
                        help = "PROKKA or NCBI")
    parser.add_argument("-host", "--host",
                        required = False, action = 'store', dest = "dbhost", default = 'localhost',
                        help = "choices=['homd',  'localhost']")
    parser.add_argument("-n", "--num",   required=False,  action="store",    dest = "num", default='1',
                                                    help="")
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", 
default=False,
                                                    help="verbose print()")
    parser.add_argument("-l", "--limit",   required=False,  action="store",    dest = "limit", default='',
                                                    help="") 
                                                  
    args = parser.parse_args()

    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'
    if args.dbhost == 'homd':
        #args.DATABASE  = 'homd'
        
        #dbhost = '192.168.1.42'
        # CCD Drive
        dbhost = '192.168.1.46'
        
    elif args.dbhost == 'localhost':  #default
        #args.DATABASE = 'homd'
        dbhost = 'localhost'
        
    else:
        sys.exit('dbhost - error')
    args.indent = None
    
    # SELECT seq_id as gid, protein_id, product from `PROKKA_meta`.orf WHERE product like '%end%'
    myconn = MyConnection(host=dbhost,   read_default_file = "~/.my.cnf_node")
    if args.limit:
       args.limit = "limit "+args.limit
    run(args)
    print('Done')
    
