Hooks.once('lib-themerInit', () => {
	// SET MODULE SETTINGS
	libThemer.setting('register', 'themeSettings', {
		type: Object,
		default: {},
		scope: 'world',
		config: false
	});

	game.settings.registerMenu(libThemer.MODULE.name, 'libThemerOptions', {
		name: libThemer.localize('setting.menu.name'),
		label: libThemer.localize('setting.menu.label'),
		hint: libThemer.localize('setting.menu.hint'),
		icon: 'fas fa-bars',
		type: libThemerDialog,
		restricted: false 
	});

	// HOOK INTO FOUNDRY
	Hooks.once('ready', async () => {
		libThemer.init();
		libThemer.gameIsReady();
	});
});