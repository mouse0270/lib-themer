let libThemer = null;
class libThemerDialog extends FormApplication {
	constructor(themes) {
		super(themes)
		this.THEMES = libThemer.setting('themeSettings');
		this.presets = {};
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
				$('#libThemerDialog .lib-themer-dialog-title').text($element.text());

				$('#libThemerDialog .lib-themer-dialog-content').html('');
				const supportedTypes = ["color", "shades", "palette", "stylesheet", "imagevideo"];

				// Show Description
				if (theme?.description ?? false) {
					let content = Handlebars.compile(theme.description);
					$('#libThemerDialog .lib-themer-dialog-content').prepend(`<div class="form-group">
						${content({})}
					</div>`);
				}

				// Add Preset
				if ($element.data('load') == 'lib-themer') {
					const presetTemplate = () => {
						let options = `<option value="custom">${libThemer.localize('preset.custom.name')}</option>`;
						for (let [themeId, settings] of Object.entries(libThemer.themes)) {
							for (let [settingId, setting] of Object.entries(settings)) {
								if (setting.type == 'preset') {
									setting = mergeObject({name: `${themeId}.${settingId.substr(2).replace(/-/g, '.')}.name`}, setting, { inplace: false });
									this.presets[settingId] = setting;

									options += `<option value="${settingId}">${game.i18n.localize(setting.name)}</option>`
								}
							}
						}

						return `<div class="form-group">
							<label>${libThemer.localize(`theme.${libThemer.MODULE.name}.preset.name`)}</label>
							<div class="form-fields">
								<select name="lib-themer.preset">
									${options}
								</select>
							</div>
							<div class="notes">${libThemer.localize(`theme.${libThemer.MODULE.name}.preset.hint`)}</div>
						</div>`;
					}

					$('#libThemerDialog .lib-themer-dialog-content').prepend(presetTemplate());
					$('#libThemerDialog .lib-themer-dialog-content').find('select[name="lib-themer.preset"]').on('change', (event) => {
						let $select = $(event.currentTarget);
						if ($select.val() != 'custom') {
							this.THEMES = mergeObject(libThemer.themeDefaults, this.presets[$select.val()].default, { inplace: false });
							libThemer.setTheme(this.THEMES);
							$listElement.removeClass('active').find('a').trigger('click');
						}
					});
				}
				
	
				for (let [key, setting] of Object.entries(theme)) {
					if (supportedTypes.includes(setting.type)) {
						let settings = mergeObject({
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
								let color = event.detail.hex;
								let settingFor = $(html).find('nav li.active a').data('load');
								let settingName = $input.attr('name');
								let setting = {};

								// Update Color
								setting[`${settingFor}.${settingName}.default`] = color;
								mergeObject(this.THEMES, foundry.utils.expandObject(setting));
								libThemer.setTheme(foundry.utils.expandObject(setting));
							});

							// Handle if type is checkbox
							$element.find('input[type="checkbox"]').on('change', event => {
								let $input = $(event.currentTarget);
								let settingFor = $(html).find('nav li.active a').data('load');
								let settingName = $input.attr('name');
								let setting = {};

								// Update Stylesheet
								setting[`${settingFor}.${settingName}.default`] = $input.is(':checked');
								mergeObject(this.THEMES, foundry.utils.expandObject(setting));
								libThemer.setTheme(foundry.utils.expandObject(setting));
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
									let setting = {};
									// Update Color
									let imageProperties = {};
									imageProperties[`${settingName}-blend-mode`] = $input.closest('.form-fields').find('select').val();
									imageProperties[settingName] = $input.val();
									
									setting[`${settingFor}.${settingName}.default`] = imageProperties
									mergeObject(this.THEMES, foundry.utils.expandObject(setting));

									libThemer.setTheme(foundry.utils.expandObject(setting));
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
			this.themeDefaults = {};
			this.themes = {};
			this.presets = {};

			game.modules.get("lib-themer").registerTheme = this.registerTheme;
		}

		async init() {
			this.themes = this.setting('themeSettings');

			await this.registerTheme('./modules/lib-themer/themes/lib-themer.json');
			await this.registerLocalThemes(['lib-themer.json']);
			if (this.setting('localStorage').length > 0) {
				await this.registerLocalStorage(this.setting('localStorage'))
			}

			this.setTheme();
		}

		setTheme = (options) => {
			// If options are left blank, use saved themes setting
			options = (typeof options == 'undefined' ? this.themes : options);
			for (const [themeId, settings] of Object.entries(options)) {
				for (const [settingId, setting] of Object.entries(settings)) {
					if (setting.type == 'color' || setting.type == 'shades' || setting.type == 'palette') {
						let colors = setting.type == 'palette' ? this.generatePalette(settingId, setting.default) : this.generateColor(settingId, setting.default, setting.type);
						for (const [key, color] of Object.entries(colors)) {
							document.documentElement.style.setProperty(key, color);
						}
					}else if (setting.type == 'stylesheet') {
						if (!setting.default) { // Remove Setting if its false
							$(`head link[name="${settingId}"]`).remove();
						} else if ($(`head link[name="${settingId}"]`).length == 0) { // If setting is enabled but stylesheet is not laoded
							// Verify File Exists
							this.WARN(setting, setting.style);
							this.checkIfFileExists(setting.style).then(file => {
								if ($(`head link[name="${settingId}"]`).length == 0) { // Check incase async call has happened again. Prevent adding again.
									$('head').append(`<link rel="stylesheet" type="text/css" name="${settingId}" href="${file}">`);
								}
							});
						} else if (setting.type == 'imagevideo') {
							if (typeof setting.default == 'string') { // If only the background image was provided, set blend mode to normal;
								document.documentElement.style.setProperty(`${settingId}-blend-mode`, 'normal');
								document.documentElement.style.setProperty(settingId, setting.default.length == 0 ? 'none' : `url('/${setting.default}')`);
							}else if (typeof setting.default == 'object') {
								for (const [key, imageProperty] of Object.entries(setting.default)) {
									if (key.endsWith('-blend-mode')) {
										document.documentElement.style.setProperty(key, imageProperty);
									}else{
										document.documentElement.style.setProperty(key, imageProperty.length >= 1 ? `url('/${imageProperty}')` : 'none');
									}
								};
							}
						}
					}
				}
			};
		}

		registerLocalStorage = async (path) => {
			let files = await FilePicker.browse('user', `./${path}/`, { extensions: ['.json'] }).then(response => {
				return response.files
			});

			for (const file of files) {
				await this.registerTheme(file);
			};
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

		loadTranslationFile = async (files) => {
			let langFile = files[0];
			if (files.length > 1) langFile = files.filter(file => file.lang == game.i18n.lang)[0];

			if (!langFile.path.startsWith('./')) langFile.path = `./${this.setting('localStorage')}/${langFile.path}`;

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

		setupTheme = (themeName, theme) => {
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

			//this.INFO(`Has registered ${Object.keys(properties.css).length} css variables`);

			let themeOptions = {}; themeOptions[themeName] = theme;
			mergeObject(this.themeDefaults, themeOptions);
			this.themes = Object.extend(true, themeOptions, this.themes);

			// save theme
			this.setting('themeSettings', this.themes);
		}

		registerTheme = async (themeName, themeData) => {
			themeData = (typeof themeData == 'undefined' ? themeName : themeData);
			if (typeof themeData == 'string') {
				let fileExists = await this.checkIfFileExists(themeData).then(file => file);

				await fetch(fileExists)
					.then(response => response.json())
					.then(json => {
						let themeName = fileExists.split('/').pop().replace('.json', '').replace(/[\W_]+/g,"-");
						this.setupTheme(themeName, json);
					}).catch(error => this.ERROR(error));
			}else if (typeof themeData == 'object') {
				this.setupTheme(themeName, themeData);
			}

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
	}

	// Register Module	
	libThemer = new LibThemer({
		name: 'lib-themer',
		title: 'Lib Themer',
	});
	Hooks.callAll(`${libThemer.MODULE.name}Init`);
});