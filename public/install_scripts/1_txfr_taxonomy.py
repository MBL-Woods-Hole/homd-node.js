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
otids_w_subspecies = (411,431,578,638,721,818,886,938,420,58,398,698,707,202,106,70,71,200,377)
dropped_otids = ['9',   '15',  '16',  '55',  '65',
  '67',  '68',  '69',  '140', '143',
  '177', '210', '220', '255', '296',
  '310', '372', '395', '437', '446',
  '449', '452', '453', '462', '474',
  '486', '487', '502', '648', '729',
  '826']
# TABLES
taxon_tbl           = 'taxon_list'   # UNIQUE  - This is the defining table 



master_tax_lookup={}



query_taxa ="""
SELECT a.oral_taxon_id as otid, a.genus as genusTT, a.species as speciesTT
from taxon_list as a
ORDER BY otid
"""


counts = {}
tt_lookup = {}

def create_taxon(otid):
    """   """
    taxon = {}
    taxon['otid'] = otid
    taxon['genus'] = ''
    taxon['species'] = ''
    return taxon
    
       
            
            
def run_taxa(args):
    global tt_lookup
    result = myconn_tax.execute_fetch_select_dict(query_taxa)
    #split_code = '&lt;BR&gt;'

    
    #print(result)
    for obj in result:
        #print(obj)
        if obj['otid'] not in tt_lookup:
            # create ne taxon object with empty values
            taxonObj = create_taxon(obj['otid']) 
            taxonObj['genus'] = obj['genusTT']
            taxonObj['species'] = obj['speciesTT']
            #master_lookup[obj['otid']] = ast.literal_eval(TaxonEncoder().encode(taxonObj))
            tt_lookup[obj['otid']] = taxonObj
        else:
            sys.exit('Problem with taxon_table unique')
            
        #print(taxonObj.__dict__) 
    #print(tt_lookup)       
           


    
def print_dict(filename, dict):
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)
    


def run_lineage(args):
    """
   
        
    """
    global full_tax_lookup
    tables = ['2_ItemLink_OralTaxonId',  '2_ItemLink_Item', '2_ClassifyTitle']
    #file1 = os.path.join(args.outdir,args.outfileprefix+'_NEW_lineagelookup.json')
    #file2 = os.path.join(args.outdir,args.outfileprefix+'_NEW_hierarchy.json')
        
    q1 = "select item_id as species_id, oral_taxon_id as otid from 2_ItemLink_OralTaxonId"  # no dropped
    q2 = "select item1_id as id, taxonid_count as tax_cnt, seq_id_count as gne_cnt, sequenced_count as 16s_cnt \
           from 2_ItemLink_Item where item2_id={id}"
    first_result = myconn_tax.execute_fetch_select_dict(q1)
    full_tax_list = []
    full_tax_lookup = {}
    
    for obj in first_result:
        # for each otid build up the taxonomy from species => domain
        this_obj = {}
        
        otid = obj['otid']
        this_obj['otid'] = otid
        species_id = str(obj['species_id'])
        
        genus_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(species_id)))
        genus_id = str(genus_result[0]['id'])
        
        family_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(genus_id)))
        family_id = str(family_result[0]['id'])
        
        order_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(family_id)))
        order_id = str(order_result[0]['id'])
        
        class_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(order_id)))
        class_id = str(class_result[0]['id'])
        
        phylum_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(class_id)))
        phylum_id = str(phylum_result[0]['id'])
        
        domain_result = myconn_tax.execute_fetch_select_dict(q2.format(id=str(phylum_id)))
        domain_id = str(domain_result[0]['id'])
        
        id_list = [domain_id,phylum_id,class_id,order_id,family_id,genus_id,species_id]
        
        q3= "select item_title as tax_name, level from 2_ClassifyTitle"
        q3 += " WHERE item_id in (\""+'\",\"'.join(id_list)+"\") ORDER BY level"
        #print('q3',q3)
        final_result = myconn_tax.execute_fetch_select_dict(q3)
        lineage = []
        parent_name = 0
        for obj2 in final_result:
            #print(obj2)
            level = obj2['level']  # 0 for domain
            tax_name = obj2['tax_name']
            lineage.append(tax_name)
            
            rank = ranks[int(level)]
            this_obj[rank] = tax_name
            parent_name = tax_name
        if otid in full_tax_lookup:
            sys.exit('ERROR otid NOT unique')
        
        full_tax_lookup[otid] = this_obj
        full_tax_list.append(this_obj)
    
  
    
    
    #print_dict(file1, full_tax_lookup)
    #print_dict(file2, full_tax_list)
    check_genus(args)
    
    transfer(args)

def check_genus(args):
    
    global full_tax_lookup, tt_lookup
    meta_collection = []
    for otid in full_tax_lookup:  # no dropped
    
    #for otid in [1,2,3,500]:
        
        collection = [str(otid)]
#         print(otid)
#         print(full_tax_lookup[otid]['genus'],tt_lookup[otid]['genus'])
#         print(full_tax_lookup[otid]['species'],tt_lookup[otid]['species'])
        if full_tax_lookup[otid]['genus'] != tt_lookup[otid]['genus']:
            print(otid,'genus no match')
            print('Classify:',full_tax_lookup[otid]['genus'],' != taxonTable:',tt_lookup[otid]['genus'])
            #sys.exit()
            
        if full_tax_lookup[otid]['species'] != tt_lookup[otid]['species']:
            print(otid,'species no match')
            print(full_tax_lookup[otid]['species'],tt_lookup[otid]['species'])
            sys.exit()

def preset_zeros(args): 
    for rank in ranks:
        print()
        q = "INSERT IGNORE into `" +rank+ "`("+rank+"_id,`"+rank+"`) VALUES('1','')" 
        print(q)  
        myconn_new.execute_no_fetch(q)        
    q = "INSERT IGNORE into `subspecies` (subspecies_id,`subspecies`) VALUES('1','')"
    myconn_new.execute_no_fetch(q)
def transfer(args): 
    """
    cc
    """
    global full_tax_lookup
    global tt_lookup
    meta_collection = []
    dropped = []
    #for otid in full_tax_lookup:  # no dropped
    for otid in tt_lookup:       # has dropped
        # domain
        collection = []
        if otid in full_tax_lookup:
            for rank in ranks:
                tax_name = full_tax_lookup[otid][rank]
                if rank == 'species' and otid in otids_w_subspecies:
                    # try to get only sp w/ subspecies
                    print('subspecies?',otid,tax_name)
                    parts = tax_name.split()
                    if otid == '106' :
                        species = '[Eubacterium] yurii'
                        subspecies = ''
                    elif otid == '377':
                        species = '[Eubacterium] yurii'
                        subspecies = ''
                    else: 
                        species = parts[0]
                        subspecies = ' '.join(parts[1:])
                    q1 = "INSERT IGNORE INTO `species` (`species`) VALUES ('"+species+"')"
                    print(q1)
                    myconn_new.execute_no_fetch(q1)
                    spc_id = myconn_new.lastrowid  
                    if not spc_id:
                        q3 = "SELECT species_id from species where species='"+species+"'"
                        spc = myconn_new.execute_fetch_one(q3)
                        spc_id = spc[0]
                    q2 = "INSERT IGNORE INTO `subspecies` (`subspecies`) VALUES ('"+subspecies+"')"
                    print(q2)
                    myconn_new.execute_no_fetch(q2)
                    sub_id = myconn_new.lastrowid 
                    if not sub_id:
                        q4 = "SELECT subspecies_id from subspecies where subspecies='"+subspecies+"'"
                        subsp = myconn_new.execute_fetch_one(q4)
                        sub_id = subsp[0]   
                    print('SPC_id',spc_id,'SUB_id',sub_id)
                    collection.append(str(spc_id))
                    collection.append(str(sub_id))
                else:   
                    q1 = "INSERT IGNORE INTO `"+rank+"` (`"+rank+"`) VALUES ('"+tax_name+"')"
                    #print(q1)
                    myconn_new.execute_no_fetch(q1)
                    last_id1 = myconn_new.lastrowid
       
                    if not last_id1:   # Already exists: Must select again to get the id
                        q3 = "SELECT "+rank+"_id from `"+rank+"` WHERE `"+rank+"` = '"+tax_name+"'"
                        #print(q3)
                        result = myconn_new.execute_fetch_one(q3)
                        rank_id = result[0]
                        #print('id',rank_id)
            
                    else:
                        rank_id = last_id1
                    collection.append(str(rank_id))
            print('collection',collection)
            if len(collection) == 7:
                collection.append('1')
                
                #print()
            
            #print(collection) 
            q5 = "INSERT IGNORE INTO taxonomy (domain_id,phylum_id,klass_id,order_id,family_id,genus_id,species_id,subspecies_id)"
            q5 +=     " VALUES "
            q5 += "('"+"','".join(collection)+"')"
            #print(q5)
            myconn_new.execute_no_fetch(q5)
            last_id5 = myconn_new.lastrowid
            # 1412	Bacteria
            # if collection[0] == '1':
#             	collection[0] = '1412'
            if not last_id5: 
                q7 = "SELECT taxonomy_id from taxonomy where " 
                q7 += "domain_id='"+collection[0]+"' and " 
                q7 += "phylum_id='"+collection[1]+"' and " 
                q7 += "klass_id='"+collection[2]+"' and " 
                q7 += "order_id='"+collection[3]+"' and " 
                q7 += "family_id='"+collection[4]+"' and " 
                q7 += "genus_id='"+collection[5]+"' and " 
                q7 += "species_id='"+collection[6]+"' and " 
                q7 += "subspecies_id='"+collection[7]+"'"
                print(q7)
                result = myconn_new.execute_fetch_one(q7)
                
                tax_id = str(result[0])
                #q8 = "UPDATE IGNORE otid_prime set taxonomy_id='"+tax_id+"' WHERE otid='"+str(otid)+"' "
                
            else:
                tax_id = last_id5
                
            q8 = "INSERT IGNORE into otid_prime (otid,taxonomy_id) VALUES('"+str(otid)+"','"+tax_id+"')"
            #print(q8)
            myconn_new.execute_no_fetch(q8)
        else:
            ## dropped
            #print('DROPPED otid',tt_lookup[otid])
            dropped.append(otid)
            q1 = "INSERT IGNORE INTO genus (genus) VALUES ('"+tt_lookup[otid]['genus']+"')"
            myconn_new.execute_no_fetch(q1)
            last_id1 = myconn_new.lastrowid
            if not last_id1:  # already in db
                q = "SELECT genus_id from genus where genus='"+tt_lookup[otid]['genus']+"'"
                result = myconn_new.execute_fetch_one(q)
                genus_id = str(result[0])
            else:
                genus_id = last_id1
            q2 = "INSERT IGNORE INTO species (species) VALUES ('"+tt_lookup[otid]['species']+"')"
            myconn_new.execute_no_fetch(q2)
            last_id2 = myconn_new.lastrowid
            if not last_id2:
                q = "SELECT species_id from species where species='"+tt_lookup[otid]['species']+"'"
                #print(q)
                result = myconn_new.execute_fetch_one(q)
                #print(result)
                species_id = str(result[0])
            else:
                species_id = last_id2
            q5 = "INSERT IGNORE INTO taxonomy (domain_id,phylum_id,klass_id,order_id,family_id,genus_id,species_id,subspecies_id)"
            q5 +=     " VALUES ('1','1','1','1','1','"+str(genus_id)+"','"+str(species_id)+"','1')"
            #print(q5)
            myconn_new.execute_no_fetch(q5)
            last_id5 = myconn_new.lastrowid
            if not last_id5: 
                q7 = "SELECT taxonomy_id from taxonomy where " 
                q7 += "domain_id='1' and " 
                q7 += "phylum_id='1' and " 
                q7 += "klass_id='1' and " 
                q7 += "order_id='1' and " 
                q7 += "family_id='1' and " 
                q7 += "genus_id='"+genus_id+"' and " 
                q7 += "species_id='"+species_id+"' and " 
                q7 += "subspecies_id='1'"
                #print(q7)
                result = myconn_new.execute_fetch_one(q7)
                tax_id = str(result[0])
                #q8 = "UPDATE IGNORE otid_prime set taxonomy_id='"+tax_id+"' WHERE otid='"+str(otid)+"' "
                
            else:
                tax_id = last_id5
            q8 = "INSERT IGNORE into otid_prime (otid,taxonomy_id) VALUES('"+str(otid)+"','"+tax_id+"')"
            #print(q8)
            myconn_new.execute_no_fetch(q8)
            
    #print(tt_lookup[dropped)

   
    
    
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
        args.TAX_DATABASE = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        dbhost_old = '192.168.1.51'
        dbhost_new= '192.168.1.40'
        args.outdir = '../homd-startup-data/'
        args.prettyprint = False

    elif args.dbhost == 'localhost':
        #args.json_file_path = '/Users/avoorhis/programming/homd-data/json'
        args.TAX_DATABASE  = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        dbhost_new = 'localhost'
        dbhost_old = 'localhost'
        
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    myconn_tax = MyConnection(host=dbhost_old, db=args.TAX_DATABASE,   read_default_file = "~/.my.cnf_node")
    myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
    
    preset_zeros(args) # initialize
    print(args)
    print('run_taxa(args)')
    run_taxa(args)
    print('running lineage')
    run_lineage(args)
   
    