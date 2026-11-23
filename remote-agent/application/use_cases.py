from domain.interfaces import IInputController, ISystemPowerManager, INetworkPolicyManager

class RemoteControlUseCase:
    def __init__(self, input_ctrl: IInputController, power_mgr: ISystemPowerManager, net_mgr: INetworkPolicyManager):
        self.input_ctrl = input_ctrl
        self.power_mgr = power_mgr
        self.net_mgr = net_mgr

    def block_peripherals(self) -> bool: return self.input_ctrl.block_input()
    def unblock_peripherals(self) -> bool: return self.input_ctrl.unblock_input()
    def shutdown(self) -> bool: return self.power_mgr.shutdown_pc()
    def block_web(self, url: str) -> bool: return self.net_mgr.block_web_page(url)
    def unblock_web(self, url: str) -> bool: return self.net_mgr.unblock_web_page(url)
    def set_ping_state(self, allow: bool) -> bool: return self.net_mgr.toggle_ping(allow)