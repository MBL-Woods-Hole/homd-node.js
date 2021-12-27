#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)
##
import os, sys
import json
#from json import JSONEncoder
import argparse
import csv
from connect import MyConnection
import datetime
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())



def run_abundance_csv(args): 
    print(args.source)
    if args.source == 'eren2014_v1v3':
        check = 'Max'
        reference = 'Eren2014_v1v3'
        tmp = 'BM-mean,BM-sd,BM-prev,KG-mean,KG-sd,KG-prev,HP-mean,HP-sd,HP-prev,TD-mean,TD-sd,TD-prev,PT-mean,PT-sd,PT-prev,TH-mean,TH-sd,TH-prev,SV-mean,SV-sd,SV-prev,SupP-mean,SupP-sd,SupP-prev,SubP-mean,SubP-sd,SubP-prev,ST-mean,ST-sd,ST-prev'
    elif args.source == 'eren2014_v3v5':
        check = 'Max'
        reference = 'Eren2014_v3v5'
        tmp = 'BM-mean,BM-sd,BM-prev,KG-mean,KG-sd,KG-prev,HP-mean,HP-sd,HP-prev,TD-mean,TD-sd,TD-prev,PT-mean,PT-sd,PT-prev,TH-mean,TH-sd,TH-prev,SV-mean,SV-sd,SV-prev,SupP-mean,SupP-sd,SupP-prev,SubP-mean,SubP-sd,SubP-prev,ST-mean,ST-sd,ST-prev'
    elif args.source == 'segata':
        check = 'Max'
        reference = 'Segata2012'
        tmp = 'BM-mean,BM-sd,KG-mean,KG-sd,HP-mean,HP-sd,TH-mean,TH-sd,PT-mean,PT-sd,TD-mean,TD-sd,SV-mean,SV-sd,SupP-mean,SupP-sd,SubP-mean,SubP-sd,ST-mean,ST-sd'
    elif args.source == 'dewhirst_35x9':
        #check = 'max Dewhirst oral site'
        check = 'Max'
        reference = 'Dewhirst35x9'
        tmp = 'BM-mean,BM-sd,BM-prev,KG-mean,KG-sd,KG-prev,HP-mean,HP-sd,HP-prev,TD-mean,TD-sd,TD-prev,PT-mean,PT-sd,PT-prev,TH-mean,TH-sd,TH-prev,SV-mean,SV-sd,SV-prev,SupP-mean,SupP-sd,SupP-prev,SubP-mean,SubP-sd,SubP-prev'
    else:
        sys.exit('no source found')
    active = tmp.split(',')
    active = [n.replace('-','_') for n in active]
    print(active)
    
    with open(args.infile) as csv_file: 
        
        csv_reader = csv.DictReader(csv_file, delimiter='\t') # KK tab
        
        for row in csv_reader:
            values = []
            q = "INSERT IGNORE INTO `abundance` (reference,otid,taxonomy,level,`max_any_site`,`"+'`,`'.join(active)+"`) VALUES "
            if not row[check]:
               continue
            
            for item in active:
                values.append(row[item.replace('_','-')])
            q = q + "('"+reference+"','"+row['HMT']+"','"+row['Taxonomy']+"','"+row['Rank']+"','"+row['Max']+"','"+"','".join(values)+"')"

            print(q)
            
    
            myconn_new.execute_no_fetch(q) 
        
if __name__ == "__main__":

    usage = """
    USAGE:
        takes the abundance data from 3 csv files to the database.
        HOMD-abundance-Segata.csv   => segata_edit2021-12-24.csv
        HOMD-abundance-Dewhirst.csv => dewhirst_edit2021-12-27.csv
        HOMD-abundance-Segata.csv   =>  eren2014_v1v3_MeanStdevPrev_byRankFINAL_2021-12-26_homd.csv
        
        --source must be in ['eren2014_v1v3','eren2014_v3v5','dewhirst_35x9', 'segata']
        
        ./6_load_abundance2db.py -i HOMD-abundance-XXX.csv -n name [segata, dewhirst_35x9 or eren2014_v1v3 (v3v5)]
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=True,  action="store",   dest = "infile", default='none',
                                                    help=" ")
    parser.add_argument("-s", "--source",   required=True,  action="store",   dest = "source", 
                                    help="eren2014_v1v3 eren2014_v3v5 dewhirst_35x9 segata ")
    
    parser.add_argument("-host", "--host",
                        required = False, action = 'store', dest = "dbhost", default = 'localhost',
                        help = "choices=['homd',  'localhost']")
    parser.add_argument("-pp", "--prettyprint",
                        required = False, action = 'store_true', dest = "prettyprint", default = False,
                        help = "output file is human friendly")
    parser.add_argument("-d", "--delimiter", required = False, action = 'store', dest = "delimiter", default = 'tab',
                         help = "Delimiter: commaAV[Default]: 'comma' or tabKK: 'tab'")
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()") 
    args = parser.parse_args()
    if args.source not in ['eren2014_v1v3','eren2014_v3v5','dewhirst_35x9','segata']:
        print(usage)
        sys.exit()
    #parser.print_help(usage)
                         
    if args.dbhost == 'homd':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        #args.TAX_DATABASE = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        #dbhost_old = '192.168.1.51'
        dbhost_new= '192.168.1.40'
        args.outdir = '../homd-startup-data/'
        args.prettyprint = False

    elif args.dbhost == 'localhost':
        #args.json_file_path = '/Users/avoorhis/programming/homd-data/json'
        #args.TAX_DATABASE  = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        dbhost_new = 'localhost'
        #dbhost_old = 'localhost'
        
    else:
        sys.exit('dbhost - error')
    
    #myconn_tax = MyConnection(host=dbhost_old, db=args.TAX_DATABASE,   read_default_file = "~/.my.cnf_node")
    myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
    
    
    run_abundance_csv(args)
   
    