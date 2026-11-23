import os
import platform
from domain.interfaces import IInputController

try:
    from pynput import keyboard, mouse
    PYNPUT_AVAILABLE = True
except ImportError: PYNPUT_AVAILABLE = False

try:
    from evdev import InputDevice, ecodes, list_devices
    EVDEV_AVAILABLE = True
except ImportError: EVDEV_AVAILABLE = False

class OSInputController(IInputController):
    def __init__(self):
        self.is_blocked = False
        self.is_wayland = "WAYLAND_DISPLAY" in os.environ
        self.devices = []
        self.k_listener = None
        self.m_listener = None

    def block_input(self) -> bool:
        if self.is_blocked: return True
        try:
            if self.is_wayland:
                if not EVDEV_AVAILABLE: return False
                for path in list_devices():
                    try:
                        dev = InputDevice(path)
                        caps = dev.capabilities()
                        if ecodes.EV_KEY in caps or ecodes.EV_REL in caps:
                            dev.grab()
                            self.devices.append(dev)
                    except Exception: continue
            else:
                if not PYNPUT_AVAILABLE: return False
                self.k_listener = keyboard.Listener(suppress=True)
                self.m_listener = mouse.Listener(suppress=True)
                self.k_listener.start()
                self.m_listener.start()
            self.is_blocked = True
            return True
        except Exception: return False

    def unblock_input(self) -> bool:
        if not self.is_blocked: return True
        try:
            if self.is_wayland:
                for dev in self.devices: dev.ungrab()
                self.devices.clear()
            else:
                if self.k_listener: self.k_listener.stop()
                if self.m_listener: self.m_listener.stop()
            self.is_blocked = False
            return True
        except Exception: return False