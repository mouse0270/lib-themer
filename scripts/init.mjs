// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

// GET CORE MODULE
import { Themer } from './module.mjs';

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// 🧙 DEVELOPER MODE HOOKS -> devModeReady
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(MODULE.ID, 'level', {
		choiceLabelOverrides: {
			0: 'NONE',
			1: 'ERROR',
			2: 'WARN',
			3: 'DEBUG',
			4: 'INFO',
			5: 'ALL'
		}
	});
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> READY
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('init', () => {
	Hooks.on("renderSidebarTab", Themer.renderSidebarTab);
});
Hooks.once('ready', async () => {	
	Themer.init();
	
	// Create and Set Player CSS Variables
	Themer.setPlayerColors();
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> MODULE FUNCTIONS
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.on('renderFontConfig', Themer.renderFontConfig);

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// HANDLEBAR FUNCTIONS
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Handlebars.registerHelper("incIndex", function(value, options) {
    return parseInt(value) + 1;
});


/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// PF2E HOOKS -> MODULE FUNCTIONS
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.on(`${MODULE.ID}.Ready`, async () => {
	if (!(game.modules.get('pf2e-dorako-ui')?.active ?? false)) return;

	// Attach PF2e Dorako UI Theme
	const theme = {
		id: 'cssPF2eDorakoUI',
		file: `./modules/lib-themer/themes/assets/styles/pf2e-dorako-ui.css`,
	};
	
	document.querySelector(`head style[name="${MODULE.ID}"]`).insertAdjacentHTML('beforebegin', `<link name="${theme.id}" href="${theme?.file}" rel="stylesheet" type="text/css" />`);

	Hooks.on('lib-themer.UpdateSetting', async (setting, key, value) => {
		if (!(['--sheet-bg', '--sheet-sidebar-color'].includes(key))) return;

		// Define Path to PF2e Dorako UI Images
		const path = `/modules/pf2e-dorako-ui/img`;

		if (key == '--sheet-bg') {
			// Fix for Dark Mode having a 4 at the end of the color
			let color = value == 'dark' ? 'dark4' : value;
			// If inherit, use default colors, otherwise force the color
			let bgLight = `url("${path}/background-${color == 'inherit' ? 'light' : color}.webp")`;
			let bgDark = `url("${path}/background-${color == 'inherit' ? 'dark4' : color}.webp")`;

			game.modules.get(MODULE.ID).api.setCSSVariable(`--sheet-light`, bgLight);
			game.modules.get(MODULE.ID).api.setCSSVariable(`--sheet-dark`, bgDark);
		}
		
		else if (key == '--sheet-sidebar-color') {
			game.modules.get(MODULE.ID).api.setCSSVariable(`${key}-bg`, `url("${path}/${value}_sidebar_top.webp"), url("${path}/${value}_sidebar_bottom.webp")`);
			game.modules.get(MODULE.ID).api.setCSSVariable(`--sheet-header-color-bg`, `url("${path}/${value == 'blue' ? 'blue_' : ''}header.webp")`);
		}
	})
});