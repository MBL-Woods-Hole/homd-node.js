#!/usr/bin/env python


import os, sys
import json
import argparse
from connect import MyConnection
ranks = ['domain','phylum','klass','order','family','genus','species','subspecies']

def go(args):
    print(args)
    
    
    if args.checkonly:
        get_current_checkonly(args)
    else:
        
        (taxonomy_id, oldfocus_id) = get_current(args)
        res = check_oldname(args)
        if not res:
           print('\nWe could not find the oldname: "'+args.oldname+'" in the '+args.rank+' table. This doesn\'t really matter but you can quit here if you want.')
           yesno = input("    Do you want to continue? Y/n ")
           if yesno.lower() == 'n':
               sys.exit('\nExiting at user request.\n')
        
        saved_queries = proposed_changes(args, taxonomy_id, oldfocus_id)
        return saved_queries

def check_oldname(args):
    oldfocus = args.rank + '_id'
    q1 = "SELECT `"+oldfocus+"` FROM `"+args.rank+"` WHERE `"+args.rank+"`='"+args.oldname+"'" 
    print("  =>",q1)
    result = myconn.execute_fetch_one(q1)
    return cursor.rowcount
    
def proposed_changes(args, taxonomy_id, oldfocus_id):
    saved_queries = []
    newfocus = args.rank + '_id'
    print('\nTo find the new '+newfocus+' were running this query:')
    q1 = "SELECT `"+newfocus+"` FROM `"+args.rank+"` WHERE `"+args.rank+"`='"+args.newname+"'" 
    print("  =>",q1)
    result = myconn.execute_fetch_one(q1)
    newfocusid='TBD'
    if result:
        newfocusid = result[0]
        print('Found in DB! new',args.rank+'_id:',newfocusid,'for',args.rank+':',"'"+args.newname+"'")
    else:
        print('Whoops Not Found:: Need to add new row into',args.rank)
        q2 = "INSERT IGNORE into `"+args.rank+"` (`"+args.rank+"`) VALUES('"+args.newname+"')"
        print("  =>",q2)
        if args.for_real:
            myconn.execute_no_fetch(q2)
            newfocusid = cursor.lastrowid
            print('lastrowid',newfocusid)
            print('New',args.rank+'_id:',newfocusid)
        else:
            saved_queries.append(q2)
    print('\nNext update the \'taxonomy\' table with the new id in the correct rank position ('+args.rank+')')
    q3= "UPDATE `taxonomy` SET `"+newfocus+"`='"+str(newfocusid)+"' WHERE `taxonomy_id`='"+str(taxonomy_id)+"'"
    print("  =>",q3)
    if args.for_real:
        myconn.execute_no_fetch(q3)
    else:
        saved_queries.append(q3)
    if args.rank in ('species','genus'):
        print("and the 'genomes' table if rank== genus or species")
        q4 = "UPDATE `genomes` SET `"+newfocus+"`='"+str(newfocusid)+"' WHERE `otid`='"+args.otid+"' "
        print("  =>",q4)
        if args.for_real:
            myconn.execute_no_fetch(q4)
        else:
            saved_queries.append(q4)
    else:
        print("No update of genomes table needed because it is not `genus` or `species`")
    return saved_queries
def get_current_checkonly(args):
    
    q = """SELECT
    `taxonomy`.`taxonomy_id`,
    `domain`.`domain_id` as did,
    `phylum`.`phylum_id` as pid,
    `klass`.`klass_id` as kid,
    `order`.`order_id` as oid,
    `family`.`family_id` as fid,
    `genus`.`genus_id` as gid,
    `species`.`species_id` as sid,
    `subspecies`.`subspecies_id` as ssid,
   `otid_prime`.`otid` AS `otid`,
   `domain`.`domain` AS `domain`,
   `phylum`.`phylum` AS `phylum`,
   `klass`.`klass` AS `klass`,
   `order`.`order` AS `order`,
   `family`.`family` AS `family`,
   `genus`.`genus` AS `genus`,
   `species`.`species` AS `species`,
   `subspecies`.`subspecies` AS `subspecies`
    FROM (((((((((`otid_prime` 
    JOIN `taxonomy` ON((`otid_prime`.`taxonomy_id` = `taxonomy`.`taxonomy_id`))) 
    JOIN `domain` ON((`taxonomy`.`domain_id` = `domain`.`domain_id`))) 
    JOIN `phylum` ON((`taxonomy`.`phylum_id` = `phylum`.`phylum_id`))) 
    JOIN `klass` ON((`taxonomy`.`klass_id` = `klass`.`klass_id`))) 
    JOIN `order` ON((`taxonomy`.`order_id` = `order`.`order_id`))) 
    JOIN `family` ON((`taxonomy`.`family_id` = `family`.`family_id`))) 
    JOIN `genus` ON((`taxonomy`.`genus_id` = `genus`.`genus_id`))) 
    JOIN `species` ON((`taxonomy`.`species_id` = `species`.`species_id`))) 
    JOIN `subspecies` ON((`taxonomy`.`subspecies_id` = `subspecies`.`subspecies_id`)))
    WHERE otid='{}'
""".format(args.otid)
    result = myconn.execute_fetch_select_dict(q)[0]
    taxonomy_id = result['taxonomy_id']
    print(40*'-')
    print('Current Lineage for HMT:',args.otid,'(MySQL DB id in parens)')
    print(' Domain:','"'+result['domain']+'"','('+str(result['did'])+')')
    print('  Phylum:','"'+result['phylum']+'"','('+str(result['pid'])+')')
    print('   Class:','"'+result['klass']+'"','('+str(result['kid'])+')')
    print('    Order:','"'+result['order']+'"','('+str(result['oid'])+')')
    print('     Family:','"'+result['family']+'"','('+str(result['fid'])+')')
    print('      Genus:','"'+result['genus']+'"','('+str(result['gid'])+')')
    print('       Species:','"'+result['species']+'"','('+str(result['sid'])+')')
    if result['subspecies']:
        print('        Subspecies:','"'+result['subspecies']+'"','('+str(result['ssid'])+')')
    else:
        print('        Subspecies:')
    print('(taxonomy table) taxonomy_id:',taxonomy_id)
    print(40*'-')
    
    
def get_current(args):
    oldfocus = args.rank + '_id'
    q = """SELECT
    `taxonomy`.`taxonomy_id`,
    `{}`.`{}` as oldfocus_id,
   `otid_prime`.`otid` AS `otid`,
   `domain`.`domain` AS `domain`,
   `phylum`.`phylum` AS `phylum`,
   `klass`.`klass` AS `klass`,
   `order`.`order` AS `order`,
   `family`.`family` AS `family`,
   `genus`.`genus` AS `genus`,
   `species`.`species` AS `species`,
   `subspecies`.`subspecies` AS `subspecies`
    FROM (((((((((`otid_prime` 
    JOIN `taxonomy` ON((`otid_prime`.`taxonomy_id` = `taxonomy`.`taxonomy_id`))) 
    JOIN `domain` ON((`taxonomy`.`domain_id` = `domain`.`domain_id`))) 
    JOIN `phylum` ON((`taxonomy`.`phylum_id` = `phylum`.`phylum_id`))) 
    JOIN `klass` ON((`taxonomy`.`klass_id` = `klass`.`klass_id`))) 
    JOIN `order` ON((`taxonomy`.`order_id` = `order`.`order_id`))) 
    JOIN `family` ON((`taxonomy`.`family_id` = `family`.`family_id`))) 
    JOIN `genus` ON((`taxonomy`.`genus_id` = `genus`.`genus_id`))) 
    JOIN `species` ON((`taxonomy`.`species_id` = `species`.`species_id`))) 
    JOIN `subspecies` ON((`taxonomy`.`subspecies_id` = `subspecies`.`subspecies_id`)))
    WHERE otid='{}'
""".format(args.rank,oldfocus,args.otid)
    result = myconn.execute_fetch_select_dict(q)[0]
    taxonomy_id = result['taxonomy_id']
    oldfocus_id = result['oldfocus_id']
    print(40*'-')
    print('Current Lineage for HMT:',args.otid)
    print(' Domain:',result['domain'])
    print('  Phylum:',result['phylum'])
    print('   Class:',result['klass'])
    print('    Order:',result['order'])
    print('     Family:',result['family'])
    print('      Genus:',result['genus'])
    print('       Species:',result['species'])
    print('        Subspecies:',result['subspecies'])
    print('(taxonomy table) taxonomy_id:',taxonomy_id,'(old)focus_id ('+oldfocus+'):',oldfocus_id)
    print(40*'-')
    return (taxonomy_id, oldfocus_id)    
    
if __name__ == "__main__":
    
    usage = """
      hmt_taxon_name_change.py --otid xx --rank genus --old_name OLDNAME --new_name NEWNAME  (all required parameters)
        
        sample sql commands:
         SELECT taxonomy_id FROM otid_prime WHERE otid='701'
         SELECT genus_id FROM genus WHERE genus='NEWNAME'      
         UPDATE taxonomy SET genus_id='3130' WHERE taxonomy_id='2474'
         UPDATE genomes SET genus_id='3130' WHERE otid='191'  
      
      When ready to commit: Add -fr (--for_real) to commandline and re-run it.
    """
    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-otid", "--otid",   required=True,  action="store",   dest = "otid", 
                                                    help="Just the number")
    parser.add_argument("-r", "--rank",   required=False,  action="store",   dest = "rank", default='',
                                                    help="Domain...Subspecies")
    parser.add_argument("-o", "--oldname",   required=False,  action="store",   dest = "oldname", default='',
                                                    help=" ")
    parser.add_argument("-n", "--newname", required = False, action = 'store', dest = "newname", default = '',
                         help = "")
    parser.add_argument("-host", "--host",
                        required = False, action = 'store', dest = "dbhost", default = 'localhost',
                        help = "choices=['homd',  'localhost']")
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()") 
    parser.add_argument("-fr", "--for_real",   required=False,  action="store_true",    dest = "for_real", default=False,
                                                    help="Actually Change DB") 
                                                    
    args = parser.parse_args()
    
    if args.dbhost == 'homd':
        #args.json_file_path = '/groups/vampsweb/vamps/nodejs/json'
        #args.TAX_DATABASE = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        #dbhost_old = '192.168.1.51'
        dbhost_new= '192.168.1.40'

    elif args.dbhost == 'localhost':
        #args.json_file_path = '/Users/avoorhis/programming/homd-data/json'
        #args.TAX_DATABASE  = 'HOMD_taxonomy'
        args.NEW_DATABASE = 'homd'
        dbhost_new = 'localhost'
        #dbhost_old = 'localhost'
        
    else:
        sys.exit('dbhost - error')

    if not args.rank and not args.newname and not args.oldname:
        args.checkonly = True
    else:
        args.checkonly = False 
     
    myconn = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,   read_default_file = "~/.my.cnf_node")
    cursor = myconn.cursor
    queries = go(args)
    
    if not args.for_real and not args.checkonly:
        print()
        print(40*'-')
        print('Queries to be run:')
        for query in queries:
            print(query)
        print('\nTo actually change the database by running the above listed Command(s)')
        print('Add "-fr" to command line!! and rerun the script.')
        print(40*'-')
        print()
    