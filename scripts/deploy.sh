#!/usr/bin/env bash

docker buildx build \
    --platform linux/amd64,linux/arm/v7 \
    --push \
    -t cqlanus/lan-wx-api:latest .

sudo kubectl apply -f k3s/deploy.yaml

