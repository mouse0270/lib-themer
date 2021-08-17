// CORE MODULE IMPORT
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// IMPORT MODULE FUNCTIONALITY
import LibThemerES from './lib-themer.mjs';

Hooks.once('ready', () => {
	LibThemerES.api();

	MODULE.api.registerThemes(`./modules/${MODULE.name}/themes/`).then(response => {
		MODULE.api.setTheme();
	});
});
