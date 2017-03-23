#!/bin/bash

kubectl config use-context gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id

kubectl create -f yamlfile/sql_service.yaml
kubectl create -f yamlfile/backup_service.yaml
kubectl create -f yamlfile/salt_service.yaml
bash launcher/database $1
bash launcher/api_backup $1 db salt.default.federation.svc.cqiaoben.com
bash launcher/api_hitter $1 backup db salt.default.federation.svc.cqiaoben.com
