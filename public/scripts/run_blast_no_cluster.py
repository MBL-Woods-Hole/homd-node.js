#!/usr/bin/env python

import os,sys
import argparse
import datetime
import json
import subprocess
import re

myusage = """
   to be run from homd-node.js  

"""
parser = argparse.ArgumentParser(description="", usage=myusage)

parser.add_argument("-c", '--config', required=False, action="store",   dest = "config", default=None)
parser.add_argument("-v", '--verbose', required=False, action="store_true",   dest = "verbose", default=False)



args = parser.parse_args()  

print('[PYSCRIPT]::Hello from pyscript: '+args.config+'<br>')
print('[PYSCRIPT]::Command:')
for n in sys.argv:
    print(n,end=' ')

f = open(args.config)

details_dict = json.load(f)

"""
 agtcgtactgggatctgaa
  
  >ds0|imput 1200
  agtcgtactggtaccggatctgaa
  >ds1|kefdgste5%$
  agtcgtactgggatctgaagtagaatccgt
  >ds2| let kefdgste5%$
  agtcgtactgggat
  ctgaagtagaatccatccgt
  
  >PC_634_1_FLP3FBN01ELBSX_orig_bc_ACAGAGT
CTGGGCCGTCTCAGTCCCAATGTGGCCGTACCCTCTGGCCGGCTACGTCATCGCCTTGGTGGGCCGTT
>PC_634_2_FLP3FBN01EG8AX_orig_bc_ACAGAGT
TTGGACCGTGTCTCAGTTCCAATGTGGGGGCCTTCCTCTCAGAACCCCTATCCATCGAAGGCTTGGTGGGCCGTTA
>PC_354_3_FLP3FBN01EEWKD_orig_bc_AGCACGA
TTGGGCCGTGTCTATGTGGCCGATCAGTCTCTTGGCTATGCATCATTGCCTTGGTAAGCCGTT
>PC_481_4_FLP3FBN01DEHK3_orig_bc_ACCAGCG
CTGGGCCGTGTCTCTCCCAATGTGGCCGTTCAACCTCTCAGTCCGGCTACTGATCGACTTGGTGAGCCGTT


"""

    

def processFile(args, details_dict):
    files = []
    if args.verbose:
      print('processing',details_dict['filePath'])
    with open(details_dict['filePath']) as infile:
    
      seqcount = 0
      count = 0
      entry = ''
      writePreviousFile = False
      for line in infile:
        line = line.strip()
        if not line:
            continue
        if line.startswith('>'):
            writePreviousFile = True
            if count > 0:
                write_file(fastaFilePath, entry)
            fileName = 'blast'+ str(seqcount)+'.fa'
            fastaFilePath = os.path.join(details_dict['blastDir'], fileName)
            files.append(fileName)
            
            entry = line.strip()+'\n'
            seqcount +=1
        else:
            entry += line.strip()
            writePreviousFile = False
            
        count +=1
    #print the last file
    write_file(fastaFilePath, entry) 
    return files
    
def write_file(path, data):
    f = open(path, "w")
    f.write(data+'\n')
    f.close() 

def processTextIntoFiles(args, details_dict):
    if args.verbose:
        print('<br>in processTextIntoFiles')
    
    textInput = (details_dict['textInput']).strip().strip('"')
    
    files = []
    if textInput[0] == '>':
        # one or more seqs
        lines_split = textInput.split('\n')
        lines_split = [n for n in lines_split if n.strip()] ## get rid of empty lines 
        
        seqcount = 0
        count = 0
        lastLine = False
        if args.verbose:
            print()
        for line in lines_split:
            line = line.strip()
            if args.verbose:
                print('line',line)
            if not line:
                continue
            
            if count == len(lines_split)-1 :
                lastLine = True
                if args.verbose:
                    print('found lastline',line)
           
            if line[0] == '>':
                fileName = 'blast'+ str(seqcount)+'.fa'
                fastaFilePath = os.path.join(details_dict['blastDir'], fileName)
                files.append(fileName)
                
                entry = line.strip() + '\n'
                
                seqcount += 1
            else:
                t = line.strip().upper()
                if validate(t):
                    entry += t
                else:
                    sys.exit('ERROR--Found invalid characters in string. Only IUPAC letters allowed.')
            if lastLine or (count > 0  and lines_split[count+1].strip()[0] == '>'):
                if args.verbose:
                  print('\nwriting',fastaFilePath)
                write_file(fastaFilePath, entry) 
        
            count += 1
        
    else:
        if args.verbose:
            print('<br>in process single')
        textInput = textInput.upper()
        if validate(textInput):
            # single naked sequence
            fileName = 'blast0.fa'
            fileNamePath = os.path.join(details_dict['blastDir'], fileName)
            files.append(fileName)
            write_file(fileNamePath, '>1\n'+textInput+'\n')
        else:
           sys.exit('ERROR--Found invalid characters in string. Only IUPAC letters allowed.')
        
    return files
    
def validate(string):
    ## this should cover proteins AND genomes
    re2 =  re.compile(r"^[ATCGUKSYMWRBDHVN]*$")
    #patt = /[^ATCGUKSYMWRBDHVN]/i   // These are the IUPAC letters
    if re2.search(string):
        return True
    else:
        return False


def batchBlastFile(args, filesArray, details_dict):
    fileText ='#!/bin/bash\n\n'
    
    for file in filesArray:
        fileText += details_dict['program']
        
        if details_dict['site'] == 'localhome':
            fileText += ' -db /Users/avoorhis/programming/blast_db/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
        elif details_dict['site'] == 'localmbl':
            fileText += ' -db /Users/avoorhis/programming/blast-db-testing/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
            ##fileText += ' -db /Users/avoorhis/programming/blast-db-testing/B6/B6'
        else:   # HOMD Default
            fileText += ' -db ' + os.path.join(details_dict['blastdbPath'], details_dict['blastdb'])
        
        fileText += ' -evalue ' + details_dict['expect']
        fileText += ' -query ' + os.path.join(details_dict['blastDir'],file)
        # either:
        #fileText += ' -num_alignments ' + details_dict['alignments']   # not compaable w/ max_target_seqs
        #fileText += ' -num_descriptions ' + details_dict['descriptions']   # not compaable w/ max_target_seqs
        # or:
        fileText += ' -max_target_seqs ' + details_dict['maxTargetSeqs']  # use if outfmt >4
        fileText += ' -outfmt 15'   ## 15 JSON
        #fileText += ' -html'   ## dont use this
        fileText += ' -out ' +  os.path.join(details_dict['blastDir'],'blast_results', file+'.out') 
        fileText += " 1>/dev/null 2>>" + details_dict['blastDir'] + "/error.log;"
        fileText += '\n'
    
    return fileText
    
#   For error testing:
#sys.exit('ERROR--Test error handling from pyscript') 
  
# filepath takes presidence over text
if details_dict['filePath']:
   # read line by line and write into separate files
   filesArray = processFile(args, details_dict)
elif details_dict['textInput']:
   #text may be LARGE
   # separate into separate sequences (may be just one)
   filesArray = processTextIntoFiles(args, details_dict)
   # write into separate files
else:
   print('Could not find file or text - must exit')
   sys.exit('Could not find file or text - must exit')  


outDir = os.path.join(details_dict['blastDir'],'blast_results')

batchText = batchBlastFile(args, filesArray, details_dict)
batchFileName = 'blast.sh'
batchFileNamePath = os.path.join(details_dict['blastDir'],'blast.sh')
write_file(batchFileNamePath, batchText)
os.chmod(batchFileNamePath, 0o775)   # make executable
return_code = subprocess.run(batchFileNamePath)
print("<br<br>Output of run() : ", return_code)
#os.system(batchFileNamePath)

## Important Last Line
print('SEQCOUNT=',len(filesArray), sep = '')

#################

if __name__ == '__main__':
    import argparse


    myusage = """usage: run_blast_no_cluster.py  [options]

         where

parser.add_argument("-c", '--config', required=False, action="store",   dest = "config", default=None)

run_blast_no_cluster.py -c ./config.json

    """
   


    args.runByHand = True
    f = open(args.config)
    details_dict = json.load(f)
    #print(details_dict)
    # filepath takes presidence over text
    if details_dict['filePath']:
       # read line by line and write into separate files
       filesArray = processFile(args,details_dict)
    elif details_dict['textInput']:
       #text may be LARGE
       # separate into separate sequences (may be just one)
       filesArray = processTextIntoFiles(args, details_dict)
       # write into separate files
    else:
       print('Could not find file or text - must exit')
       sys.exit('Could not find file or text - must exit')  
    
    #run(args) 
