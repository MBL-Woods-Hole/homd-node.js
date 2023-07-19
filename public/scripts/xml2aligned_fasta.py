#!/usr/bin/env python

## SEE https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
# this script creates a list of json objects that allows the dhtmlx javascript library
# to parse and show a taxonomy tree (Written for HOMD)
##
import os, sys
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
    # Passing the stored data inside
    # the beautifulsoup parser, storing
    # the returned object
    
    root = ET.parse(os.path.join(args.sourcedir,args.filename)).getroot()
    
    maxlength = 0
    for hsp in root.iter('Hsp'):
        for child in hsp:
            #print(child.tag)
            if child.tag == 'Hsp_align-len':
                #print(child.text)
                if int(child.text) > maxlength:
                    maxlength = int(child.text)
    
    
    print('Maxlength',maxlength)
    fasta_text = ''
    for hit in root.iter('Hit'):
        for child in hit:
            #print(child.tag)
            if child.tag == 'Hit_def':
               l = [n.strip() for n in child.text.split('|')]
               # 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
               defline = '>'+ l[2]+';'+l[1].replace(' ','_')+';'+l[4].replace(' ','')
               print('Adding',defline)
               fout.write(defline+'\n')
               fasta_text += defline+'\n'
        for hsp in hit.iter('Hsp'):
            #print(hsp.tag)
            for child in hsp:
                if child.tag == 'Hsp_hseq':
                    #print(child.text)
                    #print(len(child.text))
                    #if len(child.text) != maxlength:
                    #    sequence = str(child.text).ljust(maxlength, 'N')
                    #else:
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
    
    subprocess.call(["muscle", "-in",infile,'-out',args.maligned,'-clw'])

def run_tree(args):    
    with open(args.maligned,"r") as aln: 
        alignment = AlignIO.read(aln,"clustal") 
    
    
    calculator = DistanceCalculator('identity')
    distance_matrix = calculator.get_distance(alignment)
    print(distance_matrix)
    from Bio.Phylo.TreeConstruction import DistanceTreeConstructor
    constructor = DistanceTreeConstructor(calculator)
    my_tree = constructor.build_tree(alignment)
    my_tree.rooted = True
    #print(my_tree)
    #Phylo.write(my_tree, "my_tree.xml", "phyloxml")
    #import matplotlib
    #import matplotlib.pyplot as plt
    
    #fig = Phylo.draw(my_tree)
    
    import matplotlib
    import matplotlib.pyplot as plt
    fig = plt.figure(figsize=(13, 5), dpi=100) # create figure & set the size 
    matplotlib.rc('font', size=12)              # fontsize of the leaf and node labels 
    matplotlib.rc('xtick', labelsize=10)       # fontsize of the tick labels
    matplotlib.rc('ytick', labelsize=10)       # fontsize of the tick labels
    #turtle_tree.ladderize()
    axes = fig.add_subplot(1, 1, 1)
    Phylo.draw(my_tree, axes=axes)
    #fig.savefig("my_cladogram")
    
    sys.exit()
    
    output_handle = open(outfile, "w")
    #alignment = AlignIO.read(open(args.outfile), "phylip")
    #fsta = AlignIO.parse(args.outfile, "fasta")
    alignment = AlignIO.parse(args.outfile,"fasta")
    AlignIO.write(alignment, "my_example.phy", "phylip")
    #print(type(fsta))
    
    print(distance_matrix)
    #print("Alignment length %i" % alignment.get_alignment_length())
    AlignIO.write(alignment, output_handle, "phylip")
    #for record in alignment:
    #    print(record.seq + " " + record.id)

def tree(args):
    
    tree = Phylo.read("tree1", "newick")
    print(tree)
    Phylo.draw_ascii(tree)
    #FastTree -nt -gtr -gamma input_aln.fasta > input.tre
    
if __name__ == "__main__":

    usage = """
    USAGE:
        -id In Directory
        
    """

    parser = argparse.ArgumentParser(description="." ,usage=usage)

    
    parser.add_argument("-id", "--directory",   required=True,  action="store",   dest = "sourcedir", 
                                                    help="")
    parser.add_argument("-o", "--outfile",   required=False,  action="store",   dest = "outfile", default='blastout',
                                                    help=" ")
    
    parser.add_argument("-v", "--verbose",   required=False,  action="store_true",    dest = "verbose", default=False,
                                                    help="verbose print()") 
    args = parser.parse_args()
    args.filename = 'sequenceserver-xml_report.xml'
    
    
    run_unalingned(args)
    run_alingnment(args)
    run_tree(args)
    