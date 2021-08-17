import { MODULE } from './_module.mjs';
import libThemerDialog from './dialogs/libthemer.mjs';

Hooks.once('setup', () => {
	// SET MODULE SETTINGS
	MODULE.setting('register', 'themeSettings', {
		type: Object,
		default: {},
		scope: 'world',
		config: false
	});

	// SET MODULE SETTINGS
	MODULE.setting('register', 'themePreset', {
		type: String,
		default: "--preset-core-foundry",
		scope: 'client',
		config: false
	});

	game.settings.registerMenu(MODULE.name, 'libThemerOptions', {
		name: MODULE.localize('settings.menu.name'),
		label: MODULE.localize('settings.menu.label'),
		hint: MODULE.localize('settings.menu.hint'),
		icon: 'fas fa-bars',
		type: libThemerDialog,
		restricted: false 
	});

	// SET STORE LOCAL OPTIONS
	MODULE.setting('register', 'userStorage', {
		type: String,
		default: "",
		scope: 'world',
		config: true,
		filePicker: "folder"
	});
});