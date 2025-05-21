all:
	@docker compose down
	@docker compose up --build

frontend:
	@cd front && npm install && npm start
