from pydantic import BaseModel

class RTSPRequestStruct(BaseModel):
    rtsp_address: str
    rtsp_id: str = ""
    rtsp_pw: str = ""
    
class ONVIFRequestStruct(BaseModel):
    ip: str
    port: int
    id: str = ""
    pw: str = ""
