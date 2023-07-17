// On Load of libThemer Logic
// Get Chat Cards and Set Player Color
document.querySelectorAll('#sidebar #chat .chat-message').forEach((elem) => {
	let message = game.messages.get(elem.dataset.messageId);
	elem.style.setProperty('--player-color', `var(--player-color-${message.user.id}, ${message.user.color})`);
});

// On New Chat Cards set Player Color
Hooks.on('renderChatMessage', async (chatMessage, [elem], data) => {
	elem.style.setProperty('--player-color', `var(--player-color-${chatMessage.user.id}, ${chatMessage.user.color})`);
});