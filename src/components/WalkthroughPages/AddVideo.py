import sys
import shutil
print(sys.argv)
url = sys.argv[1]
name = sys.argv[2]
filename = f"{name}.tsx"
search_URL = "[URL]"
search_NAME = "[NAME]"
serach_EXPORT = "'[EXPORT]'"


with open("WalkthroughSamplePage.txt",'r') as file:
    data = file.read()
    data = data.replace(search_URL,url)
    data = data.replace(search_NAME,name)
    data = data.replace(serach_EXPORT,name)
    
with open(filename,'w') as file:
    file.write(data)
