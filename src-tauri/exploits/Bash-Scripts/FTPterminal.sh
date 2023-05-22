#!/bin/bash
#Output=/home/kali/Desktop/TestFile.txt
HostnameIPaddress=$1

FTPterminal(){
    qterminal -e ftp $HostnameIPaddress
}

FTPterminal