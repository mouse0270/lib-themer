Hooks.once('lib-themerInit', () => {
	// SET MODULE SETTINGS
	libThemer.setting('register', 'themeSettings', {
		type: Object,
		default: {},
		scope: 'world',
		config: false
	});

	// SET MODULE SETTINGS
	libThemer.setting('register', 'themePreset', {
		type: String,
		default: "--preset-core-foundry",
		scope: 'client',
		config: false
	});

	game.settings.registerMenu(libThemer.MODULE.name, 'libThemerOptions', {
		name: libThemer.localize('settings.menu.name'),
		label: libThemer.localize('settings.menu.label'),
		hint: libThemer.localize('settings.menu.hint'),
		icon: 'fas fa-bars',
		type: libThemerDialog,
		restricted: false 
	});

	// SET STORE LOCAL OPTIONS
	libThemer.setting('register', 'localStorage', {
		type: String,
		default: "",
		scope: 'world',
		config: true,
		filePicker: "folder"
	});

	// HOOK INTO FOUNDRY
	Hooks.once('ready', async () => {
		libThemer.init();
	});
});