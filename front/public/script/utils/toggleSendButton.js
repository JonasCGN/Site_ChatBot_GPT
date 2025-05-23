function toggleSendButton() {
    if(event.key === 'Enter' && !(document.getElementById('button_send').disabled)){ sendMessage(); }
}