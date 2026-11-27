import socket
import platform
import requests
import threading
import tkinter as tk
from tkinter import filedialog, ttk
import os
import time
import subprocess
import tempfile
import base64
import io
import sys
from PIL import Image, ImageTk
from infrastructure.input_control import OSInputController
from infrastructure.power_control import OSPowerManager
from infrastructure.network_control import OSNetworkPolicyManager
from application.use_cases import RemoteControlUseCase
from infrastructure.websocket_client import AgentWebSocketClient
from infrastructure.config_manager import ConfigManager

SERVER_HTTP_URL = "https://apimonitorsystem.springyblock6devdanl.dpdns.org/api/v1"
SERVER_WS_URL = "https://apimonitorsystem.springyblock6devdanl.dpdns.org"
TENANT_CODE = "ACME-123"

# --- PALETA DE COLORES PREMIUM ---
BG_COLOR = "#0B0F19"       # Fondo principal (Muy oscuro)
SURFACE_COLOR = "#1E293B"  # Paneles y tarjetas
PRIMARY_COLOR = "#6366F1"  # Indigo brillante
SUCCESS_COLOR = "#10B981"  # Verde esmeralda
DANGER_COLOR = "#EF4444"   # Rojo
TEXT_MAIN = "#F8FAFC"      # Blanco puro
TEXT_MUTED = "#94A3B8"     # Gris azulado

class AgentApp:
    def __init__(self, root):
        self.root = root
        self.root.title("MonitorSys | Agent Pro")
        self.root.geometry("420x680")
        self.root.configure(bg=BG_COLOR)
        self.root.resizable(False, False)

        # Configurar cierre seguro al darle a la X de la ventana
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.ws_client = None
        self.use_case = None
        self.agent_id = None
        self.agent_token = None
        self.is_previewing_admin = False

        self.setup_styles()
        self.setup_ui()
        self.start_agent_logic()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        # Estilos para los botones
        style.configure("Primary.TButton", font=("Segoe UI", 10, "bold"), background=PRIMARY_COLOR, foreground="white", borderwidth=0, padding=10)
        style.map("Primary.TButton", background=[("active", "#4F46E5")])
        
        style.configure("Surface.TButton", font=("Segoe UI", 10), background=SURFACE_COLOR, foreground=TEXT_MAIN, borderwidth=0, padding=8)
        style.map("Surface.TButton", background=[("active", "#334155")])
        
        style.configure("Danger.TButton", font=("Segoe UI", 10, "bold"), background=DANGER_COLOR, foreground="white", borderwidth=0, padding=8)
        style.map("Danger.TButton", background=[("active", "#DC2626")])

    def setup_ui(self):
        # --- HEADER ---
        header = tk.Frame(self.root, bg=BG_COLOR, pady=20)
        header.pack(fill="x", padx=20)
        
        title = tk.Label(header, text="MonitorSys", font=("Segoe UI", 22, "bold"), bg=BG_COLOR, fg=PRIMARY_COLOR)
        title.pack(side="left")
        
        self.status_indicator = tk.Label(header, text="● Desconectado", font=("Segoe UI", 9), bg=BG_COLOR, fg=DANGER_COLOR)
        self.status_indicator.pack(side="right", pady=8)

        # --- PANEL DE CHAT ---
        chat_container = tk.Frame(self.root, bg=SURFACE_COLOR, padx=1, pady=1)
        chat_container.pack(fill="both", expand=True, padx=20, pady=5)
        
        chat_inner = tk.Frame(chat_container, bg=BG_COLOR)
        chat_inner.pack(fill="both", expand=True)

        # Text Area con Scrollbar
        scrollbar = tk.Scrollbar(chat_inner)
        scrollbar.pack(side="right", fill="y")
        
        self.chat_area = tk.Text(chat_inner, bg=BG_COLOR, fg=TEXT_MAIN, font=("Consolas", 10), 
                                 state="disabled", borderwidth=0, yscrollcommand=scrollbar.set, padx=10, pady=10)
        self.chat_area.pack(fill="both", expand=True)
        scrollbar.config(command=self.chat_area.yview)
        
        # Tags para colores en el chat
        self.chat_area.tag_config("system", foreground=SUCCESS_COLOR)
        self.chat_area.tag_config("admin", foreground=PRIMARY_COLOR)
        self.chat_area.tag_config("me", foreground=TEXT_MAIN)

        # --- INPUT DE CHAT ---
        input_frame = tk.Frame(self.root, bg=BG_COLOR, pady=10)
        input_frame.pack(fill="x", padx=20)
        
        self.chat_input = tk.Entry(input_frame, bg=SURFACE_COLOR, fg=TEXT_MAIN, font=("Segoe UI", 11), 
                                   borderwidth=0, insertbackground="white")
        self.chat_input.pack(side="left", fill="x", expand=True, ipady=8, padx=(0, 10))
        self.chat_input.bind("<Return>", self.send_chat_message)
        
        btn_send = ttk.Button(input_frame, text="➤", style="Primary.TButton", command=self.send_chat_message, width=4)
        btn_send.pack(side="right")

        # --- BOTONES INFERIORES ---
        actions_frame = tk.Frame(self.root, bg=BG_COLOR, pady=10)
        actions_frame.pack(fill="x", padx=20, pady=(0, 20))
        
        btn_file = ttk.Button(actions_frame, text="Enviar Archivo", style="Surface.TButton", command=self.send_file_to_web)
        btn_file.pack(fill="x", pady=(0, 8))
        
        btn_view_admin = ttk.Button(actions_frame, text="Ver Pantalla Admin", style="Surface.TButton", command=self.toggle_admin_preview)
        btn_view_admin.pack(fill="x", pady=(0, 8))

        btn_exit = ttk.Button(actions_frame, text="Desconectar y Salir", style="Danger.TButton", command=self.on_closing)
        btn_exit.pack(fill="x")

    def log_chat(self, sender, message):
        self.chat_area.config(state="normal")
        if sender == "Sistema":
            self.chat_area.insert(tk.END, f"[{sender}]: {message}\n", "system")
        elif sender == "Admin":
            self.chat_area.insert(tk.END, f"[{sender}]: {message}\n", "admin")
        else:
            self.chat_area.insert(tk.END, f"[{sender}]: {message}\n", "me")
        self.chat_area.see(tk.END)
        self.chat_area.config(state="disabled")

    def send_chat_message(self, event=None):
        msg = self.chat_input.get()
        if msg and self.ws_client:
            self.ws_client.send_chat_to_web(msg)
            self.log_chat("Yo", msg)
            self.chat_input.delete(0, tk.END)

    def send_file_to_web(self):
        if not self.ws_client: return
        filepath = filedialog.askopenfilename()
        if filepath:
            self.ws_client.send_file_to_web(filepath)
            self.log_chat("Sistema", f"Enviando: {os.path.basename(filepath)}")

    # --- VISTA DE PANTALLA DEL ADMINISTRADOR ---
    def toggle_admin_preview(self):
        if self.is_previewing_admin:
            self.is_previewing_admin = False
            if hasattr(self, 'preview_window'):
                self.preview_window.destroy()
            if self.ws_client:
                self.ws_client.sio.emit('stop_admin_screen_stream')
        else:
            self.is_previewing_admin = True
            self.preview_window = tk.Toplevel(self.root)
            self.preview_window.title("Pantalla del Administrador")
            self.preview_window.geometry("800x500")
            self.preview_window.configure(bg="black")
            self.preview_window.protocol("WM_DELETE_WINDOW", self.toggle_admin_preview)
            
            self.preview_label = tk.Label(self.preview_window, bg="black", text="Esperando transmisión del Admin...", fg="white", font=("Segoe UI", 12))
            self.preview_label.pack(expand=True, fill="both")
            
            if self.ws_client:
                # Pedir al servidor que empiece a enviar la pantalla del Admin
                self.ws_client.sio.emit('request_admin_screen')

    def update_admin_screen(self, base64_image):
        if self.is_previewing_admin and hasattr(self, 'preview_label'):
            try:
                img_data = base64.b64decode(base64_image.split(",")[1])
                img = Image.open(io.BytesIO(img_data))
                img.thumbnail((800, 500))
                imgtk = ImageTk.PhotoImage(image=img)
                self.preview_label.imgtk = imgtk
                self.preview_label.configure(image=imgtk, text="")
            except Exception:
                pass

    # --- CIERRE SEGURO ---
    def on_closing(self):
        if self.ws_client and self.ws_client.sio.connected:
            self.ws_client.sio.disconnect()
        self.root.destroy()
        sys.exit(0)

    def start_agent_logic(self):
        def run():
            while True:
                try:
                    config = ConfigManager.load_config()
                    if config and "agentId" in config:
                        self.agent_id = config["agentId"]
                        self.agent_token = config["agentToken"]
                    else:
                        res = requests.post(f"{SERVER_HTTP_URL}/agents/register", json={"tenantCode": TENANT_CODE, "hostname": socket.gethostname(), "os": platform.system()})
                        res.raise_for_status()
                        data = res.json()
                        ConfigManager.save_config({"agentId": data["agentId"], "agentToken": data["agentToken"]})
                        self.agent_id = data["agentId"]
                        self.agent_token = data["agentToken"]

                    self.root.after(0, lambda: self.status_indicator.config(text="● En Línea", fg=SUCCESS_COLOR))
                    break 
                except Exception:
                    self.root.after(0, lambda: self.status_indicator.config(text="● Reconectando...", fg=DANGER_COLOR))
                    time.sleep(5)

            input_ctrl = OSInputController()
            power_mgr = OSPowerManager()
            net_mgr = OSNetworkPolicyManager()
            self.use_case = RemoteControlUseCase(input_ctrl, power_mgr, net_mgr)

            # Pasamos la función update_admin_screen al WebSocket
            self.ws_client = AgentWebSocketClient(
                SERVER_WS_URL, self.agent_id, self.agent_token, 
                self.use_case, self.log_chat, self.root, self.update_admin_screen
            )
            self.ws_client.start()

        threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = AgentApp(root)
    root.mainloop()