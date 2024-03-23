#!/bin/bash
docker events --filter container=campus-app-1 --format '{{.Status}}' |
while read line;
do
    if [[ ${line} = "start" ]];
    then
        ufw-docker allow campus-app-1 80;
    fi ;
done