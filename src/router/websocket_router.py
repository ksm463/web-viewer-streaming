from fastapi import APIRouter, WebSocket, Query

from service import stream_video
from data import sessions


websocket_router = APIRouter()

@websocket_router.websocket("/ws/video")
async def video_endpoint(websocket: WebSocket, rtsp_address: str = Query(None)):
    await websocket.accept()
    if rtsp_address:
        print(f"RTSP 주소: {rtsp_address}")
        await stream_video(websocket, rtsp_address)
    else:
        print("RTSP 주소가 제공되지 않았습니다.")
        await websocket.close()
