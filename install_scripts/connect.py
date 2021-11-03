import sys, os
try:
    import mysqlclient as mysql
except ImportError:
    try:
        import pymysql as mysql
    except ImportError:
        import MySQLdb as mysql

def is_local():
    #print(os.uname()[1])
    dev_comps = ['avoorhis.mbl.edu', "MacBook-Air.local"]
    if os.uname()[1] in dev_comps:
        return True
    else:
        return False
        
class MyConnection:
    """
    Takes parameters from ~/.my.cnf, default host = "localhost", db="test"
    if different use my_conn = MyConnection(host, db)
    """

    def __init__(self, host = "localhost", db="test", read_default_file = ""):
        # , read_default_file=os.path.expanduser("~/.my.cnf"), port = 3306

        self.conn = None
        self.cursor = None
        self.cursorD = None
        self.rows = 0
        self.new_id = None
        self.lastrowid = None

        port_env = 3306
        try:
            #print("host = " + str(host) + ", db = "+str(db))
            #print("=" * 40)
            read_default_file = os.path.expanduser("~/.my.cnf_node")

            if is_local():
                host = "127.0.0.1"
                read_default_file = "~/.my.cnf_node"
            self.conn = mysql.connect(host = host, db = db, read_default_file = read_default_file, port = port_env)
            self.cursor = self.conn.cursor()
            self.cursorD = self.conn.cursor(mysql.cursors.DictCursor)

        except (AttributeError, mysql.OperationalError):
            self.conn = mysql.connect(host = host, db = db, read_default_file = read_default_file, port = port_env)
            self.cursor = self.conn.cursor()
        except mysql.Error:
            e = sys.exc_info()[1]
            print("Error %d: %s" % (e.args[0], e.args[1]))
            raise
        except:  # catch everything
            print("Unexpected:")
            print(sys.exc_info()[0])
            raise  # re-throw caught exception

    @staticmethod
    def connect(host, db, read_default_file, port_env):
        print('host ',host,' db ',db)
        return mysql.connect(host = host, db = db, read_default_file = read_default_file, port = port_env)
    
    def execute_fetch_one(self, sql):
        if self.cursor:
            try:
                self.cursor.execute(sql)
                self.conn.commit()
                return self.cursor.fetchone()
            except:
                print("ERROR: query = %s" % sql)
                raise
                
    def execute_fetch_select(self, sql):
        if self.cursor:
            try:
                self.cursor.execute(sql)
                self.conn.commit()
                return self.cursor.fetchall()
            except:
                print("ERROR: query = %s" % sql)
                raise

    def execute_no_fetch(self, sql):
        if self.cursor:
            self.cursor.execute(sql)
            self.conn.commit()
            try:
                return self.cursor._result.message
            except:
                return self.cursor._info

    def execute_fetch_select_dict(self, sql):
        if self.cursorD:
            try:
                self.cursorD.execute(sql)
                self.conn.commit()
                return self.cursorD.fetchall()
            except:
                print("ERROR: query = %s" % sql)
                raise