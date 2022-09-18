const TidyHUD = {
	renderPlayerList: async (app, elem, options) => {
		elem[0].querySelectorAll('aside#players ol li.player').forEach(elemPlayer => {
			elemPlayer.dataset.tooltip = elemPlayer.textContent;
			elemPlayer.dataset.tooltipDirection = "RIGHT";
		});
	},
	collapseSidebar: async (app, collapsed) => {
		if (collapsed) {
			const position = parseFloat(document.querySelector(":root").style.getPropertyValue('--sidebar-width')) - document.querySelector('#sidebar').offsetWidth
			document.querySelector('#notifications').style.marginRight = `-${position}px`;
		}else{
			document.querySelector('#notifications').style.marginRight = '0px';
		}
	}
};

Hooks.on('renderPlayerList', TidyHUD.renderPlayerList);
Hooks.on('collapseSidebar', TidyHUD.collapseSidebar);
TidyHUD.renderPlayerList({}, [document.querySelector('aside#players')], {});
TidyHUD.collapseSidebar([document.querySelector('#sidebar')], document.querySelector('#sidebar').classList.contains('collapsed'));