.PHONY: install run wipe

init: install build-api-image

migrate:
	yarn nx run api:migration:run

test:
	yarn affected:test

install:
	yarn install --immutable

up-local:
	docker-compose --profile local up --build

up:
	docker-compose up --build -d

up-monitoring:
	docker-compose --profile monitoring up --build

seed:
	yarn nx run api:seed

up-db:
	docker-compose up --build db

up-redis:
	docker-compose up --build redis

wipe:
	docker-compose down --volumes

build-api-image:
	yarn build
	docker build . -t nestjs-task-manager-api
