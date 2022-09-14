// GET MODULE CORE
import { MODULE } from './_module.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', () => {
	MODULE.setting('register', 'registeredThemes', {
		type: Object,
		default: {},
		scope: 'world',
		config: false,
	});
	MODULE.setting('register', 'themeSettings', {
		type: Object,
		default: {},
		config: false,
		scope: 'client',
		onChange: (event) => {
			if (MODULE.setting('enableMasterTheme') && game.user.isGM)
				MODULE.setting('masterTheme', event)
		}
	});
	MODULE.setting('register', 'masterTheme', {
		type: Object,
		default: {},
		scope: 'world',
		config: false,
		onChange: (event) => {
			if (MODULE.setting('enableMasterTheme') && !game.user.isGM) {
				MODULE.setting('themeSettings', event);
				for (const [key, theme] of Object.entries(MODULE.setting('registeredThemes'))) {
					game.modules.get(MODULE.ID).API.register(foundry.utils.mergeObject(theme, {
						id: key
					}, { inplace: false }));
				}
			}
		}
	});
	MODULE.setting('register', 'presets', {
		type: Object,
		default: {},
		scope: 'world',
		config: false,
	});

	MODULE.setting('register', 'enableGoogleFonts', {
		type: Boolean,
		default: true,
		scope: 'world',
	});

	MODULE.setting('register', 'fonts', {
		type: Object,
		default: {},
		scope: 'world',
		config: false
	});

	MODULE.setting('register', 'enableMasterTheme', {
		type: Boolean,
		default: false,
		scope: 'world',
	});
	MODULE.setting('register', 'userStorage', {
		type: String,
		default: "",
		scope: 'world',
		filePicker: "folder"
	});
});