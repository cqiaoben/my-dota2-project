#!/bin/bash

docker build --no-cache -t gcr.io/cs193s-cqiaoben-3-20/salt:$1 -f test_salt.docker .
gcloud docker -- push gcr.io/cs193s-cqiaoben-3-20/salt:$1

rm -f temp.yaml

FILE=$(cat test_rs.yaml)
FILE1=${FILE/\$1/$1}
echo "$FILE1" > temp.yaml
kubectl --context=federation create -f ./temp.yaml

