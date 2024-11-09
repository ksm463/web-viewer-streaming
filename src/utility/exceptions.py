from fastapi import WebSocket
import re
import subprocess
import cv2
import time


def valid_rtsp_address(rtsp_address):
    # pattern = r"^rtsp://([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]+/[0-9]+p/media\.smp$""
    pattern = r"^rtsp://([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?(/[a-zA-Z0-9_.-]+)+$"
    print(f"패턴: {pattern}, 주소: {rtsp_address}")
    return re.match(pattern, rtsp_address)
    
def valid_id_pw(rtsp_address: str) -> bool:
    try:
        cap = cv2.VideoCapture(rtsp_address)
        if not cap.isOpened():
            cap.release()
            return False
        
        start_time = time.time()
        while time.time() - start_time < 5 :
            ret, frame = cap.read()
            if ret:
                cap.release()
                return True
            time.sleep(0.1)
        
        cap.release()
        return True
    except Exception as e:
        return False

def ping_test(ip):
    try:
        if ip.startswith("rtsp://"):
            ip = ip.split("://")[1].split("/")[0]
        
        output = subprocess.run(['ping', '-c', '1', ip], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if "0% packet loss" in output.stdout:
            return True
        else:
            return False

    except Exception as e:
        print(f"Ping 테스트 오류: {e}")
        return False

