import os
import sys

# Add the running application path to the system path
sys.path.append(os.getcwd())

# Point to your core settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

# Import the WSGI application object cPanel's server expects
from core.wsgi import application
