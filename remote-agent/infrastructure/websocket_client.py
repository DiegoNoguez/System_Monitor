import socketio
import base64
import io
import subprocess
import os
import tempfile
import threading
import time
from PIL import Image
from application.use_cases import RemoteControlUseCase

try:
    from pynput.mouse import Controller as MouseController, Button
    PYNPUT_AVAILABLE = True
except Exception:
    PYNPUT_AVAILABLE = False

class AgentWebSocketClient:
    def __init__(self, server_url, agent_id, token, use_case, log_callback, root, admin_screen_callback):
        self.sio = socketio.Client(reconnection=True, reconnection_delay=3)
        self.server_url = server_url
        self.agent_id = agent_id
        self.token = token
        self.use_case = use_case
        self.log_chat = log_callback
        self.root = root
        self.admin_screen_callback = admin_screen_callback
        
        self.is_streaming = False
        if PYNPUT_AVAILABLE: self.mouse = MouseController()
        else: self.mouse = None
        
        self._register_events()

    def _register_events(self):
        @self.sio.event
        def connect(): 
            self.root.after(0, lambda: self.log_chat("Sistema", "Conectado de forma segura"))

        @self.sio.on('execute_command')
        def on_execute_command(data):
            command = data.get('command')
            payload = data.get('payload', {})
            success, details = False, ""
            try:
                if command == 'BLOCK_INPUT': success = self.use_case.block_peripherals()
                elif command == 'UNBLOCK_INPUT': success = self.use_case.unblock_peripherals()
                elif command == 'SHUTDOWN': success = self.use_case.shutdown()
                elif command == 'BLOCK_WEB': success = self.use_case.block_web(payload.get('url'))
                elif command == 'UNBLOCK_WEB': success = self.use_case.unblock_web(payload.get('url'))
                elif command == 'TOGGLE_PING': success = self.use_case.set_ping_state(payload.get('allow'), payload.get('target_ip'))
            except Exception as e: details = str(e)
            
            self.sio.emit('command_result', {'agentId': self.agent_id, 'command': command, 'success': success, 'details': details})

        @self.sio.on('receive_chat')
        def on_receive_chat(data):
            self.root.after(0, lambda: self.log_chat("Admin", data.get('message')))

        @self.sio.on('remote_mouse_event')
        def on_remote_mouse_event(data):
            if not PYNPUT_AVAILABLE or not self.mouse: return
            if data.get('action') == 'click':
                self.mouse.position = (data['x'], data['y'])
                self.mouse.click(Button.left)

        @self.sio.on('start_stream')
        def on_start_stream(data):
            if not self.is_streaming:
                self.is_streaming = True
                threading.Thread(target=self._stream_loop, daemon=True).start()

        @self.sio.on('stop_stream')
        def on_stop_stream(data):
            self.is_streaming = False

        @self.sio.on('receive_file_chunk')
        def on_receive_file(data):
            file_name = data.get('fileName')
            chunk_data = data.get('chunk')
            os.makedirs(os.path.expanduser("~/Downloads"), exist_ok=True)
            with open(os.path.join(os.path.expanduser("~/Downloads"), file_name), "ab") as f:
                f.write(base64.b64decode(chunk_data))

        @self.sio.on('admin_screen_data')
        def on_admin_screen_data(data):
            if self.admin_screen_callback:
                self.root.after(0, lambda: self.admin_screen_callback(data.get('image')))

    def _stream_loop(self):
        while self.is_streaming:
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp: tmp_path = tmp.name
                subprocess.run(["grim", tmp_path], check=True, env=os.environ.copy(), capture_output=True)
                with Image.open(tmp_path) as img:
                    img.thumbnail((800, 800))
                    buffered = io.BytesIO()
                    img.save(buffered, format="JPEG", quality=30)
                    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
                self.sio.emit('screen_data', {'agentId': self.agent_id, 'image': f"data:image/jpeg;base64,{img_str}"})
            except Exception: pass
            finally:
                if tmp_path and os.path.exists(tmp_path): os.remove(tmp_path)
            time.sleep(0.1)

    def send_chat_to_web(self, message):
        self.sio.emit('send_chat', {'agentId': self.agent_id, 'message': message, 'sender': 'Agente'})

    def send_file_to_web(self, filepath):
        filename = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            chunk = base64.b64encode(f.read()).decode('utf-8')
        self.sio.emit('file_chunk_from_agent', {'agentId': self.agent_id, 'fileName': filename, 'chunk': chunk, 'isLast': True})

    def start(self):
        self.sio.connect(f"{self.server_url}?role=agent&agentId={self.agent_id}&token={self.token}", transports=['websocket'])