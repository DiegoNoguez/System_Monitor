import platform
import subprocess
from domain.interfaces import ISystemPowerManager

class OSPowerManager(ISystemPowerManager):
    def shutdown_pc(self) -> bool:
        sistema = platform.system()
        try:
            if sistema == "Windows": subprocess.run(["shutdown", "/s", "/t", "0"], check=True)
            elif sistema == "Linux": subprocess.run(["shutdown", "-h", "now"], check=True)
            return True
        except Exception: return False