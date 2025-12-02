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
sys.path.append('../homd-data/')
sys.path.append('../../homd-data/')
sys.path.append('../../config/')
sys.path.append('/Users/avoorhis/programming/')
from connect import MyConnection
import datetime
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())

# segata_headers=['BM','KG','HP','Throat','PT','TD','Saliva','SupP','SubP','Stool']
# dewhirst_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP']
# eren_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP','Stool']
#headers = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS','ST']
headers = ['AKE','ANA','BMU','HPA','LAF','LRC','MVA','PFO','PTO','RAF','RRC','SAL','STO','SUBP','SUPP','THR','TDO','VIN','PERIO']
   
# hmt_index = 2  # only for dewhirst and eren
# rank_index=3  # rank

# max_dewhirst_index=7
# max_eren_index=8
# max_any_index=9
# start_segata_index=11

# start_dewhirst_index=31
# dewhirst_col_count=27  # header row =='BM'
# start_eren_index=59
# eren_col_count=20  # header row =='BM'
# data_start_index=11
# segata_cols = ['mean','stdev']
# eren_cols = ['mean','prevalence']
# dewhirst_cols = ['mean','stdev','prevalence']

# to correct for the few subspecies in HOMD::
# subspecies = {}
# subspecies['reuteri clade 818'] = ['reuteri','clade_818']  # tax_parts 6 and 7
# subspecies['reuteri clade 938'] = ['reuteri','clade_938'] 
# subspecies['cristatus clade 578'] = ['cristatus','clade_578'] 
# subspecies['cristatus clade 886'] = ['cristatus','clade_886'] 
# subspecies['infantis clade 431'] = ['infantis','clade_431'] 
# subspecies['infantis clade 638'] = ['infantis','clade_638'] 
# subspecies['oralis subsp. dentisani clade 058'] = ['oralis','subsp._dentisani_clade_058'] 
# subspecies['oralis subsp. dentisani clade 398'] = ['oralis','subsp._dentisani_clade_398'] 
# subspecies['oralis subsp. oralis'] = ['oralis','subsp._oralis'] 
# subspecies['oralis subsp. tigurinus clade 070'] = ['oralis','subsp._tigurinus_clade_070'] 
# subspecies['oralis subsp. tigurinus clade 071'] = ['oralis','subsp._tigurinus_clade_071'] 
# subspecies['parasanguinis clade 411'] = ['parasanguinis','clade_411']
# subspecies['parasanguinis clade 721'] = ['parasanguinis','clade_721']
# subspecies['[Eubacterium] yurii subsp. schtitka'] = ['[Eubacterium] yurii','subsp._schtitka'] 
# subspecies['[Eubacterium] yurii subsps. yurii & margaretiae'] = ['[Eubacterium] yurii','subsps._yurii_&_margaretiae']
# subspecies['nucleatum subsp. animalis'] = ['nucleatum','subsp._animalis'] 
# subspecies['nucleatum subsp. nucleatum'] = ['nucleatum','subsp._nucleatum'] 
# subspecies['nucleatum subsp. polymorphum'] = ['nucleatum','subsp._polymorphum'] 
# subspecies['nucleatum subsp. vincentii'] = ['nucleatum','subsp._vincentii'] 
"""
CREATE TABLE `abundance` (
  `abundance_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(30) NOT NULL DEFAULT '',
  `otid` varchar(11) NOT NULL DEFAULT '',
  `domain_id` int(10) unsigned NOT NULL,
  `phylum_id` int(10) unsigned NOT NULL,
  `klass_id` int(10) unsigned NOT NULL,
  `order_id` int(10) unsigned NOT NULL,
  `family_id` int(10) unsigned NOT NULL,
  `genus_id` int(10) unsigned NOT NULL,
  `species_id` int(10) unsigned NOT NULL,
  `subspecies_id` int(10) unsigned NOT NULL,
  `notes` text NOT NULL,
  `level` varchar(12) NOT NULL DEFAULT '',
  `max` varchar(10) NOT NULL DEFAULT '',
  `AKE_mean` varchar(11) NOT NULL DEFAULT '',
  `AKE_10p` varchar(11) DEFAULT '',
  `AKE_90p` varchar(11) NOT NULL DEFAULT '',
  `AKE_prev` varchar(11) NOT NULL DEFAULT '',
  `AKE_sd` varchar(11) NOT NULL DEFAULT '',
  `ANA_mean` varchar(11) DEFAULT '',
  `ANA_10p` varchar(11) NOT NULL DEFAULT '',
  `ANA_90p` varchar(11) NOT NULL DEFAULT '',
  `ANA_prev` varchar(11) NOT NULL DEFAULT '',
  `ANA_sd` varchar(11) NOT NULL DEFAULT '',
  `BMU_mean` varchar(11) NOT NULL DEFAULT '',
  `BMU_10p` varchar(11) NOT NULL DEFAULT '',
  `BMU_90p` varchar(11) NOT NULL DEFAULT '',
  `BMU_prev` varchar(11) NOT NULL DEFAULT '',
  `BMU_sd` varchar(11) NOT NULL DEFAULT '',
  `HPA_mean` varchar(11) NOT NULL DEFAULT '',
  `HPA_10p` varchar(11) NOT NULL DEFAULT '',
  `HPA_90p` varchar(11) NOT NULL DEFAULT '',
  `HPA_prev` varchar(11) NOT NULL DEFAULT '',
  `HPA_sd` varchar(11) NOT NULL DEFAULT '',
  `LAF_mean` varchar(11) NOT NULL DEFAULT '',
  `LAF_10p` varchar(11) NOT NULL DEFAULT '',
  `LAF_90p` varchar(11) NOT NULL DEFAULT '',
  `LAF_prev` varchar(11) NOT NULL DEFAULT '',
  `LAF_sd` varchar(11) NOT NULL DEFAULT '',
  `LRC_mean` varchar(11) NOT NULL DEFAULT '',
  `LRC_10p` varchar(11) NOT NULL DEFAULT '',
  `LRC_90p` varchar(11) NOT NULL DEFAULT '',
  `LRC_prev` varchar(11) NOT NULL DEFAULT '',
  `LRC_sd` varchar(11) NOT NULL DEFAULT '',
  `MVA_mean` varchar(11) NOT NULL DEFAULT '',
  `MVA_10p` varchar(11) NOT NULL DEFAULT '',
  `MVA_90p` varchar(11) NOT NULL DEFAULT '',
  `MVA_prev` varchar(11) NOT NULL DEFAULT '',
  `MVA_sd` varchar(11) NOT NULL DEFAULT '',
  `PFO_mean` varchar(11) NOT NULL DEFAULT '',
  `PFO_10p` varchar(11) NOT NULL DEFAULT '',
  `PFO_90p` varchar(11) NOT NULL DEFAULT '',
  `PFO_prev` varchar(11) NOT NULL DEFAULT '',
  `PFO_sd` varchar(11) NOT NULL DEFAULT '',
  `PTO_mean` varchar(11) NOT NULL DEFAULT '',
  `PTO_10p` varchar(11) NOT NULL DEFAULT '',
  `PTO_90p` varchar(11) NOT NULL DEFAULT '',
  `PTO_prev` varchar(11) NOT NULL DEFAULT '',
  `PTO_sd` varchar(11) NOT NULL DEFAULT '',
  `RAF_mean` varchar(11) NOT NULL DEFAULT ' ',
  `RAF_10p` varchar(11) NOT NULL DEFAULT '',
  `RAF_90p` varchar(11) NOT NULL DEFAULT '',
  `RAF_prev` varchar(11) NOT NULL DEFAULT '',
  `RAF_sd` varchar(11) NOT NULL DEFAULT '',
  `RRC_mean` varchar(11) NOT NULL DEFAULT '',
  `RRC_10p` varchar(11) NOT NULL DEFAULT '',
  `RRC_90p` varchar(11) NOT NULL DEFAULT '',
  `RRC_prev` varchar(11) NOT NULL DEFAULT '',
  `RRC_sd` varchar(11) NOT NULL DEFAULT '',
  `SAL_mean` varchar(11) NOT NULL DEFAULT '',
  `SAL_10p` varchar(11) NOT NULL DEFAULT '',
  `SAL_90p` varchar(11) NOT NULL DEFAULT '',
  `SAL_prev` varchar(11) NOT NULL DEFAULT '',
  `SAL_sd` varchar(11) NOT NULL DEFAULT '',
  `STO_mean` varchar(11) NOT NULL DEFAULT '',
  `STO_10p` varchar(11) NOT NULL DEFAULT '',
  `STO_90p` varchar(11) NOT NULL DEFAULT '',
  `STO_prev` varchar(11) NOT NULL DEFAULT '',
  `STO_sd` varchar(11) NOT NULL DEFAULT '',
  `SUBP_mean` varchar(11) NOT NULL DEFAULT '',
  `SUBP_10p` varchar(11) NOT NULL DEFAULT '',
  `SUBP_90p` varchar(11) NOT NULL DEFAULT '',
  `SUBP_prev` varchar(11) NOT NULL DEFAULT '',
  `SUBP_sd` varchar(11) NOT NULL DEFAULT '',
  `SUPP_mean` varchar(11) NOT NULL DEFAULT '',
  `SUPP_10p` varchar(11) NOT NULL DEFAULT '',
  `SUPP_90p` varchar(11) NOT NULL DEFAULT '',
  `SUPP_prev` varchar(11) NOT NULL DEFAULT '',
  `SUPP_sd` varchar(11) NOT NULL DEFAULT '',
  `THR_mean` varchar(11) NOT NULL DEFAULT '',
  `THR_10p` varchar(11) NOT NULL DEFAULT '',
  `THR_90p` varchar(11) NOT NULL DEFAULT '',
  `THR_prev` varchar(11) NOT NULL DEFAULT '',
  `THR_SD` varchar(11) NOT NULL DEFAULT '',
  `TDO_mean` varchar(11) NOT NULL DEFAULT '',
  `TDO_10p` varchar(11) NOT NULL DEFAULT '',
  `TDO_90p` varchar(11) NOT NULL DEFAULT '',
  `TDO_prev` varchar(11) NOT NULL DEFAULT '',
  `TDO_sd` varchar(11) NOT NULL DEFAULT '',
  `VIN_mean` varchar(11) NOT NULL DEFAULT '',
  `VIN_10p` varchar(11) NOT NULL DEFAULT '',
  `VIN_90p` varchar(11) NOT NULL DEFAULT '',
  `VIN_prev` varchar(11) NOT NULL DEFAULT '',
  `VIN_sd` varchar(11) NOT NULL DEFAULT '',
  `PERIO_mean` varchar(11) NOT NULL DEFAULT '',
  `PERIO_10p` varchar(11) DEFAULT '',
  `PERIO_90p` varchar(11) DEFAULT '',
  `PERIO_prev` varchar(11) DEFAULT '',
  `PERIO_sd` varchar(11) DEFAULT '',
  PRIMARY KEY (`abundance_id`),
  UNIQUE KEY `reference` (`reference`,`AKE_mean`,`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`subspecies_id`),
  KEY `abundance_id_ibfk_4` (`otid`),
  KEY `phylum_id` (`phylum_id`),
  KEY `klass_id` (`klass_id`),
  KEY `order_id` (`order_id`),
  KEY `family_id` (`family_id`),
  KEY `genus_id` (`genus_id`),
  KEY `species_id` (`species_id`),
  KEY `subspecies_id` (`subspecies_id`),
  KEY `abundance_copy4_ibfk_1` (`domain_id`),
  CONSTRAINT `abundance_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_2` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_3` FOREIGN KEY (`klass_id`) REFERENCES `klass` (`klass_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_4` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_6` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_7` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE,
  CONSTRAINT `abundance_ibfk_8` FOREIGN KEY (`subspecies_id`) REFERENCES `subspecies` (`subspecies_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

"""
dropped_taxa = []
def get_dropped():
    q ="SELECT otid, status from otid_prime JOIN status using(otid) WHERE status='Dropped'"
    result = myconn.execute_fetch_select_dict(q)

    #print(result)
    for obj in result:
        dropped_taxa.append(obj['otid'])
    #print(dropped_taxa)
    

    
def run_abundance_db(): 
    TCcounts = {}
    TCtaxa = {}
    filestarter = 'homdData-TaxonCounts.json'
    #json_file = args.outfile
    json_file = filestarter
    if os.path.isfile(json_file):
        f = open(json_file)
        TCcounts = json.load(f)
    else:
        sys.exit('FILE NOT FOUND: '+filestarter)
    sites = []
    for item in TCcounts.keys():
        TCtaxa[item] = {}
    #print('TCtaxa',TCtaxa.keys())
    #sys.exit()
    for n in headers:
        sites.append(n+'_mean')
        sites.append(n+'_10p')
        sites.append(n+'_90p')
        sites.append(n+'_sd')
        sites.append(n+'_prev')
    q = "SELECT otid,notes,`level`,reference,concat_ws(';',`domain`,`phylum`,`klass`,`order`,`family`,`genus`,`species`,`subspecies`) as taxonomy,"+ ','.join(sites)
    q += " FROM abundance"
    q += " JOIN `domain` using(domain_id)"
    q += " JOIN `phylum` using(phylum_id)"
    q += " JOIN `klass` using(klass_id)"
    q += " JOIN `order` using(order_id)"
    q += " JOIN `family` using(family_id)"
    q += " JOIN `genus` using(genus_id)"
    q += " JOIN `species` using(species_id)"
    q += " JOIN `subspecies` using(subspecies_id)"
    q += " ORDER BY `otid`"
    #print(q)
    
    
    result = myconn.execute_fetch_select_dict(q)
    """
    
# 'AKE_mean','AKE_90p','AKE_10p','AKE_sd','AKE_prev',
# 'ANA_mean','ANA_90p','ANA_10p','ANA_sd','ANA_prev',
# 'BMU_mean','BMU_90p','BMU_10p','BMU_sd','BMU_prev',
# 'HPA_mean','HPA_90p','HPA_10p','HPA_sd','HPA_prev',
# 'LAF_mean','LAF_90p','LAF_10p','LAF_sd','LAF_prev',
# 'LRC_mean','LRC_90p','LRC_10p','LRC_sd','LRC_prev',
# 'MVA_mean','MVA_90p','MVA_10p','MVA_sd','MVA_prev',
# 'PFO_mean','PFO_90p','PFO_10p','PFO_sd','PFO_prev',
# 'PTO_mean','PTO_90p','PTO_10p','PTO_sd','PTO_prev',
# 'RAF_mean','RAF_90p','RAF_10p','RAF_sd','RAF_prev',
# 'RRC_mean','RRC_90p','RRC_10p','RRC_sd','RRC_prev',
# 'SAL_mean','SAL_90p','SAL_10p','SAL_sd','SAL_prev',
# 'STO_mean','STO_90p','STO_10p','STO_sd','STO_prev',
# 'SUBP_mean','SUBP_90p','SUBP_10p','SUBP_sd','SUBP_prev',
# 'SUPP_mean','SUPP_90p','SUPP_10p','SUPP_sd','SUPP_prev',
# 'THR_mean','THR_90p','THR_10p','THR_sd','THR_prev',
# 'TDO_mean','TDO_90p','TDO_10p','TDO_sd','TDO_prev',
# 'VIN_mean','VIN_90p','VIN_10p','VIN_sd','VIN_prev'
    """
    #Missing (Segata2012)::Bacteria;Pseudomonadota;Alphaproteobacteria;Rhodobacterales;Rhodobacteraceae;Rhodobacter
    #Missing (Segata2012)::Bacteria;Synergistota;Synergistia;Synergistales;Synergistaceae;Pyramidobacter
    #Missing (Eren2014_v1v3)::Bacteria;Actinomycetota;Actinomycetia;Propionibacteriales;Propionibacteriaceae;Cutibacterium
    #Missing (Dewhirst35x9)::Bacteria;Actinomycetota;Actinomycetia;Propionibacteriales;Propionibacteriaceae;Propionibacteriaceae_[G-1]
    #header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    #header_prefixes = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS','ST']
    #segata_header_prefixes = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    #eren_header_prefixes =   ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST']
    #site_prefixes    = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD']
    all_site_prefixes = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','LAF','RAF','VIN','MVA','PFO','STO']
    eren_site_prefixes     = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO',                                                'STO']
    #segata_site_prefixes   = all_site_prefixes
    dewhirst_site_prefixes = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA']
    hmp_metaphlan_prefixes = ['SUBP','SUPP','PERIO','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','RAF','VIN','MVA','PFO','STO']
    hmp_refseq_prefixes = ['SUBP','SUPP','AKE','BMU','HPA','SAL','THR','PTO','TDO','ANA','LRC','RRC','LAF','RAF','VIN','MVA','PFO','STO']

    #['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','NS']
    #print(segata_site_prefixes)
    missing_count =0
    for row in result:
        
        max_eren, max_dewhirst, max_hmp_metaphlan, max_hmp_refseq = 0,0,0,0
        #if row['otid'] in (71,81,106,123,138,178,187,192,243,274,306,332,374,375,377,386,398,411,431,578,638,809,818,820,922,928):
        #if row['otid'] in ('071','081','081','106','123','138','178','187','192','243','274','306','332','374','375','377','386','398','411','431','578','638','809','818','820','922','928'):
        #    print('pre ',row['otid'],row['taxonomy'])
        taxon_string = fix_taxonomy(row['taxonomy'])
        #if row['otid'] in (71,81,106,123,138,178,187,192,243,274,306,332,374,375,377,386,398,411,431,578,638,809,818,820,922,928):
         #   print('post',row['otid'],taxon_string)
            
        #taxon_string = row['taxonomy']
        # tax_parts = taxon_string.split(';')
#         if len(tax_parts) == 7:
#             #print('found clade')
#             taxon_string = ';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+tax_parts[6]
#             
#             if 'clade' in tax_parts[6] or 'subsp' in tax_parts[6]:
#                 #print('found clade')
#                 if tax_parts[6] in subspecies:
#                     taxon_string =';'.join(tax_parts[:6])+';'+tax_parts[5]+' '+subspecies[tax_parts[6]][0]+';'+subspecies[tax_parts[6]][1]
        
        if taxon_string not in TCtaxa:
            #print()
            #print(row)
            missing_count +=1
            print(missing_count,taxon_string+' !Missing from TaxonCounts.json file -('+row['reference']+')')
            TCtaxa[taxon_string] = {}
        if row['otid'] not in dropped_taxa:
            TCtaxa[taxon_string]['otid'] = row['otid']
            TCtaxa[taxon_string]['ecology'] = 1
            #TCtaxa[taxon_string]['max_all'] = row['max']
            if 'notes' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['notes'] = {}
            
            if 'eren_v1v3' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['eren_v1v3'] = {}
            if 'eren_v3v5' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['eren_v3v5'] = {}
            if 'dewhirst' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['dewhirst'] = {}
            if 'hmp_metaphlan' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['hmp_metaphlan'] = {}
            if 'hmp_refseq_v1v3' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['hmp_refseq_v1v3'] = {}
            if 'hmp_refseq_v3v5' not in TCtaxa[taxon_string]:
                TCtaxa[taxon_string]['hmp_refseq_v3v5'] = {}
                
            
            if row['reference'].startswith('Eren2014_v1v3'):
                for p in eren_site_prefixes:
                    max_eren = get_max(row, p, max_eren)
                    TCtaxa[taxon_string]['eren_v1v3'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_erenv1v3'] = max_eren
                TCtaxa[taxon_string]['notes']['eren_v1v3'] = row['notes']
            if row['reference'].startswith('Eren2014_v3v5'):
                for p in eren_site_prefixes:
                    max_eren = get_max(row, p, max_eren)
                    TCtaxa[taxon_string]['eren_v3v5'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_erenv3v5'] = max_eren
                TCtaxa[taxon_string]['notes']['eren_v3v5'] = row['notes']
            if row['reference'].startswith('Dewhirst'):
                for p in dewhirst_site_prefixes:
                    max_dewhirst = get_max(row, p, max_dewhirst)
                    #print('max_dewhirst',max_dewhirst)
                    TCtaxa[taxon_string]['dewhirst'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_dewhirst'] = max_dewhirst
                TCtaxa[taxon_string]['notes']['dewhirst'] = row['notes']
            if row['reference'].startswith('HMP_MetaPhlan'):
                for p in hmp_metaphlan_prefixes:
                    max_hmp_metaphlan = get_max(row, p, max_hmp_metaphlan)
                    #print('max_dewhirst',max_dewhirst)
                    TCtaxa[taxon_string]['hmp_metaphlan'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_hmp_metaphlan'] = max_hmp_metaphlan
                TCtaxa[taxon_string]['notes']['hmp_metaphlan'] = row['notes']
                
            if row['reference'].startswith('HMP_16S_RefSeq_v1v3'):
                for p in hmp_refseq_prefixes:
                    max_hmp_refseq = get_max(row, p, max_hmp_refseq)
                    #print('max_dewhirst',max_dewhirst)
                    TCtaxa[taxon_string]['hmp_refseq_v1v3'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_hmp_refseq_v1v3'] = max_hmp_refseq
                TCtaxa[taxon_string]['notes']['hmp_refseq_v1v3'] = row['notes']
            if row['reference'].startswith('HMP_16S_RefSeq_v3v5'):
                for p in hmp_refseq_prefixes:
                    max_hmp_refseq = get_max(row, p, max_hmp_refseq)
                    #print('max_dewhirst',max_dewhirst)
                    TCtaxa[taxon_string]['hmp_refseq_v3v5'][p] = {'site':p,'avg':row[p+'_mean'],'prev':row[p+'_prev'],'sd':row[p+'_sd'],'10p':row[p+'_10p'],'90p':row[p+'_90p']}
                TCtaxa[taxon_string]['max_hmp_refseq_v3v5'] = max_hmp_refseq
                TCtaxa[taxon_string]['notes']['hmp_refseq_v3v5'] = row['notes']
    #print(TCtaxa)
    #for s in TCtaxa:
    #    print('max_eren-s',s,TCtaxa[s])
    filename = args.outfile
    print_dict(filename, TCtaxa)
    
"""
if species: species == genus+species
Bacteria;Firmicutes;Bacilli;Lactobacillales;Aerococcaceae;Abiotrophia;Abiotrophia defectiva": {"tax_cnt": 1, "gcnt": 1, "refcnt": 1, 
"segata": {}, 
"eren": {"BM": {"site": "BM", "avg": "0.274", "prev": "61.039"}, "KG": {"site": "KG", "avg": "0.163", "prev": "32.468"}, "HP": {"site": "HP", "avg": "0.13", "prev": "53.247"}, "TD": {"site": "TD", "avg": "0.013", "prev": 
"20.779"}, "PT": {"site": "PT", "avg": "0.026", "prev": "31.169"}, "Throat": {"site": "Throat", "avg": "0.038", "prev": "24.675"}, "Saliva": {"site": "Saliva", "avg": "0.174", "prev": "42.857"}, "SupP": {"site": "SupP", "avg": 
"0.484", "prev": "75.325"}, "SubP": {"site": "SubP", "avg": "0.489", "prev": "63.636"}, "Stool": {"site": "Stool", "avg": "0", "prev": "1.299"}}, 
"dewhirst": {"BM": {"site": "BM", "avg": "0.192", "stdev": "0.343", "prev": "75"}, "KG": {"site": "KG", "avg": "0.081", "stdev": "0.14", "prev": "61.8"}, "HP": {"site": "HP", "avg": "0.138", "stdev": "0.289", "prev": "76.9"}, 
"TD": {"site": "TD", "avg": "0.006", "stdev": "0.008", "prev": "56.3"}, "PT": {"site": "PT", "avg": "0.017", "stdev": "0.037", "prev": "62.1"}, "Throat": {"site": "Throat", "avg": "0.019", "stdev": "0.039", "prev": "61.3"}, 
"Saliva": {"site": "Saliva", "avg": "0.083", "stdev": "0.168", "prev": "79.6"}, "SupP": {"site": "SupP", "avg": "0.244", "stdev": "0.415", "prev": "71.4"}, "SubP": {"site": "SubP", "avg": "0.099", "stdev": "0.224", "prev": 
"56.9"}}, 
"max_segata": "", "max_eren": "0.489", "max_dewhirst": "0.244", "max_all": "0.489017644", "otid": "389"}
"""

def fix_taxonomy(taxonomy):
    tax_lst = taxonomy.strip(';').split(';')
    #print('\n',taxonomy)
    if len(tax_lst) < 7: # d,p,c,o,f,g
        return ';'.join(tax_lst)
    #print(tax_lst)
    if len(tax_lst) == 8:
        subsp = tax_lst[-1]
    else:
        subsp = ''
    genus = tax_lst[5]
    species = tax_lst[6]
    if subsp and 'Eubacterium' in species:
#         print('1')
        tax_lst = tax_lst[:6] +[genus+' '+species,subsp ]
        
    elif 'Eubacterium' in species:
        # print('\n',taxonomy)
#         print('2')
        
        tax_lst = tax_lst[:6] +[genus+' '+species]
#         print(';'.join(tax_lst))
    elif subsp:
#         print('3')
        #tax_lst.pop(-1)
        #tax_lst[-1] = tax_lst[-1]+' '+subsp
        tax_lst = tax_lst[:6] +[genus+' '+species,subsp]
        #print('subsp',tax_lst)
    else:
        tax_lst = tax_lst[:6] +[genus+' '+species]
    #return taxonomy.strip(';')
    #Bacteria;Synergistetes;Synergistia;Synergistales;Synergistaceae;Jonquetella
    #Bacteria;Synergistetes;Synergistia;Synergistales;Dethiosulfovibrionaceae;Jonquetella
    #Bacteria;Firmicutes;Clostridia;Eubacteriales;Peptostreptococcaceae;Peptostreptococcaceae_[G-1];Peptostreptococcaceae_[G-1] Peptostreptococcaceae_[G-1] [Eubacterium]_sulci
    #Bacteria;Firmicutes;Clostridia;Eubacteriales;Peptostreptococcaceae;Peptostreptococcaceae_[G-1];Peptostreptococcaceae_[G-1] [Eubacterium]_sulci
    #Bacteria;Firmicutes;Clostridia;Eubacteriales;Peptostreptococcaceae;Peptostreptococcaceae_[G-1];Peptostreptococcaceae_[G-1] [Eubacterium]_sulci
    #Bacteria;Firmicutes;Clostridia;Eubacteriales;Peptostreptococcaceae;Peptostreptococcaceae_[G-1];Peptostreptococcaceae_[G-1] [Eubacterium]_sulci
    return ';'.join(tax_lst)
    
def fix_taxonomyX(taxonomy):
    """
    subspecies were put in separate col in script: abundance_scripts/10-load_abundance2dbNEW.py and stored in db
    Here we append subspecies back to species
    """
    tax_lst = taxonomy.split(';')
    new_tax = []
    subsp = tax_lst[-1]
    
    # if subsp:
#         tax_lst.pop(-1)
#         tax_lst[-1] = tax_lst[-1]+' '+subsp
    for name in tax_lst:
        if name:
            new_tax.append(name)
    return ';'.join(new_tax)
    
def get_max(row, p, max_ref):
    #print('row',row)
    #if row['reference'] =='HMP_MetaPhlan':
    #    print('row',row['taxonomy'])
    test = row[p+'_mean']
    
    if not test.strip():
        return 0
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
        
        -host [localhost (default), homd_v4, homd_v3] :: db_host
        
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
            default='homdData-SiteAbundances.json',  help=" ")
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
    if args.dbhost == 'homd_v4':
        args.DATABASE  = 'homd'
        dbhost = '192.168.1.46'
    elif args.dbhost == 'homd_v3':
        args.DATABASE = 'homd'
        dbhost= '192.168.1.42'
    elif args.dbhost == 'homd_v41':
        args.DATABASE = 'homd'
        dbhost= '192.168.1.58'
    elif args.dbhost == 'homd_dev':
        args.DATABASE = 'homd'
        dbhost= '192.168.1.69'
    elif args.dbhost == 'localhost':
        args.DATABASE = 'homd'
        dbhost = 'localhost'
        
    else:
        sys.exit('dbhost - error')
    args.indent = None
    if args.prettyprint:
        args.indent = 4
    print('Using',args.dbhost,dbhost)
    myconn = MyConnection(host=dbhost, db=args.DATABASE,  read_default_file = "~/.my.cnf_node")
    get_dropped()
    run_abundance_db()
   
    
