from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
import uvicorn

from router import get_router, post_router, websocket_router


app = FastAPI()


app.mount("/web/static", StaticFiles(directory="/web-viewer-streaming/src/web/static"), name="static")


app.include_router(post_router)
app.include_router(get_router)
app.include_router(websocket_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8444)