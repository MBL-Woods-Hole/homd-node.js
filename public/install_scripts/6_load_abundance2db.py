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

# these MUST match phage_data MySQL table fields
# NOT USED
ncbi_headers=['phage_id','Assembly_NCBI','SRA_Accession_NCBI','Submitters_NCBI','Release_Date_NCBI','Species_NCBI','Genus_NCBI','Family_NCBI','Molecule_type_NCBI',
'Sequence_Type_NCBI','Genotype_NCBI','Publications_NCBI','Geo_Location_NCBI','USA_NCBI','Host_NCBI','Isolation_Source_NCBI','Collection_Date_NCBI',
'BioSample_NCBI','GenBank_Title_NCBI']
            





def run_abundance_csv(args): 
    if args.name == 'eren':
        check = 'max Eren oral site'
        reference = 'Eren2014'
        tmp = 'BM-mean,BM-prev,KG-mean,KG-prev,HP-mean,HP-prev,TD-mean,TD-prev,PT-mean,PT-prev,Throat-mean,Throat-prev,Saliva-mean,Saliva-prev,SupP-mean,SupP-prev,SubP-mean,SubP-prev,Stool-mean,Stool-prev'
    elif args.name == 'segata':
        check = 'max Segata oral site'
        reference = 'Segata2012'
        tmp = 'BM-mean,BM-sd,KG-mean,KG-sd,HP-mean,HP-sd,Throat-mean,Throat-sd,PT-mean,PT-sd,TD-mean,TD-sd,Saliva-mean,Saliva-sd,SupP-mean,SupP-sd,SubP-mean,SubP-sd,Stool-mean,Stool-sd'
    else:
        check = 'max Dewhirst oral site'
        reference = 'Dewhirst35x9'
        tmp = 'BM-mean,BM-sd,BM-prev,KG-mean,KG-sd,KG-prev,HP-mean,HP-sd,HP-prev,TD-mean,TD-sd,TD-prev,PT-mean,PT-sd,PT-prev,Throat-mean,Throat-sd,Throat-prev,Saliva-mean,Saliva-sd,Saliva-prev,SupP-mean,SupP-sd,SupP-prev,SubP-mean,SubP-sd,SubP-prev'
    
    active = tmp.split(',')
    active = [n.replace('-','_') for n in active]
    print(active)
    
    with open(args.infile) as csv_file:
        #csv_reader = csv.reader(csv_file, delimiter=',')  # AV comma
        
        if args.delimiter == 'tab':
            csv_reader = csv.DictReader(csv_file, delimiter='\t') # KK tab
        else:
            csv_reader = csv.DictReader(csv_file, delimiter=',') # KK tab
        
        
        for row in csv_reader:
            values = []
            q = "INSERT IGNORE INTO `abundance` (reference,otid,taxonomy,level,`max_any_site`,`"+'`,`'.join(active)+"`) VALUES "
            if not row[check]:
               continue
            
            for item in active:
                values.append(row[item.replace('_','-')])
            q = q + "('"+reference+"','"+row['HMT']+"','"+row['Taxonomy']+"','"+row['level']+"','"+row['max any oral site']+"','"+"','".join(values)+"')"

            print(q)
            
    
            myconn_new.execute_no_fetch(q) 
        
if __name__ == "__main__":

    usage = """
    USAGE:
        takes the abundance data from 3 csv files to the database.
        HOMD-abundance-Segata.csv
        HOMD-abundance-Dewhirst.csv
        HOMD-abundance-Segata.csv
        
        ./6_load_abundance2db.py -i HOMD-abundance-XXX.csv -n name [segata, dewhirst or eren]
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=True,  action="store",   dest = "infile", default='none',
                                                    help=" ")
    parser.add_argument("-n", "--name",   required=True,  action="store",   dest = "name", 
                                                    help="segata, dewhirst or eren ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", default = './',
                         help = "Not usually needed if -host is accurate")
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
    if args.name not in ['segata','dewhirst','eren']:
        sys.exit('\nargs.name not in (segata,dewhirst,eren)\n')
    #parser.print_help(usage)
    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'                         
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
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    #myconn_tax = MyConnection(host=dbhost_old, db=args.TAX_DATABASE,   read_default_file = "~/.my.cnf_node")
    myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
    
    
    run_abundance_csv(args)
   
    