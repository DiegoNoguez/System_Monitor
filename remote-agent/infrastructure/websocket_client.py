import socketio
import base64
import io
import subprocess
import os
import tempfile
from PIL import Image
from application.use_cases import RemoteControlUseCase

class AgentWebSocketClient:
    def __init__(self, server_url: str, agent_id: str, token: str, use_case: RemoteControlUseCase):
        self.sio = socketio.Client(reconnection=True, reconnection_delay=5)
        self.server_url = server_url
        self.agent_id = agent_id
        self.token = token
        self.use_case = use_case
        self._register_events()

    def _register_events(self):
        @self.sio.event
        def connect(): 
            print(f"Conectado a NestJS (ID: {self.agent_id})")

        @self.sio.event
        def disconnect():
            print("Desconectado de NestJS. Reintentando...")

        @self.sio.on('execute_command')
        def on_execute_command(data):
            command = data.get('command')
            payload = data.get('payload', {})
            print(f"Comando recibido: {command}")
            
            success, details = False, ""
            try:
                if command == 'BLOCK_INPUT': success = self.use_case.block_peripherals()
                elif command == 'UNBLOCK_INPUT': success = self.use_case.unblock_peripherals()
                elif command == 'SHUTDOWN': success = self.use_case.shutdown()
                elif command == 'BLOCK_WEB': success = self.use_case.block_web(payload.get('url'))
                elif command == 'UNBLOCK_WEB': success = self.use_case.unblock_web(payload.get('url'))
                elif command == 'TOGGLE_PING': success = self.use_case.set_ping_state(payload.get('allow', True))
            except Exception as e: 
                details = str(e)
            
            self.sio.emit('command_result', {
                'agentId': self.agent_id, 'command': command, 'success': success, 'details': details
            })

        @self.sio.on('receive_chat')
        def on_receive_chat(data):
            print(f"[CHAT] {data.get('sender')}: {data.get('message')}")

        @self.sio.on('receive_file_chunk')
        def on_receive_file(data):
            file_name = data.get('fileName')
            chunk_data = data.get('chunk')
            is_last = data.get('isLast')
            
            os.makedirs("downloads", exist_ok=True)
            filepath = os.path.join("downloads", file_name)
            
            try:
                with open(filepath, "ab") as f:
                    f.write(base64.b64decode(chunk_data))
                
                if is_last:
                    print(f"Archivo recibido con exito: {file_name} (Guardado en /downloads)")
            except Exception as e:
                print(f"Error guardando archivo: {e}")

        @self.sio.on('request_screen')
        def on_request_screen(data):
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp: 
                    tmp_path = tmp.name
                
                subprocess.run(["grim", tmp_path], check=True, env=os.environ.copy())
                
                with Image.open(tmp_path) as img:
                    img.thumbnail((1280, 1280))
                    buffered = io.BytesIO()
                    img.save(buffered, format="JPEG", quality=50)
                    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                self.sio.emit('screen_data', {
                    'agentId': self.agent_id, 
                    'image': f"data:image/jpeg;base64,{img_str}"
                })
            except Exception as e: 
                print(f"Error capturando pantalla: {e}")
            finally:
                if tmp_path and os.path.exists(tmp_path): 
                    os.remove(tmp_path)

    def start(self):
        url = f"{self.server_url}?role=agent&agentId={self.agent_id}&token={self.token}"
        self.sio.connect(url, transports=['websocket'])