.PHONY: init
init:
	./bootstrap.py
	virtualenv venv --system-site-packages -p python3
	source venv/bin/activate && pip3 install -r backend/requirements.txt && deactivate
	cd frontend && npm install

.PHONY: build
build:
	cd frontend && ng build --prod --base-href="/" --output-path=../dist --extract-licenses=false
	cp -rL backend -t dist

.PHONY: run
run:
	cd frontend && ng serve --proxy-config proxy.json &
	source ./venv/bin/activate && python3 backend
