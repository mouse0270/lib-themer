import { MODULE } from '../_module.mjs';
import Reef from '../lib/reef.es.min.js';
import { CONTROLS } from './controls.mjs';

export default class libThemerDialog extends FormApplication {
	constructor() {
		super();
		console.log(MODULE.store.themeDefaults, MODULE.store.themeData)
		this.THEMES = MODULE.store.themeData;
		this.presets = {};
		// Build Presets
		for (const [themeId, settings] of Object.entries(MODULE.store.themeData)) {
			for (const [settingId, setting] of Object.entries(settings)) {
				if (setting.type == 'preset') {
					this.presets[settingId] = setting;
				}
			}
		}
	}

	static get defaultOptions() {
		return {
			...super.defaultOptions,
			title: `${MODULE.title} Settings`,
			id: "libThemerDialog",
			template: `modules/${MODULE.name}/templates/dialog.hbs`,
			resizable: true,
			width: window.innerWidth > 700 ? 700 : window.innerWidth - 100,
			height: window.innerHeight > 800 ? 800 : window.innerHeight - 100
		}
	}

	getData() {
		return {
			themes: MODULE.store.themeDefaults
		}
	}

	activateListeners(html) {
		// Add shadow style onScroll
		$(html).find('main .lib-themer-dialog-content').on('scroll', (event) => {
			$(html).find('main > .lib-themer-dialog-title').toggleClass('has-shadow', $(event.currentTarget).scrollTop() > 5);
		});

		// Organize Sidebar
		$(html).find('nav > ul').children("li").sort(function (a, b) {
			var upA = $(a).data('sort').toUpperCase();
			var upB = $(b).data('sort').toUpperCase();
			return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
		}).appendTo($(html).find('nav > ul'));
		$(html).find('nav > ul > li[data-sort="lib-themer"]').prependTo($(html).find('nav > ul'));

		// Bind Load Data On Menu Click
		$(html).find('nav li a:not([data-load="lib-themer-css-vars"])').on('click', (event) => {
			let $element = $(event.currentTarget);
			let $listElement = $element.closest('li');

			let theme = myMergeObject(MODULE.store.themeDefaults, this.THEMES, { inplace: false, insertKeys: false, insertValues: false });

			theme = theme[Object.keys(theme).filter(theme => theme == $element.data('load'))];

			if (!$listElement.hasClass('active')) {
				// Set Content Container
				let $container = $('#libThemerDialog .lib-themer-dialog-content');
				const $formGroup = ($container) => $container.append('<div class="form-group"></div>').children(".form-group:last-child");

				// Used to store Reactive Elements
				// ? Should look into use the ReefStore and updating that instead of maintaining each inputs data
				let elements = {};

				// Deactivate current Item
				$element.closest('ul').find('li.active').removeClass('active');
				// Set Title of Content Window
				$('#libThemerDialog .lib-themer-dialog-title').text($element.text());

				// Clear Content
				$container.empty();

				// Set the types of controls lib-themer supports
				//const supportedTypes = ["color", "shades", "palette", "stylesheet", "imagevideo"];
				const supportedTypes = ["color", "shades", "palette", "stylesheet", "imagevideo"];

				// Show Description
				if (theme?.description ?? false) {
					// Define Reactive UI
					elements['description'] = new Reef($formGroup($container)[0], {
						data: theme,
						template: (props) => CONTROLS.description(props)
					});

					// Render Element
					elements['description'].render();
				}

				// Add Preset
				if ($element.data('load') == MODULE.name) {
					elements['preset'] = new Reef($formGroup($container)[0], {
						data: foundry.utils.mergeObject(this.presets, { activePreset: MODULE.setting('themePreset') }),
						template: (props) => CONTROLS.preset(props)
					});
					elements['presetOptions'] = new Reef('select[name="lib-themer.preset"]', {
						data: this.presets,
						template: (props) => CONTROLS.presetOptions(props),
						attachTo: elements['preset']
					});

					// Render Element
					elements['preset'].render();
				}

				// Loop Through Settings and Build Options
				for (let [key, setting] of Object.entries(theme)) {
					if (supportedTypes.includes(setting.type)) {
						// Add Name and Hint localization if missing
						let settings = mergeObject({
							property: key,
							name: `${MODULE.name}.${key.substr(2).replace(/-/g, '.')}.name`,
							hint: `${MODULE.name}.${key.substr(2).replace(/-/g, '.')}.hint`
						}, setting);

						elements[key] = new Reef($formGroup($container)[0], {
							data: foundry.utils.mergeObject(settings, setting),
							template: (props) => CONTROLS[setting.type](props)
						});
						elements[key].render();
					}
				}

				// Bind Events
				// Binds Change event for Preset
				$container.find('div.form-group select[name="lib-themer.preset"]').on('change', (event) => {
					let $select = $(event.currentTarget);

					if ($select.val() != '--preset-custom') {
						this.THEMES = foundry.utils.mergeObject(MODULE.store.themeDefaults, this.presets[$select.val()].default, { inplace: false });
						MODULE.api.setTheme(foundry.utils.expandObject(this.THEMES));

						// Update Element Data
						let settingFor = $(html).find('nav li.active a').data('load');

						Object.entries(elements).forEach(([key, element]) => {
							if (element.data.default ?? false) {
								element.data.default = this.THEMES[settingFor][key].default

								// Handle for Image being multiple values
								if (this.THEMES[settingFor][key].type == 'imagevideo') {
									element.elem.querySelector('select').value = this.THEMES[settingFor][key].default[`${key}-blend-mode`] ?? 'normal';
									element.elem.querySelector('input').value = this.THEMES[settingFor][key].default[key] ?? '';
								} else {
									element.elem.querySelector('input').value = this.THEMES[settingFor][key].default;
								}
							}
						})
					}
					// Update Saved Theme
					MODULE.setting('themePreset', $select.val());
				});

				// Binds input, change, pickerDone and pickerChange events to color Picker Elements
				$container.find('div.form-group input[type="color"]').on('input change', (event) => {
					let $input = $(event.currentTarget);
					let settingFor = $(html).find('nav li.active a').data('load');
					let setting = {};

					// Update Color
					setting[`${settingFor}.${$input.attr('name')}`] = {
						...this.THEMES[settingFor][$input.attr('name')],
						type: $input.data('type'),
						default: $input.val()
					};

					this.THEMES = foundry.utils.mergeObject(this.THEMES, foundry.utils.expandObject(setting), { inplace: false });
					MODULE.api.setTheme(foundry.utils.expandObject(setting));
				});
				$container.find('div.form-group input[data-responsive-color]').on('pickerDone pickerChange', (event) => {
					let $input = $(event.currentTarget);
					let settingFor = $(html).find('nav li.active a').data('load');
					let setting = {};

					// Update Color
					setting[`${settingFor}.${$input.attr('name')}`] = {
						...this.THEMES[settingFor][$input.attr('name')],
						type: $input.data('type'),
						default: event.detail.hex
					};

					this.THEMES = foundry.utils.mergeObject(this.THEMES, foundry.utils.expandObject(setting), { inplace: false });
					MODULE.api.setTheme(foundry.utils.expandObject(setting));
				});

				// Binds change event to stylyesheet toggle
				$container.find('div.form-group input[data-type="stylesheet"]').on('change', (event) => {
					let $input = $(event.currentTarget);
					let settingFor = $(html).find('nav li.active a').data('load');
					let setting = {};

					// Update Input Status
					setting[`${settingFor}.${$input.attr('name')}`] = {
						...this.THEMES[settingFor][$input.attr('name')],
						type: $input.data('type'),
						default: $input.is(':checked')
					};

					this.THEMES = foundry.utils.mergeObject(this.THEMES, foundry.utils.expandObject(setting), { inplace: false });
					MODULE.api.setTheme(foundry.utils.expandObject(setting));
				});

				// Binds click event for Browsing Folders
				// TODO: Do not allow users to select file instead of folder...
				$container.find('div.form-group-file-picker button[data-type="imagevideo"]').on('click', (event) => {
					const filePicker = new FilePicker({
						type: 'imagevideo',
						current: $(event.currentTarget).closest('.form-fields').find('input[type="text"]').val(),
						callback: path => {
							$(event.currentTarget).closest('.form-fields').find('input[type="text"]').val(path).trigger('change');
						}
					});
					return filePicker.browse();
				});
				// Updates Input when user changes blend mode
				$container.find('div.form-group-file-picker select').on('change', (event) => {
					$(event.currentTarget).closest('.form-fields').find('input[type="text"]').trigger('change');
				});
				// When Input is updated, udpate the variable.
				$container.find('div.form-group-file-picker input[type="text"]').on('change', (event) => {
					let $input = $(event.currentTarget);
					let settingFor = $(html).find('nav li.active a').data('load');
					let setting = {};
					let imageProperties = {};

					// Set Image Properties
					imageProperties[`${$input.attr('name')}-blend-mode`] = $input.closest('.form-fields').find('select').val();
					imageProperties[$input.attr('name')] = $input.val();

					// Update Input Status
					setting[`${settingFor}.${$input.attr('name')}`] = {
						...this.THEMES[settingFor][$input.attr('name')],
						type: $input.data('type'),
						default: imageProperties
					};

					this.THEMES = foundry.utils.mergeObject(this.THEMES, foundry.utils.expandObject(setting), { inplace: false });
					MODULE.api.setTheme(foundry.utils.expandObject(setting));
				});

				// Set Selected Tab as Active
				$listElement.addClass('active');
			}
		});

		// Select first Option on Load
		$(html).find('nav li:first-child a').trigger('click');
	}

	async close(options) {
		// User closed application without saving
		if (typeof options == 'undefined') {
			MODULE.api.setTheme();
		}

		// Default Close
		return await super.close(options);
	}

	async _updateObject(event, formData) {
		let themeSettings = MODULE.setting('themeSettings');
		themeSettings = foundry.utils.mergeObject(themeSettings, this.THEMES);

		MODULE.setting('themeSettings', themeSettings);
	}
}