from api import auth

def hello_world():
	return("Hello from the module!")

@auth.required()
def protected_hello():
	return("Protected hello")
