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
				for (const [key, value] of Object.entries(event)) {
					if (MODULE.setting('themeSettings')[key].value != value.value) {
						game.modules.get(MODULE.ID).API.setCSSVariable(key, value.value)
					}
				};
				MODULE.setting('themeSettings', event);
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
		onChange: (event) => {
			if (MODULE.setting('enableMasterTheme') && !game.user.isGM) {
				document.querySelector('#settings-game button[data-action="themer"]').style.display = 'none';
				document.querySelector('#lib-themer-dialog .header-button.close').click() ?? false;
			}else{
				document.querySelector('#settings-game button[data-action="themer"]').style.removeProperty('display');
			}
		}
	});
	MODULE.setting('register', 'userStorage', {
		type: String,
		default: "",
		scope: 'world',
		filePicker: "folder"
	});

	class CreateDefaultPresets extends FormApplication {
		constructor(...args) {
			super(...args);
			return new Dialog({
				title: MODULE.localize('settings.presets.createDefault.name'),
				content: `<p style="margin-bottom:1rem;">${MODULE.localize('settings.presets.createDefault.content')}</p>`,
				buttons: {
					confirm: {
						icon: '<i class="fas fa-check"></i>',
						label: MODULE.localize('settings.presets.createDefault.confirm'),
						callback: async () => {
							const presets = MODULE.setting('presets');
							let presetAzuraSlate = { 
								[`${MODULE.ID}AzuraSlate`]: {"name":"Azura Slate","theme":{"--color-shadow-primary":{"value":"#ff0000ff"},"--font-primary":{"value":"\"Signika\""},"--font-awesome":{"value":"\"Font Awesome 6 Pro\""},"cssDnDColors":{"value":"true"},"--tidy-sidebar-padding-y":{"value":"0px"},"--tidy-sidebar-padding-x":{"value":"0px"},"--palette-primary":{"value":"#e9fbffff"},"--tidy-sidebar-border-radius":{"value":"0px"},"--app-background":{"value":"#4a536ccc"},"--palette-secondary":{"value":"#638f91ff"},"cssTidySidebar":{"value":"true"},"--app-background-image":{"value":{"url":"","blend":"normal"}},"--palette-tertiary":{"value":"#d7efe7ff"},"--app-dialog-background":{"value":"#ecececff"},"--app-dialog-background-image":{"value":{"url":"","blend":"normal"}},"cssfoundryVTTColors":{"value":"true"},"--palette-danger":{"value":"#c92030ff"}}}
							}, presetSlateGray = {
								[`${MODULE.ID}SlateGray`]: {"name":"Slate Gray","theme":{"--color-shadow-primary":{"value":"#ff0000ff"},"--font-primary":{"value":"\"Signika\""},"--font-awesome":{"value":"\"Font Awesome 6 Pro\""},"cssDnDColors":{"value":"true"},"--tidy-sidebar-padding-y":{"value":"0px"},"--tidy-sidebar-padding-x":{"value":"0px"},"--palette-primary":{"value":"#97a0c6ff"},"--tidy-sidebar-border-radius":{"value":"0px"},"--app-background":{"value":"#4d5e6bcc"},"--palette-secondary":{"value":"#aa8a6fff"},"cssTidySidebar":{"value":"true"},"--app-background-image":{"value":{"url":"","blend":"normal"}},"--palette-tertiary":{"value":"#6faa9aff"},"--app-dialog-background":{"value":"#27343eff"},"--app-dialog-background-image":{"value":{"url":"","blend":"normal"}},"cssfoundryVTTColors":{"value":"true"},"--palette-danger":{"value":"#c92030ff"}}}
							}

							if (!presets.hasOwnProperty(`${MODULE.ID}AzuraSlate`)) {
								await MODULE.setting('presets', foundry.utils.mergeObject(MODULE.setting('presets'), presetAzuraSlate, { inplace: false }));
							}

							if (!presets.hasOwnProperty(`${MODULE.ID}SlateGray`)) {
								await MODULE.setting('presets', foundry.utils.mergeObject(MODULE.setting('presets'), presetSlateGray, { inplace: false }));
							}
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: MODULE.localize('settings.presets.createDefault.cancel')
					}
				}
			})
		}
	}

	game.settings.registerMenu(MODULE.ID, "mySettingsMenu", {
		name: `${MODULE.ID}.settings.presets.createDefault.name`,
		label: `${MODULE.ID}.settings.presets.createDefault.label`,      // The text label used in the button
		hint: `${MODULE.ID}.settings.presets.createDefault.hint`,
		icon: "fa-regular fa-paintbrush-pencil",               // A Font Awesome icon used in the submenu button
		type: CreateDefaultPresets,   // A FormApplication subclass
		restricted: true                   // Restrict this submenu to gamemaster only?
	});
});