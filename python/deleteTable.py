from fireberd import FireberdPython
import sys

if __name__ == "__main__":
    TblName = ''    
    try:
        pth = r"%s" % sys.argv[1]
        TblName = r"%s" % sys.argv[2]
    except Exception as err:        
        pth =  r"localhost/3054:C:/VolkvRestaurant/VolkRestaurant.GDB"
    TblName = ("USR$TEMP_PREORDERLINES","USR$TEMP_PREORDER")
    
    fb_ptn = FireberdPython(pth)
    if fb_ptn.connect() and len(TblName):        
        for TblName in ("USR$TEMP_PREORDERLINES","USR$TEMP_PREORDER"):
          fb_ptn.delteTbl(TblName)
