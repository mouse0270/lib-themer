// GET REQUIRED LIBRARIES
import './libraries/color.js';
import './libraries/webfont.js';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// GET MODULE CORE
import { MODULE } from './_module.mjs';
import { ThemeDialog } from './dialogs/themer.mjs';

// DEFINE MODULE CLASS
export class Themer {
	static #THEMES = {};
	static #THEME = {};
	static #FONTS = {};

	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	// WHAT IS THIS?
	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	static get hasPermission() {
		return game.permissions.FILES_BROWSE.includes(game.user.role) || (game.modules.get('socketlib')?.active ?? false);
	}

	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	// FUNCTIONS
	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	static async useFilePicker(url, options = { extensions: ['.theme'] }) {
		// IF URL HAS FILE EXTENSION, ASSUME WE ARE LOOKING FOR A SPECIFIC FILE
		let getFile = url.split('/').pop().includes('.');

		return await FilePicker.browse('user', url, options).then(response => {
			let files = !getFile ? response.files : response.files.filter(file => file.toLowerCase().endsWith(url.split('/').pop().toLowerCase()));
			if (files.length > 0 || !getFile) {
				return getFile ? files[0] : response.files;
			}
			throw TypeError(`unable to access ${url}`);
		}).then(files => files).catch((error) => {
			MODULE.debug(error);
			return false;
		});
	}

	static async getFileContent(url) {
		return await fetch(url).then(response => {
			if (response.status >= 200 && response.status <= 299) {
				if (url.split('.').pop().toLowerCase().startsWith('json') || url.split('.').pop().toLowerCase().startsWith('theme')) {
					return response.json();
				}else{
					return response.text();
				}
			}
			throw TypeError("unable to fetch file content");
		}).catch(error => {
			MODULE.debug(error);
			return false;
		})
	}

	static themeRequirementsMet(theme) {
		let requirementsMet = true;

		(theme?.requires ?? []).forEach(requirement => {
			if ((requirement?.type ?? '').toLowerCase() == 'module') {
				if (!(game.modules.get(requirement?.id ?? '')?.active ?? false)) requirementsMet = false;
			}else if ((requirement?.type ?? '').toLowerCase() == 'system') {
				if (game.system.id != requirement?.id) requirementsMet = false;
			}
		});

		return requirementsMet;
	}

	static async registerThemeFromFile(url) {
		let content = await this.getFileContent(await this.useFilePicker(url));
		const fileName = (url) => url.split('/').pop().split('.')[0];

		if (this.themeRequirementsMet(content)) {
			foundry.utils.mergeObject(Themer.#THEMES, {
				[content?.id ?? fileName(url)]: foundry.utils.mergeObject({ title: content?.id ?? fileName(url) }, content)
			});

			return Themer.setTheme(content);
		}else {
			MODULE.warn(`${game.i18n.localize(content?.title)} requirements were not met. Theme will not be loaded.`);
			return false;
		}
	}

	static async setTheme(theme) {
		delete theme.title;

		Themer.#THEME = foundry.utils.mergeObject(foundry.utils.mergeObject(Themer.#THEME, foundry.utils.mergeObject({ title: theme?.id ?? '' }, theme)), MODULE.setting('themeSettings'), { inplace: false });
		return Themer.#THEME;
	}

	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	// CUSTOM CSS SUPPORTS FUNCTIONS
	/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
	static setColorContrast(property, value) {
		//Update CSS Variable
		document.querySelector(":root").style.setProperty(`${property}-contrast`, tinycolor.mostReadable(tinycolor(value).toHex8String(), ['#000', '#fff']));
	}

	static setColorVariations(property, value) {
		const intensity = 10;
		const colors = {
			light: tinycolor(value).lighten(intensity * 2).toHex8String(),
			base: tinycolor(value).toHex8String(),
			dark: tinycolor(value).darken(intensity * 2).toHex8String()
		}
		// Set Shaded Colors
		document.querySelector(":root").style.setProperty(`${property}-shaded`, tinycolor.mostReadable(colors['base'], [
			tinycolor(colors['base']).lighten(50).toHex8String(), 
			tinycolor(colors['base']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-light`, tinycolor(colors['light']).toHex8String());
		document.querySelector(":root").style.setProperty(`${property}-light-shaded`, tinycolor.mostReadable(colors['light'], [
			tinycolor(colors['light']).lighten(50).toHex8String(), 
			tinycolor(colors['light']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-dark`, tinycolor(colors['dark']).toHex8String());
		document.querySelector(":root").style.setProperty(`${property}-dark-shaded`, tinycolor.mostReadable(colors['dark'], [
			tinycolor(colors['dark']).lighten(50).toHex8String(), 
			tinycolor(colors['dark']).darken(50).toHex8String()
		]));
	}
	
	static setColorPalette(property, value) {
		const intensity = 7;
		const colors = {
			100: tinycolor(value).lighten(intensity * 4).toHex8String(),
			200: tinycolor(value).lighten(intensity * 3).toHex8String(),
			300: tinycolor(value).lighten(intensity * 2).toHex8String(),
			400: tinycolor(value).lighten(intensity * 1).toHex8String(),
			500: tinycolor(value).toHex8String(),
			600: tinycolor(value).darken(intensity * 1).toHex8String(),
			700: tinycolor(value).darken(intensity * 2).toHex8String(),
			800: tinycolor(value).darken(intensity * 3).toHex8String(),
			900: tinycolor(value).darken(intensity * 4).toHex8String()
		}

		// Set Palette Range Colors 100-900
		document.querySelector(":root").style.setProperty(`${property}-100`, colors['100']);
		document.querySelector(":root").style.setProperty(`${property}-200`, colors['200']);
		document.querySelector(":root").style.setProperty(`${property}-300`, colors['300']);
		document.querySelector(":root").style.setProperty(`${property}-400`, colors['400']);
		document.querySelector(":root").style.setProperty(`${property}-500`, `var(${property})`);
		document.querySelector(":root").style.setProperty(`${property}-600`, colors['600']);
		document.querySelector(":root").style.setProperty(`${property}-700`, colors['700']);
		document.querySelector(":root").style.setProperty(`${property}-800`, colors['800']);
		document.querySelector(":root").style.setProperty(`${property}-900`, colors['900']);

		// Set Contrast Colors
		document.querySelector(":root").style.setProperty(`${property}-100-contrast`, tinycolor.mostReadable(colors['100'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-200-contrast`, tinycolor.mostReadable(colors['200'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-300-contrast`, tinycolor.mostReadable(colors['300'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-400-contrast`, tinycolor.mostReadable(colors['400'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-500-contrast`, `var(${property}-contrast)`);
		document.querySelector(":root").style.setProperty(`${property}-600-contrast`, tinycolor.mostReadable(colors['600'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-700-contrast`, tinycolor.mostReadable(colors['700'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-800-contrast`, tinycolor.mostReadable(colors['800'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-900-contrast`, tinycolor.mostReadable(colors['900'], ['#000', '#fff']));

		// Set Lightest - Darkest
		document.querySelector(":root").style.setProperty(`${property}-lightest`, `var(${property}-100)`);
		document.querySelector(":root").style.setProperty(`${property}-lightest-contrast`, `var(${property}-100-contrast)`);
		document.querySelector(":root").style.setProperty(`${property}-light`, `var(${property}-300)`);
		document.querySelector(":root").style.setProperty(`${property}-light-contrast`, `var(${property}-300-contrast)`);
		document.querySelector(":root").style.setProperty(`${property}-dark`, `var(${property}-700)`);
		document.querySelector(":root").style.setProperty(`${property}-dark-contrast`, `var(${property}-700-contrast)`);
		document.querySelector(":root").style.setProperty(`${property}-darkest`, `var(${property}-900)`);
		document.querySelector(":root").style.setProperty(`${property}-darkest-contrast`, `var(${property}-900-contrast)`);
	}
	
	static setColorShades(property, value) {
		const intensity = 7;
		const colors = {
			100: tinycolor(value).lighten(intensity * 4).toHex8String(),
			200: tinycolor(value).lighten(intensity * 3).toHex8String(),
			300: tinycolor(value).lighten(intensity * 2).toHex8String(),
			400: tinycolor(value).lighten(intensity * 1).toHex8String(),
			500: tinycolor(value).toHex8String(),
			600: tinycolor(value).darken(intensity * 1).toHex8String(),
			700: tinycolor(value).darken(intensity * 2).toHex8String(),
			800: tinycolor(value).darken(intensity * 3).toHex8String(),
			900: tinycolor(value).darken(intensity * 4).toHex8String()
		}

		// Set Shaded Colors
		document.querySelector(":root").style.setProperty(`${property}-shaded`, tinycolor.mostReadable(colors['500'], [
			tinycolor(colors['500']).lighten(50).toHex8String(), 
			tinycolor(colors['500']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-100-shaded`, tinycolor.mostReadable(colors['100'], [
			tinycolor(colors['100']).lighten(50).toHex8String(), 
			tinycolor(colors['100']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-200-shaded`, tinycolor.mostReadable(colors['200'], [
			tinycolor(colors['200']).lighten(50).toHex8String(), 
			tinycolor(colors['200']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-300-shaded`, tinycolor.mostReadable(colors['300'], [
			tinycolor(colors['300']).lighten(50).toHex8String(), 
			tinycolor(colors['300']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-400-shaded`, tinycolor.mostReadable(colors['400'], [
			tinycolor(colors['400']).lighten(50).toHex8String(), 
			tinycolor(colors['400']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-500-shaded`, `var(${property}-shaded)`);
		document.querySelector(":root").style.setProperty(`${property}-600-shaded`, tinycolor.mostReadable(colors['600'], [
			tinycolor(colors['600']).lighten(50).toHex8String(), 
			tinycolor(colors['600']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-700-shaded`, tinycolor.mostReadable(colors['700'], [
			tinycolor(colors['700']).lighten(50).toHex8String(), 
			tinycolor(colors['700']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-800-shaded`, tinycolor.mostReadable(colors['800'], [
			tinycolor(colors['800']).lighten(50).toHex8String(), 
			tinycolor(colors['800']).darken(50).toHex8String()
		]));
		document.querySelector(":root").style.setProperty(`${property}-900-shaded`, tinycolor.mostReadable(colors['900'], [
			tinycolor(colors['900']).lighten(50).toHex8String(), 
			tinycolor(colors['900']).darken(50).toHex8String()
		]));
	}

	static setColorButtonStates(property, value) {
		const intensity = 10;
		const colors = {
			base: tinycolor(value).toHex8String(),
			hover: tinycolor(value).lighten(intensity * 1).toHex8String(),
			active: tinycolor(value).darken(intensity * 1).toHex8String(),
		}
		
		// Set Button States
		document.querySelector(":root").style.setProperty(`${property}-outline`, tinycolor(colors['base']).darken((intensity - 3) * 1).toHex8String());
		document.querySelector(":root").style.setProperty(`${property}-hover`, colors['hover']);
		document.querySelector(":root").style.setProperty(`${property}-hover-outline`, tinycolor(colors['hover']).darken((intensity - 3) * 1).toHex8String());
		document.querySelector(":root").style.setProperty(`${property}-hover-contrast`, tinycolor.mostReadable(colors['hover'], ['#000', '#fff']));
		document.querySelector(":root").style.setProperty(`${property}-active`, colors['active']);
		document.querySelector(":root").style.setProperty(`${property}-active-outline`, tinycolor(colors['active']).darken((intensity - 3) * 1).toHex8String());
		document.querySelector(":root").style.setProperty(`${property}-active-contrast`, tinycolor.mostReadable(colors['active'], ['#000', '#fff']));
	}

	static setManageLibrary(property, value) {
		if (value == 'true') {
			(Themer.#THEME[property]?.files ?? []).forEach(file => {
				const isScriptFile = (file?.type ?? "").includes('javascript') || (file?.type ?? "").includes('js') || (file?.name ?? "").endsWith('js')
				// Make sure file isn't already active
				if ((document.querySelector(`head ${isScriptFile ? 'script' : 'link'}[name="${property}"][${isScriptFile ? 'src' : 'href'}="${file?.name}"]`)?.length ?? 0) == 0) {
					if (isScriptFile) {
						let script = document.createElement('script');
						script.setAttribute('name', property);
						script.src = file?.name;
						
						document.querySelector(`head script:last-of-type`).insertAdjacentElement('afterend', script);
					}else{
						document.querySelector(`head link:last-of-type`).insertAdjacentHTML('afterend', `<link name="${property}" href="${file?.name}" rel="stylesheet" type="text/css" />`);
					}
				}
			})
		}else{
			const hasScriptFile = (Themer.#THEME[property]?.files ?? []).filter(file => (file?.type ?? "").includes('javascript') || (file?.type ?? "").includes('js') || (file?.name ?? "").endsWith('js')).length >= 1;
			if (hasScriptFile && (document.querySelectorAll(`head script[name="${property}"]`)?.length ?? 0) > 0) {
				Dialog.confirm({
					id: `${MODULE.ID}-has-script`,
					title: MODULE.localize('title'),
					content: `<p style="margin-top: 0px;">${MODULE.localize('dialog.scriptreset.message')}</p>`,
					yes: (elemDialog) => {
						location.reload();
					},
					no: () => {
						return 'Player Rejected Setting'
					}
				}).then(response => {
				});
			}
			(document.querySelectorAll(`head [name="${property}"]`) ?? []).forEach(file => {
				file?.remove() ?? false;
			});
		}
	}

	// DEFINE API
	static async installAPI() {
		let apiQueue = 0;
		game.modules.get(MODULE.ID).API = {
			register: async function(theme) {
				apiQueue++;

				if (typeof theme == "object") {
					MODULE.log('Register Theme from Object', theme);
					if (theme?.id ?? false) {
						foundry.utils.mergeObject(Themer.#THEMES, { [theme.id]: theme });
						await Themer.setTheme(theme);
					}else{
						MODULE.error('No Theme ID provided in:', theme)
					}
				}else if (theme.endsWith('.theme')) {
					MODULE.log('Register Theme from file', theme, apiQueue);
					await Themer.registerThemeFromFile(theme);
				}
				apiQueue--;
				MODULE.log('Theme Registered', theme, apiQueue);
					
				if (apiQueue == 0) {
					if (Themer.hasPermission) {
						await MODULE.setting('registeredThemes', Themer.#THEMES);
						MODULE.log('THEMES UPDATED', MODULE.setting('registeredThemes'));
					}

					for await (const [theme, values] of Object.entries(Themer.#THEMES)) {
						for await (const [property, value] of Object.entries(foundry.utils.mergeObject(values, Themer.#THEME, { inplace: false, insertKeys: false}))) {
							if (typeof value == 'object') {
								game.modules.get(MODULE.ID).API.setCSSVariable(property, value.value ?? value.default)
							}
						}
					}
				}
			},
			setCSSVariable: async function(property, value) {
				//Update CSS Variable
				document.querySelector(":root").style.setProperty(property, value);

				if ((Themer.#THEME[property]?.type ?? "") == "color") {
					Themer.setColorContrast(property, value);
				}
				if ((Themer.#THEME[property]?.type ?? "") == "color" && (Themer.#THEME[property]?.metadata?.variations ?? false)) {
					Themer.setColorVariations(property, value);
				}
				if ((Themer.#THEME[property]?.type ?? "") == "color" && (Themer.#THEME[property]?.metadata?.palette ?? false)) {
					Themer.setColorPalette(property, value);
				}
				if ((Themer.#THEME[property]?.type ?? "") == "color" && (Themer.#THEME[property]?.metadata?.shades ?? false)) {
					if (!(Themer.#THEME[property]?.metadata?.palette ?? false)) {
						MODULE.warn(`${game.i18n.localize(Themer.#THEME[property].name)} tried to initialize color type shade without also setting palette to true`);
					}else{
						Themer.setColorShades(property, value);
					}
				}
				if ((Themer.#THEME[property]?.type ?? "") == "color" && (Themer.#THEME[property]?.metadata?.buttons ?? false)) {
					Themer.setColorButtonStates(property, value);
				}
				
				if ((Themer.#THEME[property]?.type ?? "") == "background") {
					document.querySelector(":root").style.removeProperty(property) ?? false;
					document.querySelector(":root").style.setProperty(`${property}-blend`, value?.blend ?? 'normal');
					document.querySelector(":root").style.setProperty(`${property}-url`, value?.url != "url(/)" ? value?.url : '' ?? '');
				}
				
				if ((Themer.#THEME[property]?.type ?? "") == "library") {
					Themer.setManageLibrary(property, value);
					for await (const [ssProperty, ssValue] of Object.entries(Themer.#THEME[property]?.settings ?? [])) {
						if (typeof ssValue == 'object') {
							Themer.#THEME[ssProperty] = foundry.utils.mergeObject(MODULE.setting('themeSettings')?.[ssProperty] ?? {}, ssValue);
							if ((Themer.#THEME[ssProperty].value ?? Themer.#THEME[ssProperty].default) ?? false) {
								game.modules.get(MODULE.ID).API.setCSSVariable(ssProperty, Themer.#THEME[ssProperty].value ?? Themer.#THEME[ssProperty].default);
							}
						}
					}
				}

				// Save Setting
				MODULE.setting('themeSettings', foundry.utils.mergeObject(MODULE.setting('themeSettings'), {
					[property]: {
						value: value
					}
				}, { inplace: false }));
			},
			getThemeProperty: async function(property) {
				return await Themer.#THEME[property] ?? false;
			}
		};
	}
	
	static init = () => {
		this.installAPI();
		this.getThemes();

		const googleFonts = Object.keys(MODULE.setting('fonts'));
		if (googleFonts.length > 0) {
			WebFont.load({
				google: {
					families: googleFonts
				},
				fontactive: (familyName, fvd) => { 
					FontConfig.loadFont(familyName, MODULE.setting('fonts')[familyName]);
				}
			});
		}
	}

	// Get Theme Files From libThemer and userStorage
	static async getThemes() { 
		if (!this.hasPermission) {
			for await (const [key, theme] of Object.entries(MODULE.setting('registeredThemes'))) {
				game.modules.get(MODULE.ID).API.register(foundry.utils.mergeObject(theme, {
					id: key
				}, { inplace: false }));
			}

			return false;
		}

		let themes = await this.useFilePicker(`./modules/${MODULE.ID}/themes`);
		themes = themes.concat(await this.useFilePicker(MODULE.setting("userStorage")) ?? []);
		
		for await (const theme of themes) {
			game.modules.get(MODULE.ID).API.register(theme);
		}

		// register any modules as they init
		Hooks.callAll(`${MODULE.ID}.Ready`, game.modules.get(MODULE.ID).API);
	}

	static async renderSidebarTab (app, elem, options) {
		if (app.options.id == "settings") {
			elem[0].querySelector('#settings-game button[data-action="controls"]').insertAdjacentHTML('afterend', `<button data-action="themer">
				<i class="fa-solid fa-palette"></i> Configure Theme
			</button>`);

			if (MODULE.setting('enableMasterTheme') && !game.user.isGM) {
				elem[0].querySelector('#settings-game button[data-action="themer"]').classList.add('hidden');
			}

			elem[0].querySelector('#settings-game button[data-action="themer"]').addEventListener('click', async (event) => {
				new ThemeDialog(Themer.#THEMES).render(true);
			})
		}
	}
	
	static async renderFontConfig(app, elem, options) {
		if (MODULE.setting('enableGoogleFonts') ?? false) {
			elem[0].querySelector('.font-preview p').innerHTML = 'The five boxing wizards jumped quickly!';

			elem[0].querySelector('.form-group .form-fields label:last-of-type').insertAdjacentHTML('afterend', `<label class="checkbox">
				<input type="radio" name="type" value="google"> Google Fonts
			</label>`);

			if (elem[0].querySelectorAll('hr')?.length == 1 && Object.entries(MODULE.setting('fonts')).length > 0) elem[0].querySelector('.form-group').insertAdjacentHTML('beforebegin', '<hr />');
			for (const [key, value] of Object.entries(MODULE.setting('fonts'))) {
				const elemPos = Array.from(elem[0].querySelectorAll('hr')).pop();
				elemPos.insertAdjacentHTML('beforebegin', `<div class="control custom-font google-font" data-family="${key}" data-index="0" data-action="select">
					<span><i class="fa-brands fa-google"></i> ${key}</span>
					<a class="control" data-action="delete" title="Remove font">
						<i class="fa-solid fa-xmark"></i>
					</a>
				</div>`);

				const googleFont = Array.from(elem[0].querySelectorAll('.control.custom-font.google-font')).pop();
				googleFont.addEventListener('click', (event) => {
					if (event.srcElement.classList.contains('fa-xmark') || (event.srcElement?.dataset?.action ?? '') == 'delete') return false;
					elem[0].querySelectorAll('.control.custom-font').forEach(elemFont => elemFont.classList.remove('selected'));
					googleFont.classList.add('selected');
					elem[0].querySelector('.font-preview').style.fontFamily = googleFont.dataset.family;

					app.setPosition();
				});
				googleFont.querySelector('a[data-action="delete"]').addEventListener('click', (event) => {
					let googleFonts = MODULE.setting('fonts');
					delete googleFonts[event.target.closest('.custom-font.google-font').dataset.family];
					MODULE.setting('fonts', googleFonts).then(response => {
						const isSelected = event.target.closest('.custom-font.google-font').classList.contains('selected');
						event.target.closest('.custom-font.google-font').remove();

						if (isSelected && Object.keys(MODULE.setting('fonts')).length > 0) elem[0].querySelectorAll('.control.custom-font')[0].click();

						app.setPosition();
					});
				});
			}
			if (elem[0].querySelectorAll('.control.custom-font.selected')?.length == 0 && Object.keys(MODULE.setting('fonts')).length > 0) elem[0].querySelectorAll('.control.custom-font')[0].click();
							
			app.setPosition();

			elem[0].querySelectorAll('.form-group .form-fields input[type="radio"]').forEach(elemInput => {
				elemInput.addEventListener('change', (event) => {
					if (event.target.value == "google") {
						setTimeout(() => {
							elem[0].querySelector('.form-group select[name="weight"]').closest('.form-group').classList.add('hidden');
							elem[0].querySelector('.form-group select[name="style"]').closest('.form-group').classList.add('hidden');
							elem[0].querySelector('.form-group input[name="src"]').closest('.form-group').classList.add('hidden');
							elem[0].querySelector('button[name="add-google-font"]').classList.remove('hidden');
							elem[0].querySelector('button[name="add-font"]').classList.add('hidden');

							// Add Warning
							event.target.closest('.form-group').querySelector('p.hint').insertAdjacentHTML('afterend', `<div class="notification warning">Please note that by adding a font from the Google Fonts API, Google will have access to your IP address. If you are uncomfortable with this, please don't use this feature or don't complain if you do.</div>`)
							
							// Focus Input
							elem[0].querySelector('.form-group input[name="family"]').focus();
							
							app.setPosition();
						}, 1);
					}else{
						event.target.closest('.form-group').querySelector('p.hint + .notification')?.remove() ?? false;
						elem[0].querySelector('button[name="add-font"]').classList.remove('hidden');
						elem[0].querySelector('button[name="add-google-font"]').classList.add('hidden');
					}
				});
			})

			function addGoogleFont(event) {
				event.preventDefault();
				var selectedFontType = elem[0].querySelector('.form-group .form-fields input[type="radio"]:checked').value;

				if (selectedFontType == 'google' && elem[0].querySelector('.form-group input[name="family"]').value.length > 0) {
					const fontName = elem[0].querySelector('.form-group input[name="family"]').value
					event.target.disabled = true;

					if (Object.keys(MODULE.setting('fonts')).includes(fontName)) {
						ui.notifications.error(`<strong>${MODULE.TITLE}</strong> Font Name Already Registered.`);
						return false;
					}

					WebFont.load({
						google: {
							families: [fontName]
						},
						fontactive: (familyName, fvd) => {
							let customFonts = MODULE.setting('fonts');
							customFonts[familyName] = {
								editor: true,
								googleFont: true,
								fonts: []
							};

							MODULE.setting('fonts', customFonts).then(response => {
								FontConfig.loadFont(familyName, customFonts[familyName]);
								app.render(true);
							});
							event.target.disabled = false;
						},
						fontinactive: (familyName, fvd) => {
							ui.notifications.error(`<strong>${MODULE.TITLE}</strong> Unable to add google font.`)
							event.target.disabled = false;
						}
					});
				}
			}
			
			let addGoogleFontButton = elem[0].querySelector('button[name="add-font"]').cloneNode(true);
			addGoogleFontButton.name = "add-google-font";
			addGoogleFontButton.setAttribute('data-action', "add-google-font");
			addGoogleFontButton.classList.add('hidden');
			elem[0].querySelector('.form-group input[name="family"]').closest('.form-group').insertAdjacentHTML('afterend', addGoogleFontButton.outerHTML);
			elem[0].querySelector('button[name="add-google-font"]').addEventListener('click', addGoogleFont);
		}
	}
}