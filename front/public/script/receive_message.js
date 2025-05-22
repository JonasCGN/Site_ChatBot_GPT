conversation = document.getElementById("conversation");

function addMessageToConversation(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "user";

    const userMessageElement = document.createElement("div");
    userMessageElement.className = "user_mensagem";

    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = message;

    userMessageElement.appendChild(paragraphElement);
    messageElement.appendChild(userMessageElement);
    conversation.appendChild(messageElement);
    conversation.scrollTop = conversation.scrollHeight;

    // Cria o elemento da resposta do bot
    const botMessageElement = document.createElement("div");
    botMessageElement.className = "chat_bot";
    const botMessageContent = document.createElement("div");
    botMessageContent.className = "chat_bot_mensage";
    const botParagraph = document.createElement("p");
    botMessageContent.appendChild(botParagraph);
    botMessageElement.appendChild(botMessageContent);

    // Elementos para o think
    let thinkDiv = null;
    let titleThinkDiv = null;
    let inThink = false;

    conversation.appendChild(botMessageElement);
    conversation.scrollTop = conversation.scrollHeight;

    fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek-r1:7b",
            prompt: message,
            stream: true
        })
    })
    .then(response => {
        const reader = response.body.getReader();
        let fullText = "";
        function readChunk() {
            return reader.read().then(({ done, value }) => {
                if (done) return;
                const chunk = new TextDecoder().decode(value);
                chunk.split(/\n+/).forEach(line => {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                let text = data.response;
                                while (text.length > 0) {
                                    if (!inThink && text.includes('<think>')) {
                                        inThink = true;
                                        thinkDiv = document.createElement('div');
                                        thinkDiv.className = 'think';
                                        titleThinkDiv = document.createElement('div');
                                        titleThinkDiv.className = 'title_think';
                                        const h3 = document.createElement('h3');
                                        h3.textContent = 'Pensando...';
                                        titleThinkDiv.appendChild(h3);
                                        botMessageElement.appendChild(thinkDiv);
                                        botMessageElement.appendChild(titleThinkDiv);
                                        const before = text.split('<think>')[0];
                                        if (before) {
                                            fullText += before;
                                            botParagraph.textContent = fullText;
                                        }
                                        text = text.substring(text.indexOf('<think>') + 7);
                                    } else if (inThink && text.includes('</think>')) {
                                        const inside = text.split('</think>')[0];
                                        thinkDiv.textContent += inside;
                                        inThink = false;
                                        thinkDiv = null;
                                        if (titleThinkDiv) {
                                            titleThinkDiv.remove();
                                            titleThinkDiv = null;
                                        }
                                        text = text.substring(text.indexOf('</think>') + 8);
                                    } else if (inThink) {
                                        thinkDiv.textContent += text;
                                        text = '';
                                    } else {
                                        fullText += text;
                                        botParagraph.textContent = fullText;
                                        text = '';
                                    }
                                }
                                conversation.scrollTop = conversation.scrollHeight;
                            }
                        } catch (e) {
                            // Ignora linhas que não são JSON válidas
                        }
                    }
                });
                return readChunk();
            });
        }
        return readChunk();
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// addMessageToConversation(
//     "Olá, como posso ajudar?",
//     true,
// );