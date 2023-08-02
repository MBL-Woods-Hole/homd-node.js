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
    
#     ncbiNT
#     SEQF7477.1|CP031243.1 Haemophilus haemolyticus strain M19346 chromosome, complete genome [HMT-851 Haemophilus haemolyticus M19346]
#     ncbiProtein
#     SEQF6632.1|SCQ21379.1 2-succinylbenzoate--CoA ligase [Tannerella forsythia] [HMT-613 Tannerella forsythia UB4]

#     prokkaNT
#     SEQF7477.1|CP031243.1 HMT-851 Haemophilus haemolyticus M19346
#     prokkaProtein
#     SEQF5300.1_01578 2-succinylbenzoate--CoA ligase [HMT-619 Porphyromonas gingivalis TV14]

#     REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532

    #with open(args.infile, 'r') as f:
    #    data = f.read()
    use_tspan = False
    args.leaflabels = os.path.join(args.sourcedir, 'leaflabels.sed')
    flabel = open(args.leaflabels,'w')
    args.outfilepath = os.path.join(args.sourcedir, args.outfile+'.fa')
    fout = open(args.outfilepath,'w')
    use_original_defline = False
    root = ET.parse(os.path.join(args.sourcedir,args.filename)).getroot()
    iter_count = 0
    prog = 'unknown'
    args.anno = 'unknown'
    args.seqtype = 'nt'  #OR protein [default=nt]
    
    for anno in root.iter('BlastOutput_db'):
        if 'prokka' in anno.text:
            args.anno = 'prokka'
        elif 'ncbi' in anno.text:
            args.anno = 'ncbi'
    print('anno',args.anno)
    
    for description in root.iter('BlastOutput_program'):
        prog = description.text
    print('PROG',prog)
    if prog in ['blastp','blastx']:
       args.seqtype = 'protein'
    for iteration in root.iter('Iteration'):
        
        iter_count += 1
        if iter_count > 1:
            break
        for hits in iteration.findall('Iteration_hits'):
            fasta_text = ''
            args.hit_count = 0
            for hit in hits.findall('Hit'):
                for child in hit:
                    #print('child',child.tag)
                    if child.tag == 'Hit_def':
                        # regex to find HMT
                        
                        if use_original_defline:
                            # no whitespace
                            defline = '>'+child.text.replace(' ','')
                        else:
                            child_text = child.text.replace(':','=').replace(',','_').replace('(','#').replace(')','#').replace('\n','')
                            print('\nhitdef',child_text)
                            hmt = 'HMT-000'
                            hmtary = re.findall(r'HMT\-\d{3}', child_text)
                            if len(hmtary):
                                hmt = hmtary[0]
                            print('myhmt',hmtary[0])
                            
                            # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
                            # GENOME::NCBI:   SEQF9758.1|UGNQ01000001.1 HMT-855 Kytococcus sedentarius NCTC11040
                            #         PROKKA: SEQF5240.1_02338 16S ribosomal RNA [HMT-188 Rothia aeria C6B]
                            if child_text.startswith('SEQF'):   # GENOMIC ncbi or prokka
                                
                                x = child_text.split()  # split on white space
                                if args.anno == 'prokka':

                                    if '_' in x[0]:   # prokkaProtein ONLY
#     prokkaProtein   PID=SEQF5300.1_01578
#     SEQF5300.1_01578 2-succinylbenzoate--CoA ligase [HMT-619 Porphyromonas gingivalis TV14]
                                    #   SEQF5300.1_01578 2-succinylbenzoate--CoA ligase [HMT-619 Porphyromonas gingivalis TV14]
                                        print('PROKKA - protein')
                                        pid = x[0]
                                        res = re.findall(r'\[.*?\]', child_text)
                                        bracket = res[-1].lstrip('[').rstrip(']').split()  # choose last one if >1
                                        species = bracket[1] + '_' + bracket[2]
                                        species = species.replace('[','').replace(']','')
                                        defline = hmt + '|'+ species+ '|' + pid
                                        show    = "<tspan fill='blue'>"+hmt+"</tspan>" + ' | '+ "<tspan fill='brown', style='font-style: italic;'>"+species.replace(' ','_')+"</tspan>"+ ' | ProteinID: ' + pid.replace(' ','_')
                                        #show    = hmt + ' | '+ species.replace(' ','_')+ ' | ' + pid.replace(' ','_')
                                    
                                    else:   # prokka NT
#     prokkaNT  PID=SEQF7477.1|CP031243.1
#     SEQF7477.1|CP031243.1 HMT-851 Haemophilus haemolyticus M19346
                                        print('PROKKA - NT')
                                        pid = x[0]
                                        species = x[2]+'_'+x[3]
                                        defline = hmt + '|'+ species+ '|' + pid
                                        show    = "<tspan fill='blue'>"+hmt+"</tspan>" + ' | '+ "<tspan fill='brown', style='font-style: italic;'>"+species.replace(' ','_')+"</tspan>"+ ' | ProteinID: ' + pid.replace(' ','_')
                                        
                                else:   # NCBI 
#     ncbiProtein  PID=SCQ21379.1
#     SEQF6632.1|SCQ21379.1 2-succinylbenzoate--CoA ligase [Tannerella forsythia] [HMT-613 Tannerella forsythia UB4]
#     ncbiNT  PID=CP031243.1
#     SEQF7477.1|CP031243.1 Haemophilus haemolyticus strain M19346 chromosome, complete genome [HMT-851 Haemophilus haemolyticus M19346]
# SEQF2456.1|ERI89612.1 putative CoA-substrate-specific enzyme activase [Clostridiales bacterium oral taxon 876 str. F0540] [HMT-876 Clostridiales [F-3][G-1] bacterium HMT 876 F0540]

                                    pid = x[0].split('|')[1]
                                    res = re.findall(r'\[.*?\]', child_text)
                                    try:
                                        bracket = res[-1].lstrip('[').rstrip(']').split()  # choose last one if >1
                                        species = bracket[1] + '_' + bracket[2]
                                        species = species.replace('[','').replace(']','')
                                    except:
                                        bracket = res[0].lstrip('[').rstrip(']').split()  # choose last one if >1
                                        species = bracket[1] + '_' + bracket[2]
                                        species = species.replace('[','').replace(']','')
                                    defline = hmt + '|'+ species+ '|' + pid
                                
                                    show    = "<tspan fill='blue'>"+hmt+"</tspan>" + ' | '+ "<tspan fill='brown', style='font-style: italic;'>"+species.replace(' ','_')+"</tspan>"+ ' | ProteinID: ' + pid.replace(' ','_')
                                        
#                                 if '_' in x[0]:   # prokkaProtein ONLY
#                                     print('PROKKA - protein')
#                                     pid = x[0]
# #     prokkaProtein   PID=SEQF5300.1_01578
# #     SEQF5300.1_01578 2-succinylbenzoate--CoA ligase [HMT-619 Porphyromonas gingivalis TV14]
#                                     #   SEQF5300.1_01578 2-succinylbenzoate--CoA ligase [HMT-619 Porphyromonas gingivalis TV14]
#                                     res = re.findall(r'\[.*?\]', child_text)
#                                     bracket = res[-1].lstrip('[').rstrip(']').split()  # choose last one if >1
#                                     species = bracket[1] + '_' + bracket[2]
#                                     species = species.replace('[','').replace(']','')
#                                     defline = '>' + hmt + '|'+ species+ '|' + pid
#                                 else:   # prokkaNT, ncbiProtein, ncbiNT
#                                     pid = x[0].split('|')[1]
#                                     
#                                     
#                                     
#                                     if args.seqtype == 'protein':
#                                         # ncbiProtein ONLY
#                                         print('NCBI - protein')
# #     ncbiProtein  PID=SCQ21379.1
# #     SEQF6632.1|SCQ21379.1 2-succinylbenzoate--CoA ligase [Tannerella forsythia] [HMT-613 Tannerella forsythia UB4]
#                                         res = re.findall(r'\[.*?\]', child_text)
#                                         bracket = res[-1].lstrip('[').rstrip(']').split()  # choose last one if >1
#                                         species = bracket[1] + '_' + bracket[2]
#                                         species = species.replace('[','').replace(']','')
#                                         #defline = '>' + species+'|' + hmt + '|' + x[0]
#                                         defline = '>' + hmt + ' | '+ species+ ' | ' + pid
#                                     else:  # PROKKA:NT::NCBI:NT
#                                        
#                                         print('PROKKA - NT and NCBI - NT')
# #     prokkaNT  PID=SEQF7477.1|CP031243.1
# #     SEQF7477.1|CP031243.1 HMT-851 Haemophilus haemolyticus M19346
# #     ncbiNT  PID=CP031243.1
# #     SEQF7477.1|CP031243.1 Haemophilus haemolyticus strain M19346 chromosome, complete genome [HMT-851 Haemophilus haemolyticus M19346]
#                                         
#                                         res = re.findall(r'\[.*?\]', child_text)
#                                         bracket = res[-1].lstrip('[').rstrip(']').split()  # choose last one if >1
#                                         species = bracket[1] + '_' + bracket[2]
#                                         species = species.replace('[','').replace(']','') 
#                                         #print('res',res,bracket)
#                                         #defline = '>' + species+'|' + hmt + '|' + x[0]
#                                         defline = '>' + hmt + ' | '+species+ ' | ' + pid
                            else:   # REFSEQ:: 189AW006 | Kocuria atrinae | HMT-189 | Clone: AW006 | GB: AF385532
                                # always nucleotide
                                x = [n.strip() for n in child_text.split('|')]
                                species = x[1].replace(' ','_').replace('[','').replace(']','')
                                #defline = '>'+ x[2]+';'+x[1].replace(' ','_')+';'+x[4].replace(' ','')
                                defline = hmt + '|' + species + '|' + x[0]
                                #show = "<span class='blue'>"+hmt+"<\/span>" + ' | ' + species.replace(' ','_') + ' | ' + x[0].replace(' ','_')
                                show = "<tspan fill='blue'>"+hmt+"</tspan>" + ' | ' + "<tspan fill='brown', style='font-style: italic;'>"+species.replace(' ','_')+"</tspan>" + ' | ' + x[0].replace(' ','_')
    
                        print('Adding',defline)
                        fout.write('>'+defline+'\n')
                        #flabel.write(defline.replace('_',' ')+'\t'+show+'\n')
                        flabel.write('s^'+defline.replace('_',' ')+'^'+show+'^g'+'\n')
                        fasta_text += defline+'\n'
                        
                for hsp in hit.iter('Hsp'):
                    #print('hsp.tag',hsp.tag)
                    for child in hsp:
                        if child.tag == 'Hsp_hseq':
                            sequence = str(child.text)
                            #print(sequence)
                            fout.write(sequence+'\n')
                            fasta_text += defline+'\n'
                args.hit_count += 1
    print('HIT Count',args.hit_count)
    
    fout.close()
    flabel.close()
    if args.hit_count < 10:
        print('exiting-low hits')
        sys.exit('Low Hit Count')
    
        



def get_label(leaf):
    return leaf.name    

def run_mafft():
    fasta = args.outfilepath
    
    #infile = args.outfilepath
    args.aligned = os.path.join(args.sourcedir,'aligned.mafft')
    f = open(args.aligned, "w")
    #args.e.write('\nmafft\n')
    #cmdls = [os.path.join(args.condabin,'mafft'),fasta,'>',args.mafft]  #,'-clw']
    cmdls = [os.path.join(args.condabin,'mafft'),fasta]  #,'-clw']
    cmd = ' '.join(cmdls)
    print('mafft:',cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()
    
def run_muscle():
    fasta = args.outfilepath
    
    #infile = args.outfilepath
    args.aligned = os.path.join(args.sourcedir,'aligned.muscle')
    f = open(args.aligned, "w")
    #args.e.write('\nMuscle\n')
    cmdls = [os.path.join(args.condabin,'muscle'),'-in',fasta]  #,'-clw']
    cmd = ' '.join(cmdls)
    print('muscle:',cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()    

def run_fasttree():
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    
    f = open(newickfile, "w")
    
    #args.e.write('\nFastTree\n')
    #cmdls = [os.path.join(args.condabin,'fasttree'), args.mafft,'>',newickfile]  #,'-clw']
    if args.seqtype == 'protein':
        cmdls = [os.path.join(args.condabin,'fasttree'), args.aligned]  #,'-clw']
    else:
        cmdls = [os.path.join(args.condabin,'fasttree'), '-nt',args.aligned]  #,'-clw']
    cmd = ' '.join(cmdls)
    print('FastTree:',cmd)
    #os.system(cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()
    
    

def run_nw_utils():
    #nw_reroot ParB.tre|nw_order -c n - > tree.reroot.order.tre
    newickfile = os.path.join(args.sourcedir,"newick.tre")
    rerootfile = os.path.join(args.sourcedir,"newick.reroot.order.tre")
    f = open(rerootfile, "w")
    #args.e.write('\nnw_reroot\n')
    #cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile+'|nw_order','-c','n','-','>',rerootfile]
    cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile]  #+'|nw_order','-c','n','-']
    #cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile+'|nw_order','-c','n','-']
    cmd = ' '.join(cmdls)
    print('nw_reroot:',cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()
    
    # rerootfile = os.path.join(args.sourcedir,"newick.reroot.order.tre")
#     f = open(rerootfile, "w")
#     #args.e.write('\nnw_reroot\n')
#     #cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile+'|nw_order','-c','n','-','>',rerootfile]
#     #cmdls = [os.path.join(args.condabin,'nw_reroot'), newickfile]  #+'|nw_order','-c','n','-']
#     cmdls = [os.path.join(args.condabin,'nw_order'),'-c','n',rerootfile]
#     cmd = ' '.join(cmdls)
#     print('nw_order:',cmd)
#     subprocess.run(cmdls, stdout=f, stderr=args.e)
#     f.close()
    
    svgfile = os.path.join(args.sourcedir,"tree.svg")
    f = open(svgfile, "w")
    #args.e.write('\nw_display\n')
    #   nw_display -R 40 -s -v 20 -i 'opacity:0' -b 'visibility:hidden' -l 'font-family:san-serif' -w 1000 -W 6 tree.reroot.order.tre > ParB.svg
    #cmdls = [os.path.join(args.condabin,'nw_display'),'-b','visibility:hidden','-l','font-family:san-serif','-R','80','-s','-v','40','-w','1000','-W','5',rerootfile,'>',svgfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    cmdls = [os.path.join(args.condabin,'nw_display'),'-b','visibility:hidden','-R','80','-s','-v','40','-w','1200','-W','10',rerootfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    
    cmd = ' '.join(cmdls)
    print('nw_display:',cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()

def run_sed():
    #sed -f leaflabels.sed tree.svg > tree.relabel.tre
    renamefile = os.path.join(args.sourcedir,"tree.relabel.svg")
    svgfile = os.path.join(args.sourcedir,"tree.svg")
    f = open(renamefile, "w")
    #args.e.write('\nw_display\n')
    #   nw_display -R 40 -s -v 20 -i 'opacity:0' -b 'visibility:hidden' -l 'font-family:san-serif' -w 1000 -W 6 tree.reroot.order.tre > ParB.svg
    #cmdls = [os.path.join(args.condabin,'nw_display'),'-b','visibility:hidden','-l','font-family:san-serif','-R','80','-s','-v','40','-w','1000','-W','5',rerootfile,'>',svgfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    cmdls = ['sed','-f', args.leaflabels, svgfile]  #newickfile+'|nw_order','-c','n','-','>',rerootfile]
    
    cmd = ' '.join(cmdls)
    print('sed:',cmd)
    subprocess.run(cmdls, stdout=f, stderr=args.e)
    f.close()
    
if __name__ == "__main__":

    usage = """
    USAGE:
        Used in HOMD code in routes/index.js
        
        -id/--directory   --- Full Path Input Directory () [REQUIRED]
        -mp/--muscle_path --- Full Path to muscle (including executable) (NOT USED Use -c conda bin only)
        -ftp/--fasttree_path --- Full Path to fasttree (NOT USED Use -c conda bin only)
        -c/--condabin  -- path to conda/bin contains: newick_utils,fasttree,mafft,muscle [REQUIRED On HOMD]
        -p/--protein NOT USED (for fasttree)
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
    parser.add_argument("-p", "--protein",   required=False,  action="store_true",    dest = "protein", default=False,
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
    errorfile = os.path.join(args.sourcedir,"err.txt")
    
    args.e = open(errorfile, "w")
    run_unalingned(args)
    run_mafft()
    #run_muscle()   # fasta     -> alignment
    run_fasttree() # alignment -> newick
    run_nw_utils() # newick    -> tree.svg
    run_sed()
    args.e.close()
    
    
    
    #run_alingnment(args)
    #run_newick(args)
    #run_tree1(args)
    print('PyScript Finished')
    