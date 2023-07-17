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