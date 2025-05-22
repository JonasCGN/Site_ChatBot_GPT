.PHONY: all frontend test_request

all:
	@docker compose down
	@docker compose up --build

baixar_modelo_local:
	ollama pull deepseek-r1:7b

frontend:
	@cd front && npm install && npm start

test_request:
	@wsl curl -s http://localhost:11434/api/generate \
		-H "Content-Type: application/json" \
		-d '{"model":"deepseek-r1:7b","prompt":"Explique brevemente a teoria da relatividade.","stream":true}' | jq