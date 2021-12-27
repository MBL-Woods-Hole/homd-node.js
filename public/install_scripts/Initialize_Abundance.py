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
                            collector[taxon_string]['segata'][header_row[i]]={'site':header_row[i], 'avg':row[i],'sd':row[i+1]} # for segata
                    
                    elif i>=start_dewhirst_index and i < start_dewhirst_index + dewhirst_col_count:
                        if header_row[i] in dewhirst_headers and row[i]:
                            #print(header_row[i],row[i],row[i+1])
                            collector[taxon_string]['dewhirst'][header_row[i]]={'site':header_row[i], 'avg':row[i],'sd':row[i+1],'prev':row[i+2]} # for segata
                    
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
    
def run_abundance_db(): 
    collector = {}
    json_file = args.outfile
    if os.path.isfile(json_file):
        f = open(json_file)
        collector = json.load(f)
    q = "SELECT * from abundance"
    result = myconn_new.execute_fetch_select_dict(q)
    """
    {'abundance_id': 1148, 'reference': 'Dewhirst35x9', 'otid': '362', 'taxonomy': 'Bacteria;Synergistetes;Synergistia;Synergistales;Synergistaceae;Fretibacterium;sp. HMT 362', 'level': 'Species', 'max_any_site': '0.02095498', 'BM_mean': '0.002', 'BM_prev': '12.5', 'BM_sd': '0.007', 'KG_mean': '0', 'KG_prev': '5.9', 'KG_sd': '0.001', 'HP_mean': '0', 'HP_prev': '7.7', 'HP_sd': '0.001', 'TD_mean': '0', 'TD_prev': '3.1', 'TD_sd': '0.001', 'PT_mean': '0.006', 'PT_prev': '6.9', 'PT_sd': '0.03', 'Throat_mean': '0', 'Throat_prev': '3.2', 'Throat_sd': '0', 'Saliva_mean': '0', 'Saliva_prev': '6.1', 'Saliva_sd': '0.001', 'SupP_mean': '0', 'SupP_prev': '5.7', 'SupP_sd': '0.001', 'SubP_mean': '0.021', 'SubP_prev': '9.7', 'SubP_sd': '0.1', 'Stool_mean': '', 'Stool_prev': '', 'Stool_sd': ''}
    """
    header_suffixes = ['sd','prev','mean']
    header_prefixes = ['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP','Stool']
    
    for row in result:
        #print(row)
        max_segata, max_eren, max_dewhirst = 0,0,0
        taxon_string = row['taxonomy']
        tax_parts = taxon_string.split(';')
        if len(tax_parts) == 7:
            taxon_string = ';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+tax_parts[6]
            if 'clade' in tax_parts[6] or 'subsp' in tax_parts[6]:
                if tax_parts[6] in subspecies:
                    taxon_string =';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+subspecies[tax_parts[6]][0]+';'+subspecies[tax_parts[6]][1]
        if taxon_string not in collector:
            print('!!!missing from HOMD collector:!!! ',taxon_string)
            collector[taxon_string] = {}
        collector[taxon_string]['otid'] = row['otid']
        collector[taxon_string]['max_all'] = row['max_any_site']
        
        if 'segata' not in collector[taxon_string]:
            collector[taxon_string]['segata'] = {}
        if 'eren' not in collector[taxon_string]:
            collector[taxon_string]['eren'] = {}
        if 'dewhirst' not in collector[taxon_string]:
            collector[taxon_string]['dewhirst'] = {}
        
        if row['reference'].startswith('Segata'):
            for p in header_prefixes:
                max_segata = get_max(row, p, max_segata)
                collector[taxon_string]['segata'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_segata'] = max_segata
        elif row['reference'].startswith('Eren'):
            for p in header_prefixes:
                max_eren = get_max(row, p, max_eren)
                collector[taxon_string]['eren'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_eren'] = max_eren
        elif row['reference'].startswith('Dewhirst'):
            for p in header_prefixes:
                max_dewhirst = get_max(row, p, max_dewhirst)
                collector[taxon_string]['dewhirst'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_dewhirst'] = max_dewhirst
        
    #print(collector)
    #for s in collector:
    #    print('max_eren-s',s,collector[s])
    filename = args.outfile
    print_dict(filename, collector)
    
"""
if species: species == genus+species
Bacteria;Firmicutes;Bacilli;Lactobacillales;Aerococcaceae;Abiotrophia;Abiotrophia defectiva": {"tax_cnt": 1, "gcnt": 1, "refcnt": 1, 
"segata": {}, 
"eren": {"BM": {"site": "BM", "avg": "0.274", "prev": "61.039"}, "KG": {"site": "KG", "avg": "0.163", "prev": "32.468"}, "HP": {"site": "HP", "avg": "0.13", "prev": "53.247"}, "TD": {"site": "TD", "avg": "0.013", "prev": "20.779"}, "PT": {"site": "PT", "avg": "0.026", "prev": "31.169"}, "Throat": {"site": "Throat", "avg": "0.038", "prev": "24.675"}, "Saliva": {"site": "Saliva", "avg": "0.174", "prev": "42.857"}, "SupP": {"site": "SupP", "avg": "0.484", "prev": "75.325"}, "SubP": {"site": "SubP", "avg": "0.489", "prev": "63.636"}, "Stool": {"site": "Stool", "avg": "0", "prev": "1.299"}}, 
"dewhirst": {"BM": {"site": "BM", "avg": "0.192", "stdev": "0.343", "prev": "75"}, "KG": {"site": "KG", "avg": "0.081", "stdev": "0.14", "prev": "61.8"}, "HP": {"site": "HP", "avg": "0.138", "stdev": "0.289", "prev": "76.9"}, "TD": {"site": "TD", "avg": "0.006", "stdev": "0.008", "prev": "56.3"}, "PT": {"site": "PT", "avg": "0.017", "stdev": "0.037", "prev": "62.1"}, "Throat": {"site": "Throat", "avg": "0.019", "stdev": "0.039", "prev": "61.3"}, "Saliva": {"site": "Saliva", "avg": "0.083", "stdev": "0.168", "prev": "79.6"}, "SupP": {"site": "SupP", "avg": "0.244", "stdev": "0.415", "prev": "71.4"}, "SubP": {"site": "SubP", "avg": "0.099", "stdev": "0.224", "prev": "56.9"}}, 
"max_segata": "", "max_eren": "0.489", "max_dewhirst": "0.244", "max_all": "0.489017644", "otid": "389"}
"""
def get_max(row, p, max_ref):
    test = row[p+'_mean']
    #print(max_ref)
    if not test:
        test = 0.0
    if not max_ref:
        max_ref = 0.0
    if float(test) > float(max_ref):
        max_ref = float(test)
    if max_ref == 0:
        return ''
    return max_ref
    
def print_dict(filename, dict):
    print('Re-Writing',filename)
    with open(filename, 'w') as outfile:
        json.dump(dict, outfile, indent=args.indent)    

        
if __name__ == "__main__":

    usage = """
    USAGE:
        Opens and adds to the homdData-TaxonCounts.json file 
        MUST be run AFTER Initialize_Taxonomy.py
        ./Initialize_Abundance.py -i HOMDtaxa-abundance-2021-09-06-cleaned.csv
        
        TODO add abundance data to database
        2021-12-09 Note: Abundance data has been put in database table: 'abundance'
           using ./6_load_abundance2db.py and 3 abund files
        this will be re-written to pull data from db rather than file

        OLD:
        Run 3 times (once for each abundance.csv file
          ./Initialize_Abundance.py -i Segata2021-09-07.csv -s segata
          ./Initialize_Abundance.py -i Eren2021-09-07.csv -s eren
          ./Initialize_Abundance.py -i Dewhirst2021-09-07.csv -s dewhirst -pp
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    parser.add_argument("-i", "--infile",   required=False,  action="store",   dest = "infile", default='none',
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
    args.source = 'file'
    if args.infile == 'none':
        ans = input('take data from db? (N/y) ').lower()
        if ans == 'y':
            args.source = 'db'
        else:
            args.source = 'file'
            if args.infile == 'none':
                sys.exit('Please enter file name on command line:\n\n'+usage)
    
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
    if args.source == 'file':
        run_abundance_csv()
    else:
        myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
        run_abundance_db()
   
    