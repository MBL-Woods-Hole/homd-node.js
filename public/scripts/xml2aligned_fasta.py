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
import pylab

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
    use_original_defline = False
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
                # fasttree no like :,()
                if use_original_defline:
                   # no whitespace
                   defline = '>'+child.text.replace(' ','')
                else:
                    child_text = child.text.replace(':','=').replace(',',';').replace('(','[').replace(')',']')
                    # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
                    # GENOME::NCBI:   SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
                    #         PROKKA: SEQF5240.1_02338 16S ribosomal RNA [HMT-188 Rothia aeria C6B]
                    if child_text.startswith('SEQF'):
                        # NCBI:GENOME:: SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
                        # PROKKA:GENOME SEQF5240.1_02338 16S ribosomal RNA [HMT-188 Rothia aeria C6B]
                        x = child_text.split()  # split on white space
   
                        if '|' in x[0]:   # NCBI
                            # NCBI:GENOME:: SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
                            species = x[2] + '_' + x[3]
                            hmt = x[1]
                            #defline = '>'+ x[0]+';'+x[1]
                            defline = '>' + species + '|' + hmt + '|' + x[0]
                        else:   # PROKKA
                            # PROKKA:GENOME SEQF5240.1_02338 16S ribosomal RNA [HMT-188 Rothia aeria C6B]
                            res = re.findall(r'\[.*?\]', child_text)
                            bracket = res[0].lstrip('[').rstrip(']').split()
                            species = bracket[1] + '_' + bracket[2]
                            hmt = bracket[0]
                            #print('res',res,bracket)
                            defline = '>' + species+'|' + hmt + '|' + x[0]
       
                    else:
                        # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
                        x = [n.strip() for n in child_text.split('|')]
                        species = x[1].replace(' ','_')
                        hmt = x[2]
                        #defline = '>'+ x[2]+';'+x[1].replace(' ','_')+';'+x[4].replace(' ','')
                        defline = '>' + species + '|' + hmt + '|' + x[0]
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
    # https://taylor-lindsay.github.io/phylogenetics/
    # https://github.com/taylor-lindsay/phylogenetics/blob/master/turtles/turtles.ipynb
    args.maligned = args.outfilepath+"-aligned.aln"
    infile = args.outfilepath
    cmdls = [os.path.join(args.condabin,'muscle'), "-in",infile,'-out',args.maligned]  #,'-clw']
    #print('Muscle:',' '.join(cmdls))
    subprocess.call(cmdls)
    
def run_newick(args):
    args.maligned = args.outfilepath+"-aligned.aln"
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    cmdls = [os.path.join(args.condabin,'fasttree'), "<",args.maligned,'>',newickfile]  #,'-clw']
    print('FastTree:',' '.join(cmdls))
    os.system(' '.join(cmdls))
    
    
def run_tree1(args):    
    #print('HitCount',args.hit_count)
    import matplotlib
    import matplotlib.pyplot as plt
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    my_tree = Phylo.read(newickfile, "newick")
    
    my_tree.rooted = True
    
    h = args.hit_count -3
    w = 15
    fig = plt.figure(figsize=(w, h), dpi=10) # create figure & set the size 
    #plt.margins(0.2)
    matplotlib.rc('font', size=10)              # fontsize of the leaf and node labels 
    #matplotlib.rc('xtick', labelsize=10)       # fontsize of the tick labels
    #matplotlib.rc('ytick', labelsize=10)       # fontsize of the tick labels
    my_tree.ladderize()                        # optional view
    axes = fig.add_subplot()
    plt.subplots_adjust(right=0.7)
    #xlim = axes.get_xbound()
    #print('xlim',xlim)
    #axes.set_xbound([xlim[0],xlim[1]+10])
    
    Phylo.draw(my_tree, label_func=get_label, axes=axes,  do_show=False) # myst be present and False
    
    pylab.savefig(os.path.join(args.sourcedir,'tree.svg'), format='svg',  dpi=1200)
   
def run_tree(args):    
    #print('HitCount',args.hit_count)
    import matplotlib
    import matplotlib.pyplot as plt
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    my_tree = Phylo.read(newickfile, "newick")
    #print('tree',tree)
    #sys.exit()
    
    with open(args.maligned,"r") as aln: 
        alignment = AlignIO.read(aln,"fasta")  #"clustal") "fasta" "clustal"
    
    #subprocess.call(cmdls)

    # print('ALN',alignment)
#     calculator = DistanceCalculator('identity')
#     distance_matrix = calculator.get_distance(alignment)
#     print('DM:',distance_matrix)
#     
#     from Bio.Phylo.TreeConstruction import DistanceTreeConstructor
#     constructor = DistanceTreeConstructor(calculator)
#     
#     my_tree = constructor.build_tree(alignment)
#     print('mytree',my_tree)
#     #Phylo.write(my_tree, os.path.join(args.sourcedir,"newick.tre"), "newick")
#     #print('NW',my_tree)
    my_tree.rooted = True
    #Phylo.write(my_tree, "turtle_tree.xml", "phyloxml")
    #print(my_tree)
    #Phylo.write(my_tree, "my_tree.xml", "phyloxml")
    #import matplotlib
    #import matplotlib.pyplot as plt
    #fig = plt.figure(figsize=(13, 5), dpi=100)
    h = args.hit_count -3
    w = 20
    fig = plt.figure(figsize=(w, h), dpi=150) # create figure & set the size 
    
    #matplotlib.rc('font', size=20)              # fontsize of the leaf and node labels 
    #matplotlib.rc('xtick', labelsize=10)       # fontsize of the tick labels
    #matplotlib.rc('ytick', labelsize=10)       # fontsize of the tick labels
    my_tree.ladderize()                        # optional view
    #plt.xticks([])
    axes = fig.add_subplot(1, 1, 1)
    Phylo.draw(my_tree, label_func=get_label, axes=axes,  do_show=False) # myst be present and False
    #Phylo.draw(my_tree, label_func=get_label,  do_show=False)
    #pylab.axis('off')
    pylab.savefig(os.path.join(args.sourcedir,'tree2.svg'),format='svg', bbox_inches='tight', dpi=300)
    #fig.savefig(os.path.join(args.sourcedir,"my_cladogram"))  # png
    
def get_label(leaf):
    return leaf.name    

def run_mafft():
    fasta = args.outfilepath
    
    #infile = args.outfilepath
    args.mafft = os.path.join(args.sourcedir,'aligned.mafft')
    f = open(args.mafft, "w")
    cmdls = [os.path.join(args.condabin,'mafft'),fasta,'>',args.mafft]  #,'-clw']
    cmdls = [os.path.join(args.condabin,'mafft'),fasta]  #,'-clw']
    cmd = ' '.join(cmdls)
    print('mafft:',cmdls)
    subprocess.run(cmdls, stdout=f)
    f.close()
    

def run_fasttree():
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    f = open(newickfile, "w")
    cmdls = [os.path.join(args.condabin,'fasttree'), args.mafft,'>',newickfile]  #,'-clw']
    cmdls = [os.path.join(args.condabin,'fasttree'), args.mafft]  #,'-clw']
    cmd = ' '.join(cmdls)
    print('FastTree:',cmd)
    #os.system(cmd)
    subprocess.run(cmdls, stdout=f)
    f.close()
    

def run_nw_utils():
    #nw_reroot ParB.tre|nw_order -c n - > tree.reroot.order.tre
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    rerootfile = os.path.join(args.sourcedir,"tree.reroot.order.tre")
    f = open(rerootfile, "w")
    
    #cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile+'|nw_order','-c','n','-','>',rerootfile]
    cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile]  #+'|nw_order','-c','n','-']
    #cmd = ' '.join(cmdls)
    #print('nw_reroot:',cmd)
    subprocess.run(cmdls, stdout=f)
    f.close()
    
    svgfile = os.path.join(args.sourcedir,"tree.svg")
    f = open(svgfile, "w")
    #   nw_display -R 40 -s -v 20 -i 'opacity:0' -b 'visibility:hidden' -l 'font-family:san-serif' -w 1000 -W 6 tree.reroot.order.tre > ParB.svg
    #cmdls = [os.path.join(args.condabin,'nw_display'),'-b','visibility:hidden','-l','font-family:san-serif','-R','80','-s','-v','40','-w','1000','-W','5',rerootfile,'>',svgfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    cmdls = [os.path.join(args.condabin,'nw_display'),'-b','visibility:hidden','-l','font-family:san-serif','-R','80','-s','-v','40','-w','1000','-W','5',rerootfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    
    cmd = ' '.join(cmdls)
    print('nw_display:',cmd)
    subprocess.run(cmdls, stdout=f)
    f.close()
    
if __name__ == "__main__":

    usage = """
    USAGE:
        -id/--directory   --- Full Path Input Directory ()
        -mp/--muscle_path --- Full Path to muscle (including executable)
        -ftp/--fasttree_path --- Full Path to fasttree
        -c/--condabin  -- path to conda/bin contains: newick_utils,fasttree,mafft,muscle
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
    parser.add_argument("-ftp", "--fasttree_path",   required=False,  action="store",    dest = "fasttree", default='/Users/avoorhis/anaconda3/bin/fasttree',
                                                    help="verbose print()") 
    parser.add_argument("-c", "--condabin",   required=False,  action="store",    dest = "condabin", default='/Users/avoorhis/anaconda3/bin',
                                                    help="verbose print()")                                                 
    args = parser.parse_args()
    args.filename = 'sequenceserver-xml_report.xml'
    
    # mafft ParB.fasta > ParB.mafft
#   FastTree ParB.mafft > ParB.tre
# 
#   VERSION=2.0
# 
#   nw_reroot ParB.tre|nw_order -c n - > tree.reroot.order.tre
# 
#   nw_display -R 40 -s -v 20 -i 'opacity:0' -b 'visibility:hidden' -l 'font-family:san-serif' -w 1000 -W 6 tree.reroot.order.tre > ParB.svg
# 
#   ./replace_longname.pl ParB.svg $VERSION
    run_unalingned(args)
    run_mafft()
    run_fasttree()
    run_nw_utils()
    
    sys.exit()
    
    
    run_alingnment(args)
    run_newick(args)
    run_tree1(args)
    print('PyScript Finished')
    