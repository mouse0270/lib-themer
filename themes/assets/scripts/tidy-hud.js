const TidyHUD = {
	renderPlayerList: async (app, elem, options) => {
		elem[0].querySelectorAll('aside#players ol li.player').forEach(elemPlayer => {
			elemPlayer.dataset.tooltip = elemPlayer.textContent;
			elemPlayer.dataset.tooltipDirection = "RIGHT";
		});
	}
};

Hooks.on('renderPlayerList', TidyHUD.renderPlayerList);
TidyHUD.renderPlayerList({}, [document.querySelector('aside#players')], {});