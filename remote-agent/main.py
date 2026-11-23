import socket
import platform
import requests
import uvicorn
import threading
from fastapi import FastAPI
from infrastructure.input_control import OSInputController
from infrastructure.power_control import OSPowerManager
from infrastructure.network_control import OSNetworkPolicyManager
from application.use_cases import RemoteControlUseCase
from interfaces import api_routes
from infrastructure.websocket_client import AgentWebSocketClient
from infrastructure.config_manager import ConfigManager

# --- CONFIGURACION PARA EL TUNEL ---
SERVER_HTTP_URL = "https://apimonitorsystem.springyblock6devdanl.dpdns.org/api/v1"
SERVER_WS_URL = "https://apimonitorsystem.springyblock6devdanl.dpdns.org"
TENANT_CODE = "ACME-123"

def auto_enroll():
    config = ConfigManager.load_config()
    if config and "agentId" in config: 
        return config["agentId"], config["agentToken"]
    
    print("Agente no registrado. Iniciando auto-registro...")
    try:
        res = requests.post(f"{SERVER_HTTP_URL}/agents/register", json={
            "tenantCode": TENANT_CODE, 
            "hostname": socket.gethostname(), 
            "os": platform.system()
        })
        res.raise_for_status()
        data = res.json()
        ConfigManager.save_config({"agentId": data["agentId"], "agentToken": data["agentToken"]})
        print(f"Registro exitoso. Agente ID: {data['agentId']}")
        return data["agentId"], data["agentToken"]
    except Exception as e:
        print(f"Error: Asegurate de que NestJS y el tunel esten encendidos. Detalle: {e}")
        exit(1)

input_ctrl = OSInputController()
power_mgr = OSPowerManager()
net_mgr = OSNetworkPolicyManager()
use_case = RemoteControlUseCase(input_ctrl, power_mgr, net_mgr)

AGENT_ID, AGENT_TOKEN = auto_enroll()

ws_client = AgentWebSocketClient(SERVER_WS_URL, AGENT_ID, AGENT_TOKEN, use_case)
threading.Thread(target=ws_client.start, daemon=True).start()

api_routes.set_use_case(use_case)
app = FastAPI(title="SaaS Remote Agent")
app.include_router(api_routes.router, prefix="/api/v1")

if __name__ == "__main__":
    print("Iniciando Agente...")
    uvicorn.run(app, host="0.0.0.0", port=8000)