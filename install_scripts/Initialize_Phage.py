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
from connect import MyConnection

# TABLES

first_query ="""
    SELECT phage_id as pid, Assembly_NCBI,SRA_Accession_NCBI,Submitters_NCBI,Release_Date_NCBI, 
  Family_NCBI,Genus_NCBI,Species_NCBI, Genotype_NCBI, Publications_NCBI,  Molecule_type_NCBI,Sequence_Type_NCBI,Geo_Location_NCBI,
  USA_NCBI,Host_NCBI,Isolation_Source_NCBI,Collection_Date_NCBI,BioSample_NCBI,GenBank_Title_NCBI 
    from phage_data
    ORDER BY pid
"""

q_tax = "SELECT \
   `otid_prime`.`otid` AS `otid`, \
   `genus`.`genus` AS `genus`,genus.genus_id, \
   `species`.`species` AS `species`,species.species_id \
FROM ((((((((`taxonomy` join `otid_prime` on((`taxonomy`.`taxonomy_id` = `otid_prime`.`taxonomy_id`))) join `domain` on((`taxonomy`.`domain_id` = `domain`.`domain_id`))) join `phylum` on((`taxonomy`.`phylum_id` = `phylum`.`phylum_id`))) join `klass` on((`taxonomy`.`klass_id` = `klass`.`klass_id`))) join `order` on((`taxonomy`.`order_id` = `order`.`order_id`))) join `family` on((`taxonomy`.`family_id` = `family`.`family_id`))) join `genus` on((`taxonomy`.`genus_id` = `genus`.`genus_id`))) join `species` on((`taxonomy`.`species_id` = `species`.`species_id`))) order by `otid_prime`.`otid`;"
# otid=336  gid=SEQF1970   Atopobium  rimae 




def create_phage(pid):  # basics - page1 Table: genomes  phage_data_id IS UNIQUE
    """  
    phage_data_id int(11) unsigned  NO  PRI NULL  auto_increment
  Assembly_NCBI varchar(50) NO      
  SRA_Accession_NCBI  varchar(100)  NO      
  Submitters_NCBI text  YES   NULL  
  Release_Date_NCBI varchar(50) YES   NULL  
  Family_NCBI varchar(50) YES   NULL  
  Genus_NCBI  varchar(50) YES   NULL  
  Species_NCBI  varchar(100)  YES   NULL  
  Molecule_type_NCBI  varchar(50) YES   NULL  
  Sequence_Type_NCBI  varchar(50) YES   NULL  
  Geo_Location_NCBI varchar(100)  YES   NULL  
  USA_NCBI  varchar(10) YES   NULL  
  Host_NCBI varchar(100)  YES   NULL  
  Isolation_Source_NCBI varchar(100)  YES   NULL  
  Collection_Date_NCBI  varchar(100)  YES   NULL  
  BioSample_NCBI  varchar(20) YES   NULL  
  GenBank_Title_NCBI  varchar(100)  YES   NULL  
  
    """
    phage = {}
    phage['pid']    = pid       # phage_id initially this is just sequential: O
    
    phage['family_ncbi'] = ''  
    phage['genus_ncbi']   = ''      # 
    phage['species_ncbi']   = ''      #
    phage['assembly_ncbi']  = ''      # 
    phage['sra_accession_ncbi']   = ''   #
    phage['submitters_ncbi'] = ''   # 
    phage['release_date_ncbi']  = '' # 
    phage['molecule_type_ncbi']   = ''  # 
    phage['sequence_type_ncbi']     = ''   # 
    phage['geo_location_ncbi'] = ''   # 
    phage['usa_ncbi']   = ''      # 
    phage['publications_ncbi'] = '' 
    phage['genotypes_ncbi'] = '' 
    phage['host_ncbi'] = ''
    phage['host_otid'] = ''         # searched/calulated of host bacteria
    phage['isolation_source_ncbi']    = ''   # table 2
    phage['collection_date_ncbi']   = ''  # table 2
    phage['biosample_ncbi'] = ''    # table 2
    phage['genbank_title_ncbi']   = ''
    
    return phage


master_lookup = {}    

              
def run_first(args):
    """ date not used"""
    global master_lookup
    
    tax_result = myconn.execute_fetch_select_dict(q_tax)
    tax_genus_sp_lookup = {}
    for n in tax_result:
        if str(n['otid']) in tax_genus_sp_lookup:
            sys.exit('tax error')
        tax_genus_sp_lookup[str(n['otid'])] = {'genus':n['genus'],'genus_id':n['genus_id'],'species_id':n['species_id'], 'species':n['species']}
    
    
    
    result = myconn.execute_fetch_select_dict(first_query)
    lst = []
    for obj in result:
        pid = str(obj['pid'])
        pobj = create_phage(pid)
        
        
        # use vobj to screen out from full mysql query
        obj_lower =  {k.lower(): v for k, v in obj.items() if k.lower() in pobj.keys()}
        # [f(x) for x in sequence if condition]
        master_lookup[pid] = {}
        for n in obj_lower:
            #print('n',n)
            
            if n in pobj:
                if obj_lower[n] and n == "host_ncbi":
                    #print('n from spreadsheet:',obj_lower[n])
                    item = obj_lower[n].split()
                    genus_gen = item[0]
                    species_gen = ' '.join(item[1:])
                    print('phage host species:',species_gen)
                    for otid in tax_genus_sp_lookup:
                        genus_tax = tax_genus_sp_lookup[otid]['genus']
                        species_tax = tax_genus_sp_lookup[otid]['species']
                        #if genus_gen == genus_tax and species_gen == species_tax:
                        # to include all strains use this 'in' syntax
                        if genus_gen == genus_tax and species_tax in species_gen:
                             master_lookup[pid]['host_otid'] = otid
                master_lookup[pid][n] = obj_lower[n]
            if 'host_otid' not in master_lookup[pid]:                  
                master_lookup[pid]['host_otid'] = ''            
                
        
    # create list from obj
    lst =    list(master_lookup.values()) 
    write_files(args,lst)
    
def write_files(args,lst):    
    file1 = os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    file2 = os.path.join(args.outdir,args.outfileprefix+'List.json')
    print('writing',file1)
    with open(file1, 'w') as outfile1:
        json.dump(master_lookup, outfile1, indent=args.indent)
    print('writing',file2)
    with open(file2, 'w') as outfile1:
        json.dump(lst, outfile1, indent=args.indent)    
            
if __name__ == "__main__":

    usage = """
    USAGE:
        Initialize_Phage.py  (gets data from db:homd; table:phage_data)
        
          Phage data is now in database table:
           but see: phage_starter_dataKK.csv
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    #parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
    #                                                help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Phage',
                                                    help=" ")
    parser.add_argument("-outdir", "--out_directory", required = False, action = 'store', dest = "outdir", default = './',
                         help = "Not usually needed if -host is accurate")
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
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.40'
        
    elif args.dbhost == 'localhost':  #default
        args.DATABASE = 'homd'
        dbhost = 'localhost'
    else:
      sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print()
    myconn = MyConnection(host=dbhost, db=args.DATABASE,  read_default_file = "~/.my.cnf_node")

    print(args)
    run_first(args)
    # run_second(args)
#     run_third(args)
    