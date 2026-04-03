import sys
from init_screen import CTmpTable

if __name__ == "__main__":    
    try:
        pth = r"%s" % sys.argv[1]        
    except Exception as err:        
        pth =  r"localhost/3054:C:\Волковыск Магазин\VOLKOVISK_CASH.GDB"
    
    tblPreOrder = CTmpTable(pth,"USR_HTMLSCRN_PREORDER")
    if tblPreOrder.connect():
      tblPreOrder.createPreorder()
      tblPreOrder.connection.close()