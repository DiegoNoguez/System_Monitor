from pydantic import BaseModel

class WebBlockRequest(BaseModel):
    url: str

class PingRequest(BaseModel):
    allow: bool