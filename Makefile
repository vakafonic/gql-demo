SHELL := /bin/bash

help:
	@echo -e "Targets\n"\
	"- init-network: Prepare docker networking.\n"\
	"- init-be: Install required libs at BE.\n"\
	"- init-fe: Install required libs at GQL GW.\n"\

init-network:
	@docker network create --driver=bridge --subnet=172.34.20.0/24 backend_services && \
	docker network create --driver=bridge --subnet=172.33.20.0/24 frontend_gateway

init-be:
	@docker-compose run --rm app_backend composer install

init-fe:
	@docker-compose run --rm frontend_gateway npm install

