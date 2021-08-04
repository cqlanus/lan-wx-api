#!/usr/bin/env bash

kubectl delete -f k3s/db-job.yaml

HASH=`git rev-parse --short HEAD`
echo $HASH

docker buildx build \
    --platform linux/arm/v7 \
    --push \
    -t cqlanus/lan-wx-db:$HASH \
    -t cqlanus/lan-wx-db:latest \
    -f Dockerfile.dbjob .

# kubectl set image job/lan-wx-db-job lan-wx-db-job=cqlanus/lan-wx-db:$HASH -n lan-wx

kubectl apply -f k3s/db-job.yaml

