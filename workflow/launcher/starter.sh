#!/bin/bash

kubectl create -f yamlfile/sql_service.yaml
kubectl create -f yamlfile/backup_service.yaml
kubectl create -f yamlfile/salt_service.yaml
bash launcher/database $1
bash launcher/api_backup $1 db salt
bash launcher/api_hitter $1 backup db salt
bash launcher/salt $1 parse
