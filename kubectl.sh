#!/bin/bash

cp ~/.kube/config config

docker build --no-cache -t gcr.io/cs193s-cqiaoben-3-20/kubectl:$1 -f kubectl.docker .
gcloud docker -- push gcr.io/cs193s-cqiaoben-3-20/kubectl:$1

rm -f config

