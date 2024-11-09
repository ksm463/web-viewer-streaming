from fastapi import APIRouter, HTTPException
import uuid

from utility import RTSPRequestStruct, valid_rtsp_address, valid_id_pw, ping_test


post_router = APIRouter()


@post_router.post("/setup_rtsp")
async def post_setup_rtsp(request: RTSPRequestStruct):
    rtsp_address = request.rtsp_address

    # 입력값 검증: rtsp_address, rtsp_id, rtsp_pw가 비어있는지 확인
    if not rtsp_address or not request.rtsp_id or not request.rtsp_pw:
        raise HTTPException(status_code=400, detail="누락된 입력 정보가 있습니다.")

    # RTSP 주소 형식 검증
    if not valid_rtsp_address(rtsp_address):
        raise HTTPException(status_code=400, detail="잘못된 RTSP 주소 형식입니다.")

    # IP 주소로 핑 테스트 실행
    ip = rtsp_address.split("://")[1].split("/")[0]
    if not ping_test(ip):
        raise HTTPException(status_code=400, detail="해당 IP에 접속할 수 없습니다.")

    # ID와 PW를 RTSP 주소에 결합
    if request.rtsp_id and request.rtsp_pw:
        address_start = rtsp_address.find("://") + 3
        full_rtsp_address = rtsp_address[:address_start] + f"{request.rtsp_id}:{request.rtsp_pw}@" + rtsp_address[address_start:]
        print(f"full_rtsp_address : {full_rtsp_address}")

    # ID와 PW 검증 (결합된 RTSP 주소로 테스트)
    if not valid_id_pw(full_rtsp_address):
        raise HTTPException(status_code=401, detail="입력된 RTSP주소, ID 또는 PW가 올바르지 않습니다.")

    return {"full_rtsp_address": full_rtsp_address}
