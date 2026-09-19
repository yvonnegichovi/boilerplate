import os
import sys

# Get the current directory path

current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

# If the automated sync placed core inside a 'backend' subfolder, add that path too
backend_dir = os.path.join(current_dir, "backend")
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)

os.environ["DJANGO_SETTINGS_MODULE"] = "core.settings"

try:
    from core.wsgi import application  # noqa: E402, F401
except ImportError:
    # Fallback to handle alternative pathing strategies
    from backend.core.wsgi import application  # noqa: E402, F401
