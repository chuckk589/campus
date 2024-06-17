#!/bin/bash
read -e -p "new ip: " ip
#find local ip
local_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' campus-adminer-1)
#find rule by comment 
rule=$(ufw status numbered | grep adminer | awk -F'[][]' '{print $2}')
#if rule not null
if [ -n "$rule" ]; then
    #force delete old rule
    ufw --force delete $rule
fi
#add new rule
ufw route allow proto tcp from $ip to $local_ip port 8081 comment 'adminer'