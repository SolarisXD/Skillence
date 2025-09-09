from main import app

# Print all registered routes
for route in app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        print(f"{list(route.methods)} {route.path}")
