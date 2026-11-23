from abc import ABC, abstractmethod

class IInputController(ABC):
    @abstractmethod
    def block_input(self) -> bool: pass
    @abstractmethod
    def unblock_input(self) -> bool: pass

class ISystemPowerManager(ABC):
    @abstractmethod
    def shutdown_pc(self) -> bool: pass

class INetworkPolicyManager(ABC):
    @abstractmethod
    def block_web_page(self, url: str) -> bool: pass
    @abstractmethod
    def unblock_web_page(self, url: str) -> bool: pass
    @abstractmethod
    def toggle_ping(self, allow: bool) -> bool: pass