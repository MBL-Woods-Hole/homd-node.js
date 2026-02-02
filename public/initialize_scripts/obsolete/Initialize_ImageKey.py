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
sys.path.append('../../../homd-data/')
from connect import MyConnection
import datetime
ranks = ['domain','phylum','klass','order','family','genus','species']
today = str(datetime.date.today())

# segata_headers=['BM','KG','HP','Throat','PT','TD','Saliva','SupP','SubP','Stool']
# dewhirst_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP']
# eren_headers=['BM','KG','HP','TD','PT','Throat','Saliva','SupP','SubP','Stool']
headers = ['SubP','SupP','KG','BM','HP','SV','TH','PT','TD','NS','ST']

   
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
subspecies['reuteri clade 818'] = ['reuteri','clade_818']  # tax_parts 6 and 7
subspecies['reuteri clade 938'] = ['reuteri','clade_938'] 
subspecies['cristatus clade 578'] = ['cristatus','clade_578'] 
subspecies['cristatus clade 886'] = ['cristatus','clade_886'] 
subspecies['infantis clade 431'] = ['infantis','clade_431'] 
subspecies['infantis clade 638'] = ['infantis','clade_638'] 
subspecies['oralis subsp. dentisani clade 058'] = ['oralis','subsp._dentisani_clade_058'] 
subspecies['oralis subsp. dentisani clade 398'] = ['oralis','subsp._dentisani_clade_398'] 
