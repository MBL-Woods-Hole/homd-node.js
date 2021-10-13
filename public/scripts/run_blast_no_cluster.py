#!/usr/bin/env python

import os,sys
import argparse
import datetime

print('#Hello from python#')
print('First param:'+sys.argv[1]+'#')
print('Second param:'+sys.argv[2]+'#')

def run(args):
  print('running')

if __name__ == '__main__':
    import argparse


    myusage = """usage: run_blast_no_cluster.py  [options]

         where

           -pid/--project_id        clean this pid only
           -p/--project_name        clean this name only
           -site/--site             vamps, vampsdev or localhost
           -all/--all               Remove ALL Data for fresh install
                                    Be Careful -- will remove ALL data from db


    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)


    parser.add_argument("-i","--infile",
                required=True,  action="store",   dest = "infile",
                help="""ProjectID""")

    parser.add_argument("-p", "--project",
                required=True,  action='store', dest = "project",
                help=" ")
    parser.add_argument("-d", "--project_dir",
                required=True,  action='store', dest = "project_dir",
                help=" ")
    # parser.add_argument("-host", "--host",
#                 required=True,  action='store', dest = "host", default='localhost',
#                 help=" ")
    parser.add_argument("-t", "--type",
                required=True,  action='store', dest = "type",
                help=" ")

    parser.add_argument("-u", "--user",
                required=True,  action='store', dest = "owner",
                help=" ")
    parser.add_argument("-sep", "--separator",
                required=False,  action='store', dest = "separator", default='space',
                help=" ")
    parser.add_argument("-v", "--verbose",
               required=False,  action="store_true",   dest = "verbose", default=False,
               help="""JSON Files Directory""")
#     parser.add_argument("-data_dir", "--data_dir",
#                 required=True,  action='store', dest = "data_dir", default='user_data',
#                 help=" config.USER_FILES_BASE ")

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
    
    run(args) 
    print('Finished')
