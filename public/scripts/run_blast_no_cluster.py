#!/usr/bin/env python

import os,sys
import argparse
import datetime
import json
import subprocess
import re, glob

myusage = """
   to be run from homd-node.js  

"""
parser = argparse.ArgumentParser(description="", usage=myusage)

parser.add_argument("-c", '--config', required=False, action="store",   dest = "config", default=None)
parser.add_argument("-v", '--verbose', required=False, action="store_true",   dest = "verbose", default=False)

minLength = 10


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
    
      seqcounter = 0
      count = 0
      entry = ''
      writePreviousFile = False
      for line in infile:
        line = line.strip()
        if not line:
            continue
        if count == 0 and not line.startswith('>'):
            sys.exit('File is not FASTA format') 
        
        if line.startswith('>'):
            writePreviousFile = True
            if count > 0:
                write_file(fastaFilePath, entry)
            fileName = 'blast'+ str(seqcounter)+'.fa'
            fastaFilePath = os.path.join(details_dict['blastDir'], fileName)
            files.append(fileName)
            
            entry = line.strip()+'\n'
            seqcounter +=1
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

def processText(args, details_dict):
    if args.verbose:
        print('<br>in processText')
    
    textInput = (details_dict['textInput']).strip().strip('"')
    
    files = []
    if textInput[0] == '>':
        # one or more seqs entered
        # if seq is too short or non-IUPAC => toss it
        # how do i tell if they are ALL too short or non-IUPAC??
        lines_split = textInput.split('\n')
        lines_split = [n for n in lines_split if n.strip()] ## get rid of empty lines 
        
        seqcount = len(lines_split)
        seqcounter = 0
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
                fileName = 'blast'+ str(seqcounter)+'.fa'
                fastaFilePath = os.path.join(details_dict['blastDir'], fileName)
                files.append(fileName)
                
                entry = line.strip() + '\n'
                
                seqcounter += 1
            else:
                t = line.strip().upper()
                if validate(details_dict['blastdb'], t):
                    entry += t
                else:
                    sys.exit('Found invalid characters in string. Only IUPAC letters allowed.')
            if lastLine or (count > 0  and lines_split[count+1].strip()[0] == '>'):
                if args.verbose:
                  print('\nwriting',fastaFilePath)
                write_file(fastaFilePath, entry) 
        
            count += 1
        
    else:
        if args.verbose:
            print('<br>in process single')
        if len(textInput) < minLength:
            sys.exit('Sequence is too short. Must be greater than: '+str(minLength))
        ## split/join  to remove any linefeeds
        textInput = ''.join(textInput.upper().splitlines())
        
        if validate(details_dict['blastdb'], textInput):
            # single naked sequence
            fileName = 'blast0.fa'
            fileNamePath = os.path.join(details_dict['blastDir'], fileName)
            files.append(fileName)
            write_file(fileNamePath, '>1\n'+textInput+'\n')
        else:
           sys.exit('Found invalid characters in string. Only IUPAC letters allowed.')
        
    return files
    
def validate(db, string):
    ## Nucleotides
    #string = """MKKTLRIFLSSLSLTALLAGPTIALAESSSSESSASSQESTASSESSTDFKAVAEAIKAATSAKEASVTYTNSTPITFGKAPVTETIHAYSLISLKDFTKDLAFPFGGDTQTGAVLVLDVSLKNDSDKDTYITGGFSGSIVGYNKAVSHNNNLLDEAKDLTKAVVDAKQVLKAKSELRGFVAIAIGGDALKQLNKNGELSFDPLIVLANQGDKITDAIVPTASTILPTSKEGAAKRSAASEFYPDKLTAENWGTKTLISSSTDKQNVKFEGYDVTLNGYQLVDFKPNEDQASRFEKLKGGVVVLTAEITVKNNGKVALNARQTAGNLVFNDQLKLMHEGMVEVEPAKDKEIVEPGQEYTYHLAFVYSKDDYDLYKDRSLTLNVNLYDKDFKSLTKSGDITFQLKK""".upper()
    
    ## https://www.bioinformatics.org/sms/iupac.html
    reNA =  re.compile(r"^[ATCGUKSYMWRBDHVN\.\-]*$")   # NA
    ## Amino Acids
    reAA =  re.compile(r"^[ACDEFGHIKLMNPQRSTVWY]*$")   # AA
    reBOTH = re.compile(r"^[ATCGUKSYMWRBDHVN\.\-DEFILPQY]*$")
    #is_valid = not any(k in strg for k in 'ATCGUKSYMWRBDHVN.-DEFILPQY')
    #print('\nis_valid')
    #print(is_valid)
    print('[PYSCRIPT] db:',db)
    #patt = /[^ATCGUKSYMWRBDHVN]/i   // These are the IUPAC letters
    print('[PYSCRIPT] in db-faa')
    if reBOTH.search(string):
        return True
    else:
        return False

    # if db[0:3] == 'faa':  ## for protein db
#       print('[PYSCRIPT] in db-faa')
#       if reAA.search(string):
#           return True
#       else:
#           return False
#     else:
#       print('[PYSCRIPT] in db-fna')
#       if reNA.search(string):
#           return True
#       else:
#           return False
    


def createBatchBlastFileText(args, filesArray, details_dict):
    fileText ='#!/bin/bash\n\n'
    fileText += 'cd '+ os.path.join(details_dict['blastdbPath'],details_dict['ext']) + '\n\n'
    for file in filesArray:
        fileText += os.path.join(details_dict['programPath'], details_dict['program'])
        
        # if details_dict['site'] == 'localhome':
#             fileText += ' -db /Users/avoorhis/programming/blast_db/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
#         elif details_dict['site'] == 'localmbl':
#             fileText += ' -db /Users/avoorhis/programming/blast-db-testing/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
#             ##fileText += ' -db /Users/avoorhis/programming/blast-db-testing/B6/B6'
#         else:   # HOMD Default
        fileText += ' -db ' + details_dict['blastdb']
        #fileText += ' -db ' + details_dict['blastdb']
        fileText += ' -evalue ' + details_dict['expect']
        fileText += ' -query ' + os.path.join(details_dict['blastDir'],file)
        fileText += ' -max_target_seqs ' + details_dict['maxTargetSeqs']  # use if outfmt >4
        fileText += ' ' + details_dict['advanced']
        if details_dict['blastFxn'] == 'genome':
            #fileText += ' -html'   ## dont use this with other -outfmt
            pass
        else:
            fileText += ' -outfmt 15'   ## 15 JSON
        ##fileText += ' -outfmt 16'   ## 16 XML
        
        fileText += ' -out ' +  os.path.join(details_dict['blastDir'],'blast_results', file+'.out') 
        # blasterror.log will always be created but may be zero length
        # whereas pythonerror.log will only be present if script error
        fileText += " 1>/dev/null 2>>" + details_dict['blastDir'] + "/blasterror.log;"
        fileText += '\n'
    
    return fileText
    
def check_for_db(args, details_dict):
    dbpath = os.path.join(details_dict['blastdbPath'],details_dict['ext'],details_dict['blastdb'] )
    print('checking',dbpath)
    if len(glob.glob(dbpath+'*')) == 0:
        print('Could not find BLAST database - must exit')
        sys.exit('Could not find BLAST database: '+dbpath+'*')  
    
    
    
#   For error testing:
#sys.exit('ERROR--Test error handling from pyscript') 
  
# filepath takes presidence over text
if details_dict['filePath']:
   # read line by line and write into separate files
   filesArray = processFile(args, details_dict)
elif details_dict['textInput']:
   #text may be LARGE
   # separate into separate sequences (may be just one)
   filesArray = processText(args, details_dict)
   # write into separate files
else:
   print('Could not find file or text - must exit')
   sys.exit('Could not find file or text - must exit')  

check_for_db(args, details_dict)

outDir = os.path.join(details_dict['blastDir'],'blast_results')


# if 'ALL_genomes' in details_dict['blastdb']:
#     dbfile = os.path.join(details_dict['blastdbPath'], details_dict['blastdb']+'.00.nhr')
# else:
#     # for genome individual AND 16S
#     dbfile = os.path.join(details_dict['blastdbPath'], details_dict['blastdb']+'.nhr')
# 
# if os.path.isfile(dbfile):
#     batchText = createBatchBlastFileText(args, filesArray, details_dict)
# else:
#     print('Could not find database - must exit')
#     sys.exit('Could not find blast database: '+dbfile)  

batchText = createBatchBlastFileText(args, filesArray, details_dict)
batchFileName = 'blast.sh'
batchFileNamePath = os.path.join(details_dict['blastDir'],'blast.sh')
write_file(batchFileNamePath, batchText)
os.chmod(batchFileNamePath, 0o775)   # make executable
return_code = subprocess.run(batchFileNamePath)
print("\n\nOutput of run() : ", return_code)
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
       filesArray = processText(args, details_dict)
       # write into separate files
    else:
       print('Could not find file or text - must exit')
       sys.exit('Could not find file or text - must exit')  
    
    #run(args) 
