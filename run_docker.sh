#!/bin/bash

port_num="5"
CONTAINER_NAME="ksm-web-viewer-streaming"
IMAGE_NAME="hub.inbic.duckdns.org/ai-dev/video-converter-uiux"
TAG="0.1"

fastapiUiUx_path=$(pwd)


docker run \
    --runtime nvidia \
    --gpus all \
    -it \
    -p ${port_num}8000:8000 \
    -p ${port_num}8888:8888 \
    -p ${port_num}8444:8444 \
    -p ${port_num}8555:8555 \
    -p ${port_num}9000:9000 \
    --name ${CONTAINER_NAME} \
    --privileged \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v /home/ubuntu/sungmin/web-viewer-streaming/volume:/web-viewer-streaming/volume \
    -v ${fastapiUiUx_path}:/web-viewer-streaming \
    -e DISPLAY=$DISPLAY \
    --shm-size 20g \
    --restart=always \
    -w /web-viewer-streaming \
    ${IMAGE_NAME}:${TAG}
