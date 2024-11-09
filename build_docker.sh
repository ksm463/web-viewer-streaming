#!/bin/bash

IMAGE_NAME="hub.inbic.duckdns.org/ai-dev/web-viewer-streaming"
TAG="0.1"

docker build --no-cache -t ${IMAGE_NAME}:${TAG} .