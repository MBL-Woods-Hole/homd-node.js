#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)
##
import os, sys
import json
#from json import JSONEncoder
import argparse
#import ast
from connect import MyConnection
import datetime
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())

# TABLES
taxon_tbl           = 'taxon_list'   # UNIQUE  - This is the defining table 



master_tax_lookup={}



query_taxa ="""
SELECT a.oral_taxon_id as otid, a.genus as genusTT, a.species as speciesTT
from {tbl} as a

ORDER BY otid
""".format(tbl=taxon_tbl)


counts = {}
tt_lookup = {}

def create_taxon(otid):
    """   """
    taxon = {}
    taxon['otid'] = otid
    taxon['genus'] = ''
    taxon['species'] = ''
    return taxon
    
q_tax = "SELECT \
   `otid_prime`.`otid` AS `otid`, \
   `genus`.`genus` AS `genus`,genus.genus_id, \
   `species`.`species` AS `species`,species.species_id \
FROM ((((((((`taxonomy` join `otid_prime` on((`taxonomy`.`taxonomy_id` = `otid_prime`.`taxonomy_id`))) join `domain` on((`taxonomy`.`domain_id` = `domain`.`domain_id`))) join `phylum` on((`taxonomy`.`phylum_id` = `phylum`.`phylum_id`))) join `klass` on((`taxonomy`.`klass_id` = `klass`.`klass_id`))) join `order` on((`taxonomy`.`order_id` = `order`.`order_id`))) join `family` on((`taxonomy`.`family_id` = `family`.`family_id`))) join `genus` on((`taxonomy`.`genus_id` = `genus`.`genus_id`))) join `species` on((`taxonomy`.`species_id` = `species`.`species_id`))) order by `otid_prime`.`otid`;"
# otid=336	gid=SEQF1970   Atopobium	rimae	
q_gene = "SELECT seq_id as gid, Oral_taxon_id as otid, \
IFNULL(genus, '') as genus, \
IFNULL(species, '') as  species, \
IFNULL(flag, '') as flag, \
IFNULL(culture_collection, '') as culture_collection, \
IFNULL(status, '') as status, \
IFNULL(sequence_center, '') as sequence_center, \
IFNULL(number_contig, '0') as number_contig, \
IFNULL(combined_length, '0') as combined_length, \
IFNULL(oral_pathogen, '0') as oral_pathogen \
FROM seq_genomes \
JOIN HOMD_seqid_taxonid_index using(seq_id) \
WHERE flag in ('11','12','21','91')"       


q_index = "SELECT flag, oral_taxon_id as otid, seq_id as gid from HOMD_seqid_taxonid_index \
           JOIN seq_genomes using (seq_id) \
           WHERE flag in ('11','12','21','91')"
# okay to exclude seqs
# flag table and flag_ids were set in place by script: ./2_txfr_sites.py
acceptable_flags = ['11','12','21','91']
#q_index = "SELECT seq_id, otid FROM seqid_otid_index"             
            
# def get_flags(args):
#     q1 = "SELECT flag_id,seqid_flag from seqid_flag"
#     flag_result = myconn_new.execute_fetch_select(q1)
#     #print(flag_result)
    
def go(args):
    # one otid to many gid
    index_gidlookup = {}
    idx_result = myconn_gene.execute_fetch_select_dict(q_index)
    for n in idx_result:
        gid = n['gid']
        otid = n['otid']
        index_gidlookup[gid] = otid
        
    print(index_gidlookup['SEQF1970'])    
    tax_result = myconn_new.execute_fetch_select_dict(q_tax)
    tax_genus_sp_lookup = {}
    
    for n in tax_result:
        if str(n['otid']) in tax_genus_sp_lookup:
            sys.exit('tax error')
        tax_genus_sp_lookup[str(n['otid'])] = {'genus':n['genus'],'genus_id':n['genus_id'],'species_id':n['species_id'], 'species':n['species']}
    print('336',tax_genus_sp_lookup['336'])
    
    #for n in tax_genus_sp_lookup:
    #    print(n,tax_genus_sp_lookup[n] ) 
          
    # now get genome genus sp
    
    
#     idx_result = myconn_new.execute_fetch_select_dict(q_index)
#     for n in idx_result:
#         if n['seq_id'] in index_lookup:
#             sys.exit('tax error')
#         index_lookup[n['seq_id']] = str(n['otid'])
#     #print(index_lookup)
#     for n in index_lookup:
#         #print(n,index_lookup[n])
#         pass
    gen_result = myconn_gene.execute_fetch_select_dict(q_gene)
    missing_seqs = []
    missing_otid = []
    for n in gen_result:
        print(n)
        
        gid = n['gid']
        otid = str(n['otid'])
        flag = n['flag']
        oralpath  = n['oral_pathogen']
        clength = n['combined_length']
        ncontigs = n['number_contig']
        seq_center = n['sequence_center'].replace('\r','').replace('\n','').replace("'",'')
        status = n['status']
        ccolct = n['culture_collection']
        
        if otid in tax_genus_sp_lookup:
            genus = tax_genus_sp_lookup[otid]['genus']
            species = tax_genus_sp_lookup[otid]['species']
            genus_id = tax_genus_sp_lookup[otid]['genus_id']
            species_id = tax_genus_sp_lookup[otid]['species_id']
        else:
            genus_id='1'
            species_id='1'
            genus = n['genus']
            species= n['species']
            sys.exit('ALL the sp. are in taxonomy table -- should never arrive here.')
        #print('seqid',seqid,'otid',otid,'new genus',new_genus,'new species',new_species)
        # q_insert = "INSERT IGNORE into genomes (seq_id,otid,genus_id,genus,species_id,species,flag,oral_pathogen,"
#         q_insert += "combined_length,number_contig,sequence_center,status,culture_collection) "
#         q_insert += "VALUES ('"+gid+"','"+otid+"','"+str(genus_id)+"','"+str(genus)+"','"+str(species_id)+"','"+str(species)+"','"+str(flag)+"','"+oralpath+"','"+str(clength)+"','"+str(ncontigs)+"','"+seq_center+"','"+status+"','"+ccolct+"')"
        
        q_insert = "INSERT IGNORE into genomes (seq_id,otid,genus_id,species_id,flag,oral_pathogen,"
        q_insert += "combined_length,number_contig,sequence_center,status,culture_collection) "
        q_insert += "VALUES ('"+gid+"','"+otid+"','"+str(genus_id)+"','"+str(species_id)+"','"+str(flag)+"','"+oralpath+"','"+str(clength)+"','"+str(ncontigs)+"','"+seq_center+"','"+status+"','"+ccolct+"')"
        
        
        print(q_insert)
        
        myconn_new.execute_no_fetch(q_insert)
            
       
        
    #print('missing otids',missing_otid)
    #print('missing seqs',missing_seqs)
# def get_flag_id(flag):
#     q = "SELECT flag_id from seqid_flag WHERE seqid_flag='"+flag+"'"
#     result = myconn_new.execute_fetch_one(q)
#     flag_id = result[0]
#     return flag_id
    
def go_extra():
    qextra = "SELECT * FROM seq_genomes_extra"
    extra_result = myconn_gene.execute_fetch_select_dict(qextra)
    n=1
    for row in extra_result:
        qinsert = "INSERT IGNORE INTO genomes_extra ("
        value_string = "("
        for key in row:
            val = str(row[key]).replace("'","")
            qinsert += key+","
            if not val or val =='None':
                val = ''
            
            value_string += "'"+val+"',"
        qinsert = qinsert[:-1]+") VALUES"+value_string[:-1]+")"
        myconn_new.execute_no_fetch(qinsert)
        
        if n==1:
            print(qinsert)
        n+=1
             
        
        
    
if __name__ == "__main__":

    usage = """
    USAGE:
        takes the taxonomy from the old homd to the new
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
                                                    help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homd_data',
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
    #parser.print_help(usage)
    if not os.path.exists(args.outdir):
        print("\nThe out put directory doesn't exist:: using the current dir instead\n")
        args.outdir = './'                         
    if args.dbhost == 'homd':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        args.GEN_DATABASE = 'HOMD_genomes_new'
        args.NEW_DATABASE = 'homd'
        dbhost_old = '192.168.1.51'
        dbhost_new = '192.168.1.40'
        args.outdir = '../homd-startup-data/'
        args.prettyprint = False

    elif args.dbhost == 'localhost':
        #args.json_file_path = '/Users/avoorhis/programming/homd-data/json'
        args.GEN_DATABASE  = 'HOMD_genomes_new'
        args.NEW_DATABASE = 'homd'
        dbhost_new = 'localhost'
        dbhost_old = 'localhost'
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    myconn_gene = MyConnection(host=dbhost_old, db=args.GEN_DATABASE,   read_default_file = "~/.my.cnf_node")
    myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")

    print(args)
   
    go(args)
    go_extra()
    
    