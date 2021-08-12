let libThemer = null;
class libThemerDialog extends FormApplication {
	constructor(themes) {
		super(themes)
		this.THEMES = libThemer.setting('themeSettings');
	}

	static get defaultOptions() {
		return { 
			...super.defaultOptions,
			title: `${libThemer.MODULE.title} Settings`,
			id: "libThemerDialog",
			template: `modules/${libThemer.MODULE.name}/templates/dialog.hbs`,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		}
	}

	getData() {
		return {
			themes: this.THEMES
		}
	}

	activateListeners(html) {
		$(html).find('main .lib-themer-dialog-content').on('scroll', (event) => {
			$(html).find('main > .lib-themer-dialog-title').toggleClass('has-shadow', $(event.currentTarget).scrollTop() > 5);
		});

		$(html).find('nav > ul').children("li").sort(function(a, b) {
			var upA = $(a).data('sort').toUpperCase();
			var upB = $(b).data('sort').toUpperCase();
			return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
		}).appendTo($(html).find('nav > ul'));
		$(html).find('nav > ul > li[data-sort="lib-themer"]').prependTo($(html).find('nav > ul'));

		$(html).find('nav li a').on('click', (event) => {
			let $element = $(event.currentTarget);
			let $listElement = $element.closest('li');
			let theme = Object.extend(libThemer.themes, this.THEMES);

			theme = theme[Object.keys(theme).filter(theme => theme == $element.data('load'))];

			if (!$listElement.hasClass('active')) {
				// Deactivate current Item
				$element.closest('ul').find('li.active').removeClass('active');

				$('#libThemerDialog .lib-themer-dialog-content').html('');
				const supportedTypes = ["color", "shades", "palette", "stylesheet", "imagevideo"];
	
				for (let [key, setting] of Object.entries(theme)) {
					if (supportedTypes.includes(setting.type)) {
						let settings = Object.extend(true, {
							name: `lib-themer.${key.substr(2).replace(/-/g, '.')}.name`,
							hint: `lib-themer.${key.substr(2).replace(/-/g, '.')}.hint`,
						}, setting)
						let template = `./modules/lib-themer/templates/controls/${settings.type}.hbs`;
						Handlebars.renderTemplate(template, Object.extend(settings, { property: key })).then(response => {
							let $element = $(response);
							$('#libThemerDialog .lib-themer-dialog-content').append($element);
							// Handle if type is color picker
							$element.find('input[is="colorpicker-input"]').on('pickerDone pickerChange', event => {
								let $input = $(event.currentTarget);
								let colorName = $input.attr('name');
								let color = event.detail.hex;
								let colors = null;
								let settingFor = $(html).find('nav li.active a').data('load');
								let settingName = $input.attr('name')
	
								if ($input.data('type') == 'color' || $input.data('type') == 'shades') {
									colors = libThemer.generateColor(colorName, color, $input.data('type'))
								}else if ($input.data('type') == 'palette') {
									colors = libThemer.generatePalette(colorName, color);
								}

								// Update Color
								this.THEMES[settingFor][settingName].default = color;
	
								if (colors != null) libThemer.setTheme(settingFor, 'setColors', colors)
							});

							// Handle if type is checkbox
							$element.find('input[type="checkbox"]').on('change', event => {
								let $input = $(event.currentTarget);
								let settingFor = $(html).find('nav li.active a').data('load');
								let settingName = $input.attr('name');

								// Update Color
								this.THEMES[settingFor][settingName].default = $input.is(':checked');

								libThemer.toggleStyleSheet(`${settingName}`, this.THEMES[settingFor][settingName]);
							});

							// Handle if type is imagevideo
							if ($element.hasClass('form-group-file-picker')) {
								// Set Values
								for (const [key, imageProperty] of Object.entries(setting.default)) {
									if (key.endsWith('-blend-mode')) {
										$element.find('select').val(imageProperty);
									}else{
										$element.find('input[type="text"]').val(imageProperty.length >= 1 ? `${imageProperty}` : '');
									}
								}

								$element.find('button[data-type="imagevideo"]').on('click', (event) => {
									const filePicker = new FilePicker({
										type: 'imagevideo',
										current: $(event.currentTarget).closest('.form-fields').find('input[type="text"]').val(),
										callback: path => {
											$(event.currentTarget).closest('.form-fields').find('input[type="text"]').val(path).trigger('change');
										}
									});
									return filePicker.browse();
								});
								$element.find('select').on('change', (event) => { 
									$(event.currentTarget).closest('.form-fields').find('input[type="text"]').trigger('change');
								});
								$element.find('input[type="text"]').on('change', (event) => {
									let $input = $(event.currentTarget);
									let settingFor = $(html).find('nav li.active a').data('load');
									let settingName = $input.attr('name');
									// Update Color
									let imageProperties = {};
									imageProperties[`${settingName}-blend-mode`] = $input.closest('.form-fields').find('select').val();
									imageProperties[settingName] = $input.val();

									this.THEMES[settingFor][settingName].default = imageProperties;

									libThemer.setTheme(settingFor, 'setImage', imageProperties);
								});
							}
						});
					}
				}

				$listElement.addClass('active');
			}
		});
		$(html).find('nav li:first-child a').trigger('click');
	}

	async close(options) { 
		// User closed application without saving
		if (typeof options == 'undefined') {
			libThemer.LOG('Restore saved settings');
			libThemer.setTheme();
		}

		// Default Close
		return await super.close(options);
	}

	async _updateObject(event, formData) {
		let themeSettings = libThemer.setting('themeSettings');
		themeSettings = Object.extend(true, themeSettings, this.THEMES);

		libThemer.setting('themeSettings', themeSettings);
	}
}

Hooks.once('lib-themerIsLoaded', () => {

	class LibThemer extends MousesLib {
		constructor(module) {
			super(module);

			// Store Active Colors
			this.themes = {};
			this.cssVariables = {};
			this.stylesheets = {};

			this.gameReady = false;

			game.modules.get("lib-themer").registerTheme = this.registerTheme;
		}

		async init() {
			this.themes = this.setting('themeSettings');

			await this.registerTheme('./modules/lib-themer/themes/lib-themer.json');
			await this.registerLocalThemes(['lib-themer.json']);
			this.setTheme();
		}

		gameIsReady() {
			this.gameReady = true;
			this.setting('themeSettings', this.themes);
		}

		setTheme(theme, property, value) {
			if (typeof theme == 'undefined') {
				// no property was passed, set all colors
				if (typeof property == 'undefined') {
					for (const [key, color] of Object.entries(this.cssVariables)) {
						document.documentElement.style.setProperty(key, color);
					}

					for (const [themeId, settings] of Object.entries(this.themes)) {
						for (const [settingId, setting] of Object.entries(settings).filter(([key, setting]) => setting.type == "imagevideo")) {
							if (typeof setting.default == 'string') {
								document.documentElement.style.setProperty(`${settingId}-blend-mode`, 'normal');
								document.documentElement.style.setProperty(settingId, setting.default.length == 0 ? 'none' : `url('/${setting.default}')`);
							}else if (typeof setting.default == 'object') {
								for (const [key, imageProperty] of Object.entries(setting.default)) {
									if (key.endsWith('-blend-mode')) {
										document.documentElement.style.setProperty(key, imageProperty);
									}else{
										document.documentElement.style.setProperty(key, imageProperty.length >= 1 ? `url('/${imageProperty}')` : 'none');
									}
								}
							}
						}
						
						for (const [settingId, setting] of Object.entries(settings).filter(([key, setting]) => setting.type == "stylesheet")) {
							if (!setting.default) {
								$(`head link[name="${settingId}"]`).remove();
							}else{
								// check if stylesheet exists in DOM | Add if it doesn't
								if ($(`head link[name="${settingId}"]`).length == 0) {
									// Verify File Exists
									this.checkIfFileExists(setting.style).then(file => {
										if ($(`head link[name="${settingId}"]`).length == 0) {
											$('head').append(`<link rel="stylesheet" type="text/css" name="${settingId}" href="${file}">`);
										}
									});
								}
							}
						}
					}
				}
			}else{
				if (typeof property != 'undefined') {
					if (property == 'setColors') {
						for (const [key, color] of Object.entries(value)) {
							document.documentElement.style.setProperty(key, color);
						};
					}else if (property == 'setImage') {
						for (const [key, imageProperty] of Object.entries(value)) {
							if (key.endsWith('-blend-mode')) {
								document.documentElement.style.setProperty(key, imageProperty);
							}else{
								document.documentElement.style.setProperty(key, imageProperty.length >= 1 ? `url('/${imageProperty}')` : 'none');
							}
						}
					}else if (document.documentElement.style.getPropertyValue(property).length >= 1) {
						document.documentElement.style.setProperty(property, value.length >= 1 ? `url('/${value}')` : 'none');
					}
				}
			}
		}

		registerLocalThemes = async (exclude) => {
			exclude = typeof exclude == 'undefined' ? [] : exclude;
			let files = await FilePicker.browse('user', `./modules/lib-themer/themes/`, { extensions: ['.json'] }).then(response => {
				return response.files.filter(file => !exclude.includes(file.toLowerCase().split('/').pop()));
			});

			for (const file of files) {
				await this.registerTheme(file);
			};
		}

		toggleStyleSheet = (stringId, option) => {
			if (!option.style.startsWith('./'))  option.style = `./modules/lib-themer/themes/${option.style}`;
			if (option.default) {
				this.checkIfFileExists(option.style).then(styleSheet => {
					if ($(`head link[name="${stringId}"]`).length == 0) {
						$('head').append(`<link rel="stylesheet" type="text/css" name="${stringId}" href="${styleSheet}">`);
					}
				});
			}else{
				$('head').find(`link[name="${stringId}"]`).remove();
			}
		}

		loadTranslationFile = async (files) => {
			let langFile = files[0];
			if (files.length > 1) langFile = files.filter(file => file.lang == game.i18n.lang)[0];

			if (!langFile.path.startsWith('./')) langFile.path = `./modules/lib-themer/themes/${langFile.path}`;

			this.checkIfFileExists(langFile.path).then(file => { 
				if (typeof file != 'undefined') {
					fetch(langFile.path).then(response => {
						if (response.status !== 200) {
							throw TypeError(`Unable to load requested localization file ${langFile.path}`);
						}
						return response.json();
					}).then(json => {
						this.LOG(`Loaded localization file ${langFile.path}`);
						foundry.utils.mergeObject(game.i18n.translations, foundry.utils.expandObject(json));
					}).catch(error => this.ERROR(error));
				}else{
					throw TypeError(`unable to find ${langFile.path}, this theme localization will not be registered`);
				}

			}).catch(error => this.WARN(error));
		}

		handleStylesheetsOnRegister(themeName) {
			for (const [key, settings] of Object.entries(this.themes[themeName])) {
				if (settings.type == 'stylesheet' && settings.default == true) {
					if ($(`head link[name="${key}"]`).length == 0) {
						this.checkIfFileExists(settings.style).then(styleSheet => {
							this.INFO(key, $(`head link[name="${key}"]`).length)
							if ($(`head link[name="${key}"]`).length == 0) {
								$('head').append(`<link rel="stylesheet" type="text/css" name="${key}" href="${styleSheet}">`);
							}
						});
					}
				}
			}
		}

		handleColorsOnRegister() {

		}

		registerTheme = async (file) => {
			let fileExists = await this.checkIfFileExists(file).then(file => {
				return file;
			});
			
			await this.fetchThemeFile(fileExists).then(({theme, properties}) => {
				let themeName = fileExists.split('/').pop().replace('.json', '').replace(/[\W_]+/g,"-");
				let themeProperties = {
					name: `lib-themer.theme.${themeName}.name`,
					title: `lib-themer.theme.${themeName}.title`
				}

				theme = Object.extend(true, themeProperties, theme)

				// Handle for Language Files
				if (theme?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en")?.length > 0) {
					let langFiles = theme?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en");
					this.loadTranslationFile(langFiles);
				}

				this.INFO(`Has registered ${Object.keys(properties.css).length} css variables`);

				// Update CSS Variables
				this.cssVariables = Object.extend(true, this.cssVariables, properties.css);
				//this.stylesheets = Object.extend(true, this.stylesheets, properties.styles);

				let themeOptions = {}; themeOptions[themeName] = theme;
				this.themes = Object.extend(true, themeOptions, this.themes);

				//this.handleStylesheetsOnRegister(themeName);
				//if (Object.keys(theme).length > 0) this.setTheme();

				// save theme
				this.setting('themeSettings', this.themes);
			});

			return this.themes;
		}

		checkIfFileExists = async (file) => {
			return await FilePicker.browse('user', `${file}`, { extensions: ['.json', '.css'] }).then(response => {
				let fileName = file.split('/').pop().toLowerCase();
				let files =  response.files.filter(file => file.toLowerCase().endsWith(fileName))
				if (files.length > 0) {
					return files[0];
				}
				throw TypeError(`unable to find ${file}, this theme will not be registered`);
			}).then(file => file).catch(error => {
				this.ERROR(error)
			})
		}

		fetchThemeFile = async (file) => {
			return await fetch(file)
				.then(response => response.json())
				.then(json => {
					let fileName = file.split('/').pop().replace('.json', '').replace(/[\W_]+/g,"-");
					let properties = {
						css: {},
						styles: {}
					};

					json = Object.extend(true, json, this.themes[fileName])

					for(let [key, value] of Object.entries(json)) {
						if (value.type == 'color' || value.type == "shades") {
							properties.css = Object.extend(true, properties.css, this.generateColor(key, value.default, value.type));
						}else if (value.type == 'palette') {
							properties.css = Object.extend(true, properties.css, this.generatePalette(key, value.default));
						}else if (value.type == 'stylesheet') {
							let style = {}; style[key] = value;
							properties.styles = Object.extend(true, properties.styles, style);
						}
					}

					return ({theme: json, properties: properties});
				}).catch(error => this.ERROR(error));
		}

		generateColor(name, color, type) {
			let palette = {};
			// Set Default --[name]
			palette[`${name}`] = new Color(color).color;

			// If type is shades generate Shading and text contrast options
			if (type == 'shades') {
				// Set Default --[name]-contrast-text
				palette[`${name}-contrast-text`] = new Color(new Color(color).color).contrast();
	
				// Set Default --[name]-light && --[name]-dark
				palette[`${name}-light`] = new Color(color).tint(30);
				palette[`${name}-light-contrast-text`] = new Color(palette[`${name}-light`]).contrast();
				palette[`${name}-light-shaded-text`] = new Color(palette[`${name}-light`]).shiftColor(40);

				palette[`${name}-dark`] = new Color(color).shade(30);
				palette[`${name}-dark-contrast-text`] = new Color(palette[`${name}-dark`]).contrast();
				palette[`${name}-dark-shaded-text`] = new Color(palette[`${name}-dark`]).shiftColor(40);
				
				// Set Default --[name]-hover && --[name]-active
				if (palette[`${name}-contrast-text`] == '#ffffff') {
					palette[`${name}-hover`] = new Color(color).shade(15);
					palette[`${name}-active`] = new Color(color).shade(20);
				}else{
					palette[`${name}-hover`] = new Color(color).tint(15);
					palette[`${name}-active`] = new Color(color).tint(20);
				}
				palette[`${name}-shaded-text`] = new Color(color).shiftColor(40);
			}

			return palette
		}

		generatePalette(name, color) {
			let palette = {};
			// Set Default --palette-[color]
			palette[`${name}`] = new Color(color).color;
			palette[`${name}-contrast-text`] = new Color(new Color(color).color).contrast();
			// Set Default --palette-[color]-[level]
			palette[`${name}-100`] = new Color(color).tint(80);
			palette[`${name}-100-contrast-text`] = new Color(new Color(color).tint(80)).contrast();
			palette[`${name}-200`] = new Color(color).tint(60);
			palette[`${name}-200-contrast-text`] = new Color(new Color(color).tint(60)).contrast();
			palette[`${name}-300`] = new Color(color).tint(40);
			palette[`${name}-300-contrast-text`] = new Color(new Color(color).tint(40)).contrast();
			palette[`${name}-400`] = new Color(color).tint(20);
			palette[`${name}-400-contrast-text`] = new Color(new Color(color).tint(20)).contrast();
			palette[`${name}-500`] = new Color(color).color;
			palette[`${name}-500-contrast-text`] = new Color(new Color(color).color).contrast();
			palette[`${name}-600`] = new Color(color).shade(20);
			palette[`${name}-600-contrast-text`] = new Color(new Color(color).shade(20)).contrast();
			palette[`${name}-700`] = new Color(color).shade(40);
			palette[`${name}-700-contrast-text`] = new Color(new Color(color).shade(40)).contrast();
			palette[`${name}-800`] = new Color(color).shade(60);
			palette[`${name}-800-contrast-text`] = new Color(new Color(color).shade(60)).contrast();
			palette[`${name}-900`] = new Color(color).shade(80);
			palette[`${name}-900-contrast-text`] = new Color(new Color(color).shade(80)).contrast();

			return palette
		}

		getContrast = (color) => new Color(color).contrast();

		renderThemeOptions = (theme) => {
		}
	}

	// Register Module	
	libThemer = new LibThemer({
		name: 'lib-themer',
		title: 'Lib Themer',
	});
	Hooks.callAll(`${libThemer.MODULE.name}Init`);
});