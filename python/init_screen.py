import os
import sys
import json
from collections import namedtuple
from fireberd import FireberdPython




class CScreenCustomer(FireberdPython):
    def __init__(self,path:str, keyToconvert : dict = {}):
        super().__init__(path,keyToconvert)    
    
    def loadBackground(self):
        try:
            select =  '''select z.usr$photo as PHOTO 
                        from gd_ourcompany z  
                        JOIN gd_contact c ON c.id = z.companykey  
                        JOIN gd_company cmp on cmp.contactkey = z.companykey  
                    '''
            self.connection.begin()
            self.cursor.execute(select)
            blob_data = self.cursor.fetchone()[0]
            pth = os.path.join(self.createfolder(("images","background")),"background.jpg")
            with open(pth,"wb") as f:
                f.write(blob_data.read())

        except Exception as err:
            print(err)
            self.connection.close()            
    
    def loadReklama(self):
        try:
           select =  '''select html.id, html.USR$PHOTO
                        from USR$HTML_SLIDER html
                        where coalesce(html.USR$DISABLED,0) = 0 '''
           self.connection.begin()
           pth = self.createfolder(("images","reklama"))
           for (file_name,img) in self.cursor.execute(select):
               with open( os.path.join(pth,f'{file_name}.jpg'),"wb") as f:
                   f.write(img.read())
        except Exception as err:
            print(err)


class CTmpTable(FireberdPython):
    def __init__(self,path:str, TblName : str = 'USR$TEMP_PREORDER' ):
        super().__init__(path)
        self.TblName = TblName
    
    def createTablePreOrder(self):        
        ''' создаем таблицы USR$TEMP_PREORDER '''        
        if not self.isExists(self.TblName):            
            try:                
                self.cursor.execute('''
                                create Table USR$TEMP_PREORDER (
                                    ID INT not null PRIMARY KEY, 
                                    USR$quantity DECIMAL(15,4),
                                    RUID_ML INT,
                                    USR$PRICESALE DECIMAL(15,4),
                                    USR$SUMWITHDISCOUNT DECIMAL(15,4),
                                    USR$SUMDISCOUNT DECIMAL(15,4),
                                    ActiveLine smallint
                                    )
                        ''')                
                self.connection.commit()
            except Exception as err:
                print(err)
                return False
        return True
    
    def createPreorder(self):
        pth = self.createfolder(("images","menu_name"))
        select = '''
                select
                p.ID,USR$quantity,RUID_ML,USR$PRICESALE,
                USR$SUMWITHDISCOUNT,USR$SUMDISCOUNT, ActiveLine,g.name, g.usr$photo
                from USR$TEMP_PREORDER p
                join gd_good g on g.id = p.ruid_ml
                '''
        self.connection.begin()
        arr = dict()
        for  (ID,count,RUID_ML,PRICESALE,SUMWITHDISCOUNT,SUMDISCOUNT,ActiveLine,name,img) in self.cursor.execute(select):
            img_pth = None
            if not img == None:
                with open( os.path.join(pth,f'{RUID_ML}.jpeg'),"wb") as f:
                   f.write(img.read())
                   img_pth = os.path.join(pth,f'{RUID_ML}.jpeg')
            arr[ID] = {
                "count":count,
                "dataRow":{key:value for key,value in zip(("RUID_ML","Цена","Сумма со скидкой","Сумма скидки","Active","Изделие","PHOTO"),
                                                          (RUID_ML,PRICESALE,SUMWITHDISCOUNT,SUMDISCOUNT,ActiveLine,name,img_pth))}
            }
        pth = os.path.join(self.createfolder(("source","pre_order")),"pre_order.json")
        if len(arr):
            
            with open(pth,"wt") as f:
                f.write(json.dumps(arr,default=str))
        else:
            if os.path.exists(pth):
                os.remove(pth)
            

import re as RegNum
#pattern = RegNum.compile("(?P<RUID>(\d+_\d+))\bcount(?P<count>(\d+.*\d*))\bцена(?P<price>)")   


if __name__ == "__main__":    
    try:
        pth = r"%s" % sys.argv[1]        
    except Exception as err:        
        pth =  r"localhost/3054:C:\Волковыск Магазин\VOLKOVISK_CASH.GDB"
    
    fb_ptn = CScreenCustomer(pth)            
    if fb_ptn.connect():        
        fb_ptn.createfolder(("cmd",))
        fb_ptn.loadBackground()
        fb_ptn.loadReklama()
        tblPreOrder = CTmpTable(pth,"USR$TEMP_PREORDER")
        if tblPreOrder.connect():
            tblPreOrder.createTablePreOrder()
            tblPreOrder.connection.close()
        fb_ptn.connection.close()
