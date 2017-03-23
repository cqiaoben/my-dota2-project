#!/bin/bash

kubectl --context=gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id delete deployments api-hitter
kubectl --context=gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id delete deployments db
kubectl --context=gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id delete deployments backup-api-hitter
kubectl --context=gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id delete svc backup
kubectl --context=gke_cs193s-cqiaoben-3-20_us-central1-a_get-match-id delete svc db
