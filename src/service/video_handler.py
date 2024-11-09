from fastapi import WebSocket, WebSocketDisconnect
import cv2
import asyncio
import base64


async def stream_video(websocket: WebSocket, rtsp_address: str):
    cap = cv2.VideoCapture(rtsp_address)

    if not cap.isOpened():
        print("RTSP 스트림을 열 수 없습니다.")
        await websocket.close()
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("프레임을 읽을 수 없습니다.")
                break

            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue

            frame_data = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(frame_data)

            await asyncio.sleep(1 / 30)

    except WebSocketDisconnect:
        print("WebSocket 연결이 끊어졌습니다.")
    except Exception as e:
        print(f"에러 발생: {e}")
    finally:
        cap.release()
        await websocket.close()