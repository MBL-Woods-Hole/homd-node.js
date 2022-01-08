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



    
def run_abundance_db(): 
    collector = {}
    filestarter = 'homdData-TaxonCounts.json'
    #json_file = args.outfile
    json_file = filestarter
    if os.path.isfile(json_file):
        f = open(json_file)
        collector = json.load(f)
    q = "SELECT * from abundance"
    result = myconn_new.execute_fetch_select_dict(q)
    """
    {'abundance_id': 1148, 'reference': 'Dewhirst35x9', 'otid': '362', 'taxonomy': 'Bacteria;Synergistetes;Synergistia;Synergistales;Synergistaceae;Fretibacterium;sp. HMT 362', 'level': 'Species', 'max': '0.02095498', 'BM_mean': '0.002', 'BM_prev': '12.5', 'BM_sd': '0.007', 'KG_mean': '0', 'KG_prev': '5.9', 'KG_sd': '0.001', 'HP_mean': '0', 'HP_prev': '7.7', 'HP_sd': '0.001', 'TD_mean': '0', 'TD_prev': '3.1', 'TD_sd': '0.001', 'PT_mean': '0.006', 'PT_prev': '6.9', 'PT_sd': '0.03', 'Throat_mean': '0', 'Throat_prev': '3.2', 'Throat_sd': '0', 'Saliva_mean': '0', 'Saliva_prev': '6.1', 'Saliva_sd': '0.001', 'SupP_mean': '0', 'SupP_prev': '5.7', 'SupP_sd': '0.001', 'SubP_mean': '0.021', 'SubP_prev': '9.7', 'SubP_sd': '0.1', 'Stool_mean': '', 'Stool_prev': '', 'Stool_sd': ''}
    """
    
    header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    segata_header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    eren_header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    dewhirst_header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','NS']
    
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
            print('!!!missing from HOMD collector(TaxonCounts.json):!!! ',taxon_string)
            collector[taxon_string] = {}
        collector[taxon_string]['otid'] = row['otid']
        collector[taxon_string]['max_all'] = row['max']
        if 'notes' not in collector[taxon_string]:
            collector[taxon_string]['notes'] = {}
        if 'segata' not in collector[taxon_string]:
            collector[taxon_string]['segata'] = {}
        if 'eren_v1v3' not in collector[taxon_string]:
            collector[taxon_string]['eren_v1v3'] = {}
        if 'eren_v3v5' not in collector[taxon_string]:
            collector[taxon_string]['eren_v3v5'] = {}
        if 'dewhirst' not in collector[taxon_string]:
            collector[taxon_string]['dewhirst'] = {}
        
        if row['reference'].startswith('Segata'):
            for p in segata_header_prefixes:
                max_segata = get_max(row, p, max_segata)
                collector[taxon_string]['segata'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_segata'] = max_segata
            collector[taxon_string]['notes']['segata'] = row['notes']
        if row['reference'].startswith('Eren2014_v1v3'):
            for p in eren_header_prefixes:
                max_eren = get_max(row, p, max_eren)
                collector[taxon_string]['eren_v1v3'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_erenv1v3'] = max_eren
            collector[taxon_string]['notes']['eren_v1v3'] = row['notes']
        if row['reference'].startswith('Eren2014_v3v5'):
            for p in eren_header_prefixes:
                max_eren = get_max(row, p, max_eren)
                collector[taxon_string]['eren_v3v5'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_erenv3v5'] = max_eren
            collector[taxon_string]['notes']['eren_v3v5'] = row['notes']
        if row['reference'].startswith('Dewhirst'):
            for p in dewhirst_header_prefixes:
                max_dewhirst = get_max(row, p, max_dewhirst)
                collector[taxon_string]['dewhirst'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd']}
            collector[taxon_string]['max_dewhirst'] = max_dewhirst
            collector[taxon_string]['notes']['dewhirst'] = row['notes']
        
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
        ./Initialize_Abundance.py (now gets data from DB table: 'abundance')
        
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
    parser.add_argument("-o", "--outfile",   required=False,  action="store",   dest = "outfile", 
            default='homdData-TaxonCounts.json',  help=" ")
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
   
    myconn_new = MyConnection(host=dbhost_new, db=args.NEW_DATABASE,  read_default_file = "~/.my.cnf_node")
    run_abundance_db()
   
    