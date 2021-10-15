#!/usr/bin/env python

import os,sys
import argparse
import datetime
import configparser
import subprocess

myusage = """
   to be run from homd-node.js  

"""
parser = argparse.ArgumentParser(description="", usage=myusage)
# parser.add_argument("-t", '--datatype', required=False, action="store",   dest = "datatype", default=None) 
# parser.add_argument("-d", '--directory',required=False, action="store",   dest = "datadir", default=None) 
# parser.add_argument("-text", '--text',   required=False, action="store",   dest = "textstring", default=None)
# parser.add_argument("-f", '--filepath', required=False, action="store",   dest = "filepath", default=None)
# parser.add_argument("-db", '--blastdbpath', required=False, action="store",   dest = "blastdb", default=None)
# parser.add_argument("-a", '--advancedopts', required=False, action="store",   dest = "advancedopts", default=None)
# parser.add_argument("-n", '--resultsreturned', required=False, action="store",   dest = "resret", default=None)
# parser.add_argument("-p", '--blastprogram', required=False, action="store",   dest = "blastprogram", default=None)
# parser.add_argument("-e", '--expect', required=False, action="store",   dest = "expect", default=None)

parser.add_argument("-c", '--config', required=False, action="store",   dest = "config", default=None)



args = parser.parse_args()  

print('Hello from python script: '+args.config+'<br>')

print(sys.argv)
for n in sys.argv:
  print(n)


config = configparser.RawConfigParser()   

config.read(args.config)
details_dict = dict(config.items('MAIN'))
print(details_dict)

def processFile(args, details_dict):
    files = []
    with open(details_dict['filepath']) as infile:
    
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
            fastaFilePath = os.path.join(details_dict['blastdir'], fileName)
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
    print('<br>in process')
    
    textInput = (details_dict['textinput']).strip().strip('"')
    
    files = []
    if textInput[0] == '>':
        # one or more seqs
        lines_split = textInput.split('\n')
        
        seqcount = 0
        count = 0
        lastLine = False
        print()
        for line in lines_split:
            line = line.strip()
            print('line',line)
            if not line:
                continue
            
            if count == len(lines_split)-1 :
                lastLine = True
           
            if line[0] == '>':
                fileName = 'blast'+ str(seqcount)+'.fa'
                fastaFilePath = os.path.join(details_dict['blastdir'], fileName)
                files.append(fileName)
                
                entry = line.strip() + '\n'
                
                seqcount += 1
            else:
                entry += line.strip()
            
            if lastLine or (count > 0  and lines_split[count+1][0] == '>'):
                write_file(fastaFilePath, entry) 
        
            count += 1
        
    else:
        print('<br>in process single')
        # single naked sequence
        fileName = 'blast0.fa'
        fileNamePath = os.path.join(details_dict['blastdir'], fileName)
        files.append(fileName)
        write_file(fileNamePath, '>1\n'+textInput+'\n')
        
    
    return files

def batchBlastFile(args, filesArray, details_dict):
    fileText ='#!/bin/bash\n\n'
    
    for file in filesArray:
        fileText += details_dict['program']
        
        if details_dict['site'] == 'localhome':
            fileText += ' -db /Users/avoorhis/programming/blast_db/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
        elif details_dict['site'] == 'MBL':
            fileText += ' -db /Users/avoorhis/programming/blast/Bv6/Bv6'
        else:   # HOMD
            fileText += ' -db ' + details_dict['blastdbpath']
        fileText += ' -evalue ' + details_dict['expect']
        fileText += ' -max_target_seqs ' + details_dict['numresults']
   
        fileText += ' -query ' + os.path.join(details_dict['blastdir'],file)
        fileText += ' -outfmt 15'   ##JSON
        fileText += ' -out ' +  os.path.join(details_dict['blastdir'],'results', file+'.out') 
        fileText += " 1>/dev/null 2>>" + details_dict['blastdir'] + "/error.log;"
        fileText += '\n'
    
    return fileText
    
# def run(args):
#   print('running')
  
  
# filepath takes presidence over text
if details_dict['filepath']:
   # read line by line and write into separate files
   filesArray = processFile(args,details_dict)
elif details_dict['textinput']:
   #text may be LARGE
   print('<br>Got Text')
   # separate into separate sequences (may be just one)
   filesArray = processTextIntoFiles(args,details_dict)
   # write into separate files
else:
   print('Could not find file or text - must exit')
   sys.exit('Could not find file or text - must exit')  

# write batch blast shell script then run it
print()
# for file in filesArray:
#     print('<br>',file)
outDir = os.path.join(details_dict['blastdir'],'results')
try:
    os.makedirs(outDir)
except FileExistsError:
    pass

batchText = batchBlastFile(args, filesArray, details_dict)
batchFileName = 'blast.sh'
batchFileNamePath = os.path.join(details_dict['blastdir'],'blast.sh')
write_file(batchFileNamePath, batchText)
os.chmod(batchFileNamePath, 0o775)   # make executable
return_code = subprocess.run(batchFileNamePath)
print("<br<br>Output of run() : ", return_code)
#os.system(batchFileNamePath)



if __name__ == '__main__':
    import argparse


    myusage = """usage: run_blast_no_cluster.py  [options]

         where

parser.add_argument("-c", '--config', required=False, action="store",   dest = "config", default=None)


    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)


#     parser.add_argument("-t","--datatype",
#                 required=False,  action="store",   dest = "datatype", default=None,
#                 help="")
# 
#     parser.add_argument("-d", "--directory",
#                 required=False,  action='store', dest = "datadir", default=None,
#                 help=" ")
#     parser.add_argument("-text", "--text",
#                 required=False,  action='store', dest = "textstring", default=None,
#                 help=" ")
#     parser.add_argument("-f", "--filepath",
#                  required=False,  action='store', dest = "host",  default=None,
#                  help=" ")
#     parser.add_argument("-db", "--blastdbpath",
#                 required=False,  action='store', dest = "blastdb", default=None,
#                 help=" ")
#     parser.add_argument("-a", "--advancedopts",
#                 required=False,  action='store', dest = "advancedopts", default=None,
#                 help=" ")
#     parser.add_argument("-n", "--numresults",
#                 required=False,  action='store', dest = "numresults", default=None,
#                 help=" ")
#     parser.add_argument("-p", "--blastprogram",
#                required=False,  action="store",   dest = "blastprogram", default=None,
#                help="")
#     parser.add_argument("-e", "--expect",
#                 required=True,  action='store', dest = "expect", default=None,
#                 help=" ")
    parser.add_argument("-c", "--config",
                required=True,  action='store', dest = "config", default=None,
                help=" ")
    args = parser.parse_args()


   #  if args.host == 'vamps':
#         #db_host = 'vampsdb'
#         db_host = 'bpcweb8'
#         args.NODE_DATABASE = 'vamps2'
#         db_home = '/groups/vampsweb/vamps/'
#     elif args.host == 'vampsdev':
#         #db_host = 'vampsdev'
#         db_host = 'bpcweb7'
#         args.NODE_DATABASE = 'vamps2'
#         db_home = '/groups/vampsweb/vampsdev/'
#     else:
#         db_host = 'localhost'
#         db_home = '~/'
#         args.NODE_DATABASE = 'vamps_development'
#
#     args.obj = MySQLdb.connect( host=db_host, db=args.NODE_DATABASE, read_default_file=os.path.expanduser("~/.my.cnf_node")    )
#
#     #db = MySQLdb.connect(host="localhost", # your host, usually localhost
#     #                         read_default_file="~/.my.cnf"  )
#     args.cur = args.obj.cursor()


    
    #(args.proj, args.pid, args.dids, args.dsets) = get_data(args)  
    
    #run(args) 
    print('Finished')
