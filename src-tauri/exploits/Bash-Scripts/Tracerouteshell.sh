#!/bin/bash
hostName="$1"
option=$2

#Traceroute bash script used on Traceroute.tsx
Traceroute(){
    sudo traceroute $option $hostName
    
}

Traceroute

