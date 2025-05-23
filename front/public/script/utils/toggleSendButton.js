function toggleSendButton() {
    if(event.key === 'Enter' && !(document.getElementById('button_send').disabled)){ sendMessage(); }
    if (event.key === 'Enter') {
        textarea.style.height = 'auto';
    }
}

const textarea = document.getElementById('input_message');

textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'; // Reseta a altura
    textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta para altura do conteúdo
});