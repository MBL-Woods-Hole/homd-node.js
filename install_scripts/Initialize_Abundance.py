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
#from connect import MyConnection
import datetime
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())

segata_headers=['BM','KG','HP','Throat','PT','TD','Saliva','SupP','SubP','Stool']
dewhirst_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP']
eren_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP','Stool']

   
hmt_index = 2  # only for dewhirst and eren
rank_index=3  # rank
max_segata_index=6
max_dewhirst_index=7
max_eren_index=8
max_any_index=9
start_segata_index=11
segata_col_count=20  # header row =='BM'
start_dewhirst_index=31
dewhirst_col_count=27  # header row =='BM'
start_eren_index=59
eren_col_count=20  # header row =='BM'
data_start_index=11
segata_cols = ['mean','stdev']
eren_cols = ['mean','prevalence']
dewhirst_cols = ['mean','stdev','prevalence']

# to correct for the few subspecies in HOMD::
subspecies = {}
subspecies['reuteri clade 818'] = ['reuteri','clade 818']  # tax_parts 6 and 7
subspecies['reuteri clade 938'] = ['reuteri','clade 938'] 
subspecies['cristatus clade 578'] = ['cristatus','clade 578'] 
subspecies['cristatus clade 886'] = ['cristatus','clade 886'] 
subspecies['infantis clade 431'] = ['infantis','clade 431'] 
subspecies['infantis clade 638'] = ['infantis','clade 638'] 
subspecies['oralis subsp. dentisani clade 058'] = ['oralis','subsp. dentisani clade 058'] 
subspecies['oralis subsp. dentisani clade 398'] = ['oralis','subsp. dentisani clade 398'] 
subspecies['oralis subsp. oralis'] = ['oralis','subsp. oralis'] 
subspecies['oralis subsp. tigurinus clade 070'] = ['oralis','subsp. tigurinus clade 070'] 
subspecies['oralis subsp. tigurinus clade 071'] = ['oralis','subsp. tigurinus clade 071'] 
subspecies['parasanguinis clade 411'] = ['parasanguinis','clade 411']
subspecies['parasanguinis clade 721'] = ['parasanguinis','clade 721']
subspecies['[Eubacterium] yurii subsp. schtitka'] = ['[Eubacterium] yurii','subsp. schtitka'] 
subspecies['[Eubacterium] yurii subsp. yurii & margaretiae'] = ['[Eubacterium] yurii','subsps. yurii & margaretiae']
subspecies['nucleatum subsp. animalis'] = ['nucleatum','subsp. animalis'] 
subspecies['nucleatum subsp. nucleatum'] = ['nucleatum','subsp. nucleatum'] 
subspecies['nucleatum subsp. polymorphum'] = ['nucleatum','subsp. polymorphum'] 
subspecies['nucleatum subsp. vincentii'] = ['nucleatum','subsp. vincentii'] 


def run_abundance_csv(): 
    collector = {}
#     if args.source == 'eren':
#         max_index = 8
#         headers = eren_headers
#     elif args.source == 'segata':
#         max_index = 6
#         headers = segata_headers
#     else:
#         max_index = 7
#         headers = dewhirst_headers
    # Opening JSON file
    json_file = args.outfile
    if os.path.isfile(json_file):
        f = open(json_file)
        collector = json.load(f)
        #print(collector)
        
    with open(args.infile) as csv_file:
        #csv_reader = csv.reader(csv_file, delimiter=',')  # AV comma
        
        if args.delimiter == 'tab':
            csv_reader = csv.reader(csv_file, delimiter='\t') # 
        else:
            csv_reader = csv.reader(csv_file, delimiter=',') # 
        #indices = {}
        start = 'no'
        
        for row in csv_reader:
            
            if row[0] == 'Headers':   # I added this keyword in the proper row[0]
                header_row = row
                #print(header_row)
                
                #rkeys = list(row.keys())
                #print('\n',indices)
                # eg: {'BM': 11, 'KG': 13, 'HP': 15, 'Throat': 17, 'PT': 19, 'TD': 21, 'Saliva': 23, 'SupP': 25, 'SubP': 27, 'Stool': 29}
            if  row[0] == 'HOMD taxonomy':
                start = 'yes'
                continue  # go to the next row
                
            if start == 'yes':
                #print(row) 
                taxon_string = row[0]
                
                
                """
                The TaxonCount file has species= genus species
                but the segata,dewhirst and eren files just use species=species
                so to match:
                Eren: Bacteria;Spirochaetes;Spirochaetia;Spirochaetales;Spirochaetaceae;Treponema;vincentii
                coll  Bacteria;Spirochaetes;Spirochaetia;Spirochaetales;Spirochaetaceae;Treponema;Treponema vincentii
                """
                tax_parts = taxon_string.split(';')
                
                if len(tax_parts) == 7:
                    
                    taxon_string = ';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+tax_parts[6]
                    if 'clade' in tax_parts[6] or 'subsp' in tax_parts[6]:
                        if tax_parts[6] in subspecies:
                            # if '[Eubacterium]' in taxon_string:
#                                 print('found '+tax_parts[6])
#                                 print('old tax string: ')
#                                 print(taxon_string)
                            taxon_string =';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+subspecies[tax_parts[6]][0]+';'+subspecies[tax_parts[6]][1]
                            # if '[Eubacterium]' in taxon_string:
#                                 print('new tax string: ')
#                                 print(taxon_string)
                if row[max_any_index] == '0':
                    pass
                    #collector[taxon_string]['max_all'] = '0'
               
                
                if not row[max_any_index]:  # will pass zero but not empty string
                   continue
                
                
                #print()
                #print(taxon_string)
                if taxon_string not in collector:
                    print('missing from HOMD collector: ',taxon_string)
                    continue
                    #sys.exit('not in collector')
                    collector[taxon_string] = {}
                if 'segata' not in collector[taxon_string]:
                    collector[taxon_string]['segata'] = {}
                if 'eren' not in collector[taxon_string]:
                    collector[taxon_string]['eren'] = {}
                if 'dewhirst' not in collector[taxon_string]:
                    collector[taxon_string]['dewhirst'] = {}
                
                
                collector[taxon_string]['max_segata'] = row[max_segata_index]
                collector[taxon_string]['max_eren'] = row[max_eren_index]
                collector[taxon_string]['max_dewhirst'] = row[max_dewhirst_index]
                collector[taxon_string]['max_all'] = row[max_any_index]
                if row[hmt_index]:
                    collector[taxon_string]['otid'] = row[hmt_index]
                if header_row[start_segata_index] != 'BM':
                    sys.exit('bad header row:segata') 
                if header_row[start_dewhirst_index] != 'BM':
                    sys.exit('bad header row:dewhirst') 
                if header_row[start_eren_index] != 'BM':
                    sys.exit('bad header row:eren') 
                          
                for i,val in enumerate(row):
                    
                    if i >= start_segata_index and i < start_segata_index + segata_col_count:
                        
                        if header_row[i] in segata_headers and row[i]:
                            #print(header_row[i],row[i],row[i+1])
                            collector[taxon_string]['segata'][header_row[i]]={'site':header_row[i], 'avg':row[i],'stdev':row[i+1]} # for segata
                    
                    elif i>=start_dewhirst_index and i < start_dewhirst_index + dewhirst_col_count:
                        if header_row[i] in dewhirst_headers and row[i]:
                            #print(header_row[i],row[i],row[i+1])
                            collector[taxon_string]['dewhirst'][header_row[i]]={'site':header_row[i], 'avg':row[i],'stdev':row[i+1],'prev':row[i+2]} # for segata
                    
                    elif i>=start_eren_index and i < start_eren_index + eren_col_count:
                        if header_row[i] in eren_headers and row[i]:
                            #print(header_row[i],row[i],row[i+1])
                            collector[taxon_string]['eren'][header_row[i]]={'site':header_row[i], 'avg':row[i],'prev':row[i+1]} # for segata
                    else:
                        pass 
                    
        #             for k in ['segata','dewhirst','eren']:
#                         
#                         if k == 'segata':
#                             if row[max_segata_index]:
#                             
#                                 #cols = header_row[start_segata_index:start_segata_index+segata_col_count]
#                                 # cols=segata ['BM', '', 'KG', '', 'HP', '', 'Throat', '', 'PT', '', 'TD', '', 'Saliva', '', 'SupP', '', 'SubP', '', 'Stool', '']
#                                 for p in range(start_segata_index, start_segata_index+segata_col_count):
#                                 
#                                     if header_row[p] in segata_headers:
#                                         print('row',p,header_row[p],row[p])
#                                         collector[taxon_string]['segata'][header_row[p]]={'site':header_row[p], 'avg':row[p],'stdev':row[p+1]} # for segata
#                     
#                         if k == 'dewhirst':
#                             start=start_dewhirst_index
#                             headers = dewhirst_headers
#                             cols = header_row[start_dewhirst_index:start_dewhirst_index+dewhirst_col_count]
#                         if k == 'eren': 
#                             start=start_eren_index
#                             headers = eren_headers
#                             cols = header_row[start_eren_index:start_eren_index+eren_col_count]
#                     
                    
                        
                                
                     #    if args.source == 'eren':
#                             collector[taxon_string][args.source][header_row[i]]={'site':header_row[i], 'avg':row[i],'prev':row[i+1]} # for eren
#                         elif args.source == 'segata':
#                             
#                         else: # dewhirst
#                             collector[taxon_string][args.source][header_row[i]]={'site':header_row[i], 'avg':row[i],'stdev':row[i+1],'prev':row[i+2]} # for dewhirst
            else:
                continue
                
    
    #print(collector)
    #filename = args.source+'_taxon_abundance_data.json'
    filename = args.outfile
    print_dict(filename, collector)
    
def print_dict(filename, dict):
    print('writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)    

        
if __name__ == "__main__":

    usage = """
    USAGE:
        Opens and adds to the homdData-TaxonCounts.json file 
        MUST be run AFTER Initialize_Taxonomy.py
        ./Initialize_Abundance.py -i HOMDtaxa-abundance-2021-09-06-cleaned.csv
        
        TODO add abundance data to database
        
        
        OLD:
        Run 3 times (once for each abundance.csv file
          ./Initialize_Abundance.py -i Segata2021-09-07.csv -s segata
          ./Initialize_Abundance.py -i Eren2021-09-07.csv -s eren
          ./Initialize_Abundance.py -i Dewhirst2021-09-07.csv -s dewhirst -pp
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=True,  action="store",   dest = "infile", default='none',
                                                    help=" ")
#    parser.add_argument("-s", "--source",   required=True,  action="store",   dest = "source", 
#                                                    help="ONLY segata dewhirst eren")
    parser.add_argument("-o", "--outfile",   required=False,  action="store",   dest = "outfile", default='homdData-TaxonCounts.json',
                                                    help=" ")
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
    #myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
#     if args.source not in ['segata','dewhirst','eren']:
#         sys.exit('no valid source')
#     if args.source.lower() not in args.infile.lower():
#         sys.exit('file/source mismatch')
    
    run_abundance_csv()
   
    