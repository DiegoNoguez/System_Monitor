import platform
import subprocess
from domain.interfaces import INetworkPolicyManager

class OSNetworkPolicyManager(INetworkPolicyManager):
    
    def _get_hosts_path(self):
        return r"C:\Windows\System32\drivers\etc\hosts" if platform.system() == "Windows" else "/etc/hosts"

    def block_web_page(self, url: str) -> bool:
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        hosts_path = self._get_hosts_path()
        entry = f"\n# Bloqueo SaaS - {domain}\n127.0.0.1 {domain}\n::1 {domain}\n127.0.0.1 www.{domain}\n::1 www.{domain}\n"
        try:
            if platform.system() == "Linux":
                subprocess.run(["sudo", "tee", "-a", hosts_path], input=entry.encode(), check=True, capture_output=True)
            else:
                with open(hosts_path, "a") as f: f.write(entry)
            self._flush_dns()
            return True
        except Exception: return False

    def unblock_web_page(self, url: str) -> bool:
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        hosts_path = self._get_hosts_path()
        try:
            if platform.system() == "Linux":
                subprocess.run(["sudo", "sed", "-i", f"/{domain}/d", hosts_path], check=True)
            else:
                with open(hosts_path, "r") as f: lines = f.readlines()
                with open(hosts_path, "w") as f:
                    for line in lines:
                        if domain not in line: f.write(line)
            self._flush_dns()
            return True
        except Exception: return False

    def toggle_ping(self, allow: bool) -> bool:
        """Bloquea el ping entrante (PC a PC)"""
        sistema = platform.system()
        try:
            if sistema == "Windows":
                action = "allow" if allow else "block"
                subprocess.run(["netsh", "advfirewall", "firewall", "delete", "rule", "name=ICMP_Block"], capture_output=True)
                subprocess.run(["netsh", "advfirewall", "firewall", "add", "rule", "name=ICMP_Block", "protocol=icmpv4", "dir=in", f"action={action}"], check=True, capture_output=True)
            elif sistema == "Linux":
                # INPUT bloquea el tráfico entrante (cuando otra PC te hace ping)
                subprocess.run(["sudo", "iptables", "-D", "INPUT", "-p", "icmp", "--icmp-type", "echo-request", "-j", "DROP"], capture_output=True)
                if not allow:
                    subprocess.run(["sudo", "iptables", "-A", "INPUT", "-p", "icmp", "--icmp-type", "echo-request", "-j", "DROP"], check=True, capture_output=True)
            return True
        except Exception: return False

    def _flush_dns(self):
        if platform.system() == "Windows":
            subprocess.run(["ipconfig", "/flushdns"], capture_output=True)
        else:
            subprocess.run(["sudo", "resolvectl", "flush-caches"], check=False, capture_output=True)