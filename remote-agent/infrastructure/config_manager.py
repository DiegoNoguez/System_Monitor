import os, json
CONFIG_FILE = "agent_config.json"

class ConfigManager:
    @staticmethod
    def load_config():
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r") as f: return json.load(f)
        return None

    @staticmethod
    def save_config(config: dict):
        with open(CONFIG_FILE, "w") as f: json.dump(config, f)