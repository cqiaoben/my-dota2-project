#!/bin/bash

kubectl create -f yamlfile/sql_service.yaml
kubectl create -f yamlfile/backup_service.yaml
bash launcher/database $1
bash launcher/api_backup $1 db
bash launcher/api_hitter $1 backup db
