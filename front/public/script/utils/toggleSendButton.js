function toggleSendButton() {
    const input = document.getElementById('input_message');
    const button = document.getElementById('button_send');
    button.disabled = !input.value.trim();
}
window.onload = toggleSendButton;
