const TidyHUD = {
	renderPlayerList: async (app, elem, options) => {
		elem[0].querySelectorAll('ol li.player').forEach(elemPlayer => {
			elemPlayer.dataset.tooltip = elemPlayer.textContent;
			elemPlayer.dataset.tooltipDirection = "RIGHT";
		});

		elem[0].classList.toggle('expand-players', options?.showOffline ?? false);

		console.log('TIDYHUD', app, elem, options)
	},
	collapseSidebar: async (app, collapsed) => {
		if (collapsed) {
			const position = parseFloat(document.querySelector(":root").style.getPropertyValue('--sidebar-width')) - document.querySelector('#sidebar').offsetWidth
			document.querySelector('#notifications').style.marginRight = `-${position}px`;
		}else{
			document.querySelector('#notifications').style.marginRight = '0px';
		}

		game.modules.get('lib-themer')?.API.getThemeProperty('--tidy-hud-hotbar-alignment').then(setting => {
			document.querySelector('#hotbar').classList.toggle('sidebar-collapsed', collapsed);
		});
	},
	themerUpdateSetting: async(setting, key, value) => {
		if (key == '--tidy-hud-hotbar-alignment') {
			document.querySelector('#hotbar').classList.remove('align-left', 'align-right');

			if (['left', 'right'].includes(value)) {
				document.querySelector('#hotbar').classList.add(`align-${value}`);
			}
		}
	}
};

Hooks.on('renderPlayerList', TidyHUD.renderPlayerList);
Hooks.on('collapseSidebar', TidyHUD.collapseSidebar);
Hooks.on('lib-themer.UpdateSetting', TidyHUD.themerUpdateSetting);

TidyHUD.renderPlayerList({}, [document.querySelector('aside#players')], {});
TidyHUD.collapseSidebar([document.querySelector('#sidebar')], document.querySelector('#sidebar').classList.contains('collapsed'));

game.modules.get('lib-themer')?.API.getThemeProperty('--tidy-hud-hotbar-alignment').then(setting => {
	TidyHUD.themerUpdateSetting(setting, '--tidy-hud-hotbar-alignment', setting.value);
});