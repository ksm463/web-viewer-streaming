from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates

from service import get_onvif_rtsp_address_list


get_router = APIRouter()


templates = Jinja2Templates(directory="/web-viewer-streaming/src/web/templates")


@get_router.get("/get_onvif_list")
async def get_onvif_list(ip, port, id, pwd):
    return get_onvif_rtsp_address_list(ip, port, id, pwd)


@get_router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    headers = {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
    }
    return templates.TemplateResponse("main.html", {"request": request}, headers=headers)

@get_router.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("/web-viewer-streaming/src/web/static/favicon.ico")