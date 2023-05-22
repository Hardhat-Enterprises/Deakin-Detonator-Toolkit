#!/bin/bash
#Output=/home/kali/Desktop/TestFile.txt
PortNumber=$1

netcatListen(){
    #qterminal -e nc -lvp $PortNumber 1> $Output 2>&1, commented out since its not working at the moment
    qterminal -e nc -lvp $PortNumber
}

netcatListen

#Terminal works, not sure why the output isnt showing
#PortNumber is the portnumber passed from Netcat.tsx file
#Output is a test file where I planned to save the output of the function (not working at the moment)


