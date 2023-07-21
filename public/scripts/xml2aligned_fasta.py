#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)
##
import os, sys, re
import json
#from json import JSONEncoder
import argparse
import subprocess
from Bio import AlignIO
from Bio import Phylo

from Bio.Phylo.TreeConstruction import DistanceCalculator
#from ete3 import Tree
#from ete3 import PhyloTree
#from connect import MyConnection
import datetime
#from bs4 import BeautifulSoup   # cant read hyphen
import xml.etree.ElementTree as ET
today = str(datetime.date.today())




def run_unalingned(args): 
    collector = {}
    #with open(args.infile, 'r') as f:
    #    data = f.read()
    args.outfilepath = os.path.join(args.sourcedir, args.outfile+'.fa')
    fout = open(args.outfilepath,'w')
    
    root = ET.parse(os.path.join(args.sourcedir,args.filename)).getroot()
    
    # maxlength = 0
#     for hsp in root.iter('Hsp'):
#         for child in hsp:
#             #print(child.tag)
#             if child.tag == 'Hsp_align-len':
#                 #print(child.text)
#                 if int(child.text) > maxlength:
#                     maxlength = int(child.text)
#     
#     
#     print('Maxlength',maxlength)
    fasta_text = ''
    args.hit_count = 0
    for hit in root.iter('Hit'):
        args.hit_count += 1
        for child in hit:
            #print(child.tag)
            if child.tag == 'Hit_def':
               # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
               # GENOME:: SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
               if child.text.startswith('SEQF'):
                   # NCBI:GENOME:: SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
                   # PROKKA:GENOME SEQF5240.1_02338 16S ribosomal RNA [HMT-188 Rothia aeria C6B]
                   x = child.text.split()  # split on white space
                   if '|' in x[0]:   # NCBI
                       defline = '>'+ x[0]+';'+x[1]
                   else:   # PROKKA
                       res = re.findall(r'\[.*?\]', child.text)
                       bracket = res[0].lstrip('[').rstrip(']')
                       #print('res',res,bracket)
                       defline = '>' + x[0]+';'+bracket.split()[0]
               else:
                   # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
                   x = [n.strip() for n in child.text.split('|')]
                   defline = '>'+ x[2]+';'+x[1].replace(' ','_')+';'+x[4].replace(' ','')
               print('Adding',defline)
               fout.write(defline+'\n')
               fasta_text += defline+'\n'
        for hsp in hit.iter('Hsp'):
            #print(hsp.tag)
            for child in hsp:
                if child.tag == 'Hsp_hseq':
                    sequence = str(child.text)
                    #print(sequence)
                    fout.write(sequence+'\n')
                    fasta_text += defline+'\n'
    fout.close()
    
    
    
def run_alingnment(args): 
    # https://www.youtube.com/watch?v=wBdz3vFQ4Ks&ab_channel=TaylorReeceLindsay
    # https://github.com/taylor-lindsay/phylogenetics/blob/master/turtles/turtles.ipynb
    args.maligned = args.outfilepath+"-aligned.aln"
    infile = args.outfilepath
    cmdls = [args.muscle, "-in",infile,'-out',args.maligned]  #,'-clw']
    #print('Muscle:',' '.join(cmdls))
    subprocess.call(cmdls)

def run_tree(args):    
    #print('HitCount',args.hit_count)
    import matplotlib
    import matplotlib.pyplot as plt
    with open(args.maligned,"r") as aln: 
        alignment = AlignIO.read(aln,"fasta")  #"clustal") "fasta" "clustal"
    
    
    calculator = DistanceCalculator('identity')
    distance_matrix = calculator.get_distance(alignment)
    print(distance_matrix)
    from Bio.Phylo.TreeConstruction import DistanceTreeConstructor
    constructor = DistanceTreeConstructor(calculator)
    my_tree = constructor.build_tree(alignment)
    my_tree.rooted = True
    #Phylo.write(my_tree, "turtle_tree.xml", "phyloxml")
    #print(my_tree)
    #Phylo.write(my_tree, "my_tree.xml", "phyloxml")
    #import matplotlib
    #import matplotlib.pyplot as plt
    #fig = plt.figure(figsize=(13, 5), dpi=100)
    h = args.hit_count + 5
    w = 20
    fig = plt.figure(figsize=(w, h), dpi=65) # create figure & set the size 
    matplotlib.rc('font', size=20)              # fontsize of the leaf and node labels 
    matplotlib.rc('xtick', labelsize=10)       # fontsize of the tick labels
    matplotlib.rc('ytick', labelsize=10)       # fontsize of the tick labels
    my_tree.ladderize()                       # optional view
    axes = fig.add_subplot(1, 1, 1)
    Phylo.draw(my_tree, axes=axes, do_show=False) # myst be present and False
    fig.savefig(os.path.join(args.sourcedir,"my_cladogram"))  # png
    
    
if __name__ == "__main__":

    usage = """
    USAGE:
        -id/--directory   --- Full Path Input Directory ()
        -mp/--muscle_path --- Full Path to muscle (including executable)
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    
    parser.add_argument("-id", "--directory",   required=True,  action="store",   dest = "sourcedir", 
                                                    help="")
    parser.add_argument("-o", "--outfile",   required=False,  action="store",   dest = "outfile", default='blastout',
                                                    help=" ")
    
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()") 
    parser.add_argument("-mp", "--muscle_path",   required=False,  action="store",    dest = "muscle", default='/Users/avoorhis/anaconda3/bin/muscle',
                                                    help="verbose print()") 
    args = parser.parse_args()
    args.filename = 'sequenceserver-xml_report.xml'
    
    
    run_unalingned(args)
    run_alingnment(args)
    run_tree(args)
    print('PyScript Finished')
    