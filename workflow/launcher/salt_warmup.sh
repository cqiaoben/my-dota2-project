#!/bin/bash

kubectl annotate --context=federation deployments salt --overwrite "federation.kubernetes.io/deployment-preferences"='{
            "rebalance": false,
            "clusters": {
                "cluster-asia-east1-a": {
                    "minReplicas": 1,
                    "maxReplicas": 1,
                    "weight": 1
                },
                "cluster-europe-west1-b": {
                    "minReplicas": 0,
                    "maxReplicas": 0,
                    "weight": 1
                },
                "cluster-us-east1-b": {
                    "minReplicas": 0,
                    "maxReplicas": 0,
                    "weight": 1
                }
            }
        }'
