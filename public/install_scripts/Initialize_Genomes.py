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

# TABLES
#update_date_tbl = 'static_genomes_update_date'  # this seems to be the LONG list of gids -- use it first then fill in
#index_tbl       = 'seqid_otid_index'   # match w/ otid OTID Not Unique 
genomes_tbl = 'genomes' #  has genus,species,status,#ofcontigs,combinedlength,flag,oralpathogen-+
seq_extra_tbl   = 'genomes_homd_extra' # has ncbi_id,ncbi_taxid,GC --and alot more
# 1 --annotated at HOMD with NCBI ANNOTATION
# 12 --annotated at HOMD without NCBI Annotation
# 21 --Genomes with NCBI annotation
# Plus 91 is for those Nonoralref genomes
acceptable_genome_flags = ('11','12','21','91')
# first_query ="""
#     SELECT seq_id as gid, date
#     from {tbl}
#     ORDER BY gid
# """.format(tbl=update_date_tbl)
# 2

# 1
first_genomes_query_no_flagid ="""
    SELECT seq_id as gid,
    genus,
    species,
    genomes.status,
    IFNULL(number_contig, '') as ncontigs, 
    IFNULL(combined_length, '') as tlength,
    IFNULL(oral_pathogen, '') as oral_path,
    IFNULL(culture_collection, '') as ccolct,
    IFNULL(sequence_center, '') as seq_center,
    flag
    from {tbl1}
    JOIN otid_prime using(otid)
    JOIN taxonomy using(taxonomy_id)
    JOIN genus using(genus_id)
    JOIN species using(species_id)
    ORDER BY gid
""".format(tbl1=genomes_tbl)
first_genomes_query ="""
    SELECT seq_id as gid,
    genus,
    species,
    genomes.status,
    IFNULL(number_contig, '') as ncontigs, 
    IFNULL(combined_length, '') as tlength,
    IFNULL(oral_pathogen, '') as oral_path,
    IFNULL(culture_collection, '') as ccolct,
    IFNULL(sequence_center, '') as seq_center,
    flag_id as flag
    from {tbl1}
    JOIN otid_prime using(otid)
    JOIN taxonomy using(taxonomy_id)
    JOIN genus using(genus_id)
    JOIN species using(species_id)
    JOIN seqid_flag using(flag_id)
    WHERE flag_id in {flags}
    ORDER BY gid
""".format(tbl1=genomes_tbl,flags=acceptable_genome_flags)
# IFNULL too CPU Intensive
extra_query ="""  
    SELECT seq_id as gid,
    IFNULL(ncbi_id, '') as ncbi_bpid,
    IFNULL(ncbi_taxon_id, '') as ncbi_taxid,
    IFNULL(isolate_origin, '') as io,
    IFNULL(gc, '') as gc,
    IFNULL(atcc_medium_number, '') as atcc_mn,
    IFNULL(non_atcc_medium, '') as non_atcc_mn,
    IFNULL(genbank_acc, '') as gb_acc,
    IFNULL(gc_comment, '') as gb_asmbly,
    IFNULL(goldstamp_id, '') as  ncbi_bsid,
    IF(16s_rrna ='', '0','1') as 16s_rrna_flag  
    from {tbl}
    ORDER BY gid
""".format(tbl=seq_extra_tbl)

extra_query2 ="""
    SELECT seq_id as gid,
    ncbi_id as ncbi_bpid,
    ncbi_taxon_id as ncbi_taxid,
    isolate_origin as io,
    gc, 
    atcc_medium_number as atcc_mn,
    non_atcc_medium as non_atcc_mn,
    genbank_acc as gb_acc,
    gc_comment as gb_asmbly,
    goldstamp_id as  ncbi_bsid,
    IF(16s_rrna ='', '0','1') as 16s_rrna_flag  
    from {tbl}
""".format(tbl=seq_extra_tbl)



def create_genome(gid):  # basics - page1 Table: genomes  seqid IS UNIQUE
    """  alternative to a Class which seems to not play well with JSON 
    
    1 otid								#table1
    2  homd seqid						#table1
    3  genus species					#table1
    4  genome sequence name  # How is this different than genus-species?
    5  comments on name
    6  culture collection entry number  # table
    7  isolate origin   				# table2
    8  sequencing status   				# table
    9  ncbi taxid   					# table1
    10 ncbi genome bioproject id   		# table
    11 ncbi genome biosample id   		# table
    12 genbank acc id   				# table2
    13 genbank assbly id   				# table
    14 number of contigs and singlets	   # table
    15 combined lengths (bps)	   		# table
    16 GC percentage				   # table1
    17 sequencing center		   # table1
    18 ATCC medium number		   # table2
    19 non-ATCC medium			   # table2
    20 16s rna gene sequence		   # table  ????
    21 comments					   # table
    """
    genome = {}
    genome['gid'] 		= gid
    genome['genus'] 	= ''   # table 1
    genome['species'] 	= ''   # table 1
    genome['status']	= ''   # table 1
    genome['ncontigs'] 	= ''   # table 1
    genome['seq_center'] = ''   # table 1
    genome['tlength'] 	= ''   # table 1
    genome['oral_path'] = ''   # table 1
    genome['ccolct'] 	= ''  # table 1 --is a list but presented in a single (comma separated) field in the db
    
    genome['gc'] 		= ''   # table 2
    genome['ncbi_taxid'] = ''   # table 2
    genome['ncbi_bpid'] 	= ''   # table 2
    genome['ncbi_bsid'] = ''
    genome['io'] 		= ''   # table 2
    genome['atcc_mn'] 	= ''   # table 2
    genome['non_atcc_mn'] = ''   # table 2
    genome['gb_acc'] 	= ''
    genome['gb_asmbly'] = ''
    genome['otid'] 		= ''   # index table
    genome['16s_rrna_flag']   = '0'
    genome['flag']   = ''
    return genome


    
master_lookup = {}    

              
def run_first(args):
    """ date not used"""
    global master_lookup
    #print(first_genomes_query)
    result = myconn.execute_fetch_select_dict(first_genomes_query_no_flagid)
    
    for obj in result:
        #print(obj)
        
        if obj['gid'] not in master_lookup:
            taxonObj = create_genome(obj['gid']) 
            taxonObj['genus'] = obj['genus']
            taxonObj['species'] = obj['species']
            taxonObj['status'] = obj['status']
            taxonObj['ncontigs'] = obj['ncontigs']
            taxonObj['seq_center'] = obj['seq_center']
            taxonObj['tlength'] = obj['tlength']
            taxonObj['oral_path'] = obj['oral_path']
            taxonObj['ccolct'] = obj['ccolct']
            taxonObj['flag'] = str(obj['flag'])
        else:
            sys.exit('duplicate gid',obj['gid'])
        master_lookup[obj['gid']] = taxonObj    
    #print(master_lookup)
    
def run_second(args):
    """  add otid to Object """
    global master_lookup
    g_query ="""   
    SELECT seq_id as gid,otid
    from genomes
    ORDER BY gid
    """
    result = myconn.execute_fetch_select_dict(g_query)

    for obj in result:  
         if obj['gid'] in master_lookup:
            master_lookup[obj['gid']]['otid'] = str(obj['otid']) 
    #print(master_lookup)        
        
def run_third(args):
    global master_lookup
    result = myconn.execute_fetch_select_dict(extra_query2)    
    #seq_id as gid,genus,species,status,number_contig,combined_length,oral_path
        
    for obj in result:  
        if obj['gid'] in master_lookup:
            

            for n in obj:
                if n == 'gc':
                    master_lookup[obj['gid']]['gc'] = obj['gc']
                if n == 'ncbi_taxid':
                    master_lookup[obj['gid']]['ncbi_taxid'] = obj['ncbi_taxid']
                if n == 'ncbi_bpid':
                    master_lookup[obj['gid']]['ncbi_bpid'] = obj['ncbi_bpid']
                if n == 'ncbi_bsid':
                    master_lookup[obj['gid']]['ncbi_bsid'] = obj['ncbi_bsid']
            
                if n == 'io':
                    master_lookup[obj['gid']]['io'] = obj['io']
                if n == 'atcc_mn':
                    master_lookup[obj['gid']]['atcc_mn'] = obj['atcc_mn']
                if n == 'non_atcc_mn':
                    master_lookup[obj['gid']]['non_atcc_mn'] = obj['non_atcc_mn']
                if n == 'gb_asmbly':
                    master_lookup[obj['gid']]['gb_asmbly'] = obj['gb_asmbly']
                if n == 'gb_acc':
                    master_lookup[obj['gid']]['gb_acc'] = obj['gb_acc']
                if n == '16s_rrna_flag':
                    master_lookup[obj['gid']]['16s_rrna_flag'] = obj['16s_rrna_flag']
            	
    #print(len(master_lookup))
    filename = os.path.join(args.outdir,args.outfileprefix+'Lookup.json')
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(master_lookup, outfile, indent=args.indent)
        
            
if __name__ == "__main__":

    usage = """
    USAGE:
        homd_init_genome_data.py
        
        will print out the need initialization files for homd
        Needs MySQL: tries to read your ~/.my.cnf_node
        
           -outdir Output directory [default]
        for homd site
           -host homd
           
        for debugging
          -pp  pretty print
          -o <outfile>  Change outfile name from 'taxonomy'*
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
                                                    help=" ")
    parser.add_argument("-o", "--outfileprefix",   required=False,  action="store",   dest = "outfileprefix", default='homdData-Genome',
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
    run_second(args)
    run_third(args)
    