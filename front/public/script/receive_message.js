conversation = document.getElementById("conversation");
const button_send = document.getElementById("button_send");
button_send.disabled = false;
send_message = false;

function sendMessage() {
    button_send.disabled = true;
    const input = document.getElementById("input_message");
    if (event.key === 'Enter') {
        input.style.height = 'auto';
    }
    
    const message = input.value.trim();
    if (message) {
        addMessageToConversation(message);
        input.value = "";
    }else{
        button_send.disabled = false;
    }
}

function addMessageToConversation(message, showThink = false) {
    if (!send_message) {
        send_message = true;
        const content_chat = document.getElementsByClassName("content_chat");
        const chat_space = document.getElementsByClassName("chat_space");
        const title_chat_space = document.getElementsByClassName("title_chat_space");
        const form_content = document.getElementsByClassName("form_content");

        Array.from(content_chat).forEach(element => element.classList.add("message"));
        Array.from(chat_space).forEach(element => element.classList.add("message"));
        Array.from(title_chat_space).forEach(element => element.classList.add("message"));
        Array.from(form_content).forEach(element => element.classList.add("message"));
    }

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

    const botMessageElement = document.createElement("div");
    botMessageElement.className = "chat_bot";
    const botMessageContent = document.createElement("div");
    botMessageContent.className = "chat_bot_mensage";
    const botParagraph = document.createElement("p");
    botMessageContent.appendChild(botParagraph);
    botMessageElement.appendChild(botMessageContent);

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
        let inThink = false;
        let thinkDiv = null;

        function readChunk() {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    button_send.disabled = false;
                    return;
                }
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
                                        botMessageElement.appendChild(thinkDiv);
                                        
                                        title_think = document.createElement('div');
                                        title_think.className = 'title_think';
                                        botMessageElement.appendChild(title_think);

                                        const h3_title = document.createElement('h3');
                                        h3_title.textContent = 'Pensando...';
                                        title_think.appendChild(h3_title);

                                        const before = text.split('<think>')[0];
                                        if (before) {
                                            fullText += before;
                                            botParagraph.innerHTML = marked.parse(fullText);
                                        }
                                        text = text.substring(text.indexOf('<think>') + 7);
                                    } else if (inThink && text.includes('</think>')) {
                                        const inside = text.split('</think>')[0];
                                        thinkDiv.textContent += inside;
                                        inThink = false;
                                        thinkDiv = null;
                                        text = text.substring(text.indexOf('</think>') + 8);
                                    } else if (inThink) {
                                        thinkDiv.textContent += text;
                                        text = '';
                                    } else {
                                        text = text.replace(/\\(?!n|\\)/g, '\\\\');
                                        fullText += text;

                                        botParagraph.innerHTML = marked.parse(fullText);
                                        if (window.MathJax) {
                                            MathJax.typesetPromise();
                                        }
                                        text = '';
                                    }
                                }
                                // conversation.scrollTop = conversation.scrollHeight;

                                // Tradução automática do texto do bot
                                if (window.translateBotResponse) {
                                    window.translateBotResponse(fullText).then(translated => {
                                        // Cria um novo elemento para mostrar a tradução
                                        let translationDiv = botMessageElement.querySelector('.bot-translation');
                                        if (!translationDiv) {
                                            translationDiv = document.createElement('div');
                                            translationDiv.className = 'bot-translation';
                                            botMessageElement.appendChild(translationDiv);
                                        }
                                        translationDiv.innerHTML = `<strong>Tradução:</strong> ${marked.parse(translated)}`;
                                    }).catch(() => {
                                        // Se falhar, não mostra nada
                                    });
                                }
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

// addMessageToConversation("Me fale sobre a teoria da relatividade");