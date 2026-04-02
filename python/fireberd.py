import fdb 
import os

"Установить Для старых версий (Firebird 2.x) или legacy-проектов: pip install fdb"
"Установить Для Firebird 3.0+ и Python 3.8+ (рекомендуемый): pip install firebird-driver "

class FireberdPython():    
    def __init__(self, path : str, keyToconvert : dict = {} ):                
        self.__path = path
        self.__user = "SYSDBA"
        self.__password = "masterkey"        
        self.__connection = None
        self.__cursor = None
        self.convert = {key.upper():value  for key,value in  keyToconvert.items()}  

    @property
    def connection(self):
        return self.__connection
    @connection.setter
    def connection(self,value):
        self.__connection = value
        self.__cursor = self.__connection.cursor()

    @property
    def path(self):
        return self.__path
    @path.setter
    def path(self,value):
        self.__path = value

    @property
    def cursor(self):
        return self.__cursor 
    @cursor.setter
    def cursor(self,value):
        self.__cursor  = value

    def createfolder(self, folders : tuple):
        'создает папки в переданном пути'
        init_path = os.path.join(".")
        for folder in folders:
            init_path = os.path.join(init_path,folder)
            if not os.path.exists(init_path):
                os.mkdir(init_path)
        return init_path    

    def setValueType(self,key,value):
        if self.convert.get(key.upper(),False):
            if not isinstance(value,self.convert[key]):
                try:
                    return self.convert[key](value)
                except Exception as err:
                    return None
        return value    

    def connect(self):        
        try:

            conn = fdb.connect(dsn= self.path.encode("windows-1251"), user= self.__user,password= self.__password)           
            
        #    conn = fdb.connect(dsn= r"localhost/3054:C:/Волковыск Магазин/VOLKOVISK_CASH.GDB".encode("windows-1251"), user= self.__user,password= self.__password)
        #    conn.close()

        #    conn = fdb.connect(dsn= r"localhost/3054:C:\Волковыск Магазин\VOLKOVISK_CASH.GDB".encode("windows-1251"), user= self.__user,password= self.__password)
        #    conn.close()
            self.connection = conn                
            return True
        except Exception as e:
            print(f"Ошибка подключения к базе Firebird: {e}")   
            return False
        
    def isExists(self,Tbl :str):
        try:       
            select = f'''select t.rdb$Relation_name from RDB$RELATIONS t 
                        where t.rdb$Relation_name containing '{Tbl}' ''' 
            
            self.cursor.execute(select) 
            l = self.cursor.fetchall()
            return bool(len(l))
        except Exception as err:
            print(err)
            return False       


class ConvertClass():
    def float(value : str):
        return float(".".join(str(value).split(",")))
