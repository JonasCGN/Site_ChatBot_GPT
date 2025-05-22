API_URL ?= http://localhost:5000/messages
.PHONY: test-all create list get update delete

test-all: create list get update delete

create:
	curl -X POST -H "Content-Type: application/json" -d '{"content": "Mensagem de teste"}' $(API_URL)

list:
	curl -X GET $(API_URL)

