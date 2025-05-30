.PHONY: help build up down logs shell test clean

help:
	@echo "Comandos disponíveis:"
	@echo "  make build    - Constrói as imagens Docker"
	@echo "  make up       - Inicia os containers"
	@echo "  make down     - Para os containers"
	@echo "  make logs     - Mostra os logs"
	@echo "  make shell    - Acessa o shell do backend"
	@echo "  make test     - Executa os testes"
	@echo "  make clean    - Remove containers e volumes"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend bash

test:
	docker-compose exec backend pytest

clean:
	docker-compose down -v