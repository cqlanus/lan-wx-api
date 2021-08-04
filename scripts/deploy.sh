#!/usr/bin/env bash

HASH=`git rev-parse --short HEAD`
echo $HASH

docker buildx build \
    --platform linux/arm/v7 \
    --push \
    -t cqlanus/lan-wx-api:$HASH \
    -t cqlanus/lan-wx-api:latest .

kubectl set image deployment/lan-wx-api lan-wx-api=cqlanus/lan-wx-api:$HASH -n lan-wx


