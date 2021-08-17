import { MODULE } from '../_module.mjs';
import Reef from '../lib/reef.es.min.js';
import { CONTROLS } from './controls.mjs';
import Color from '../lib/color.js';

export default class libThemerDialog extends FormApplication {
	constructor() {
		super();

		this.THEMES = MODULE.store.themeData;
		this.presets = {};
		// Build Presets
		for (const [themeId, settings] of Object.entries(MODULE.store.themeData)) {
			for (const [settingId, setting] of Object.entries(settings)) {
				if (setting.type == 'preset') this.presets[settingId] = setting;
			}
		}

		console.log(this.presets);
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
		console.log(this.THEMES)
		return {
			themes: this.THEMES
		}
	}

	activateListeners(html) {
		// Add shadow style onScroll
		$(html).find('main .lib-themer-dialog-content').on('scroll', (event) => {
			$(html).find('main > .lib-themer-dialog-title').toggleClass('has-shadow', $(event.currentTarget).scrollTop() > 5);
		});

		// Organize Sidebar
		$(html).find('nav > ul').children("li").sort(function(a, b) {
			var upA = $(a).data('sort').toUpperCase();
			var upB = $(b).data('sort').toUpperCase();
			return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
		}).appendTo($(html).find('nav > ul'));
		$(html).find('nav > ul > li[data-sort="lib-themer"]').prependTo($(html).find('nav > ul'));

		// Bind Load Data On Menu Click
		$(html).find('nav li a').on('click', (event) => {
			let $element = $(event.currentTarget);
			let $listElement = $element.closest('li');
			let theme = foundry.utils.mergeObject(MODULE.store.themeData, this.THEMES, { inplace: false });

			theme = theme[Object.keys(theme).filter(theme => theme == $element.data('load'))];

			if (!$listElement.hasClass('active')) {
				// Set Content Container
				let $container = $('#libThemerDialog .lib-themer-dialog-content');
				const $formGroup = ($container) => $container.append('<div class="form-group"></div>').children(".form-group:last-child");
				let elements = {};

				// Deactivate current Item
				$element.closest('ul').find('li.active').removeClass('active');
				// Set Title of Content Window
				$('#libThemerDialog .lib-themer-dialog-title').text($element.text());

				// Clear Content
				$container.empty();

				// Set the types of controls lib-themer supports
				//const supportedTypes = ["color", "shades", "palette", "stylesheet", "imagevideo"];
				const supportedTypes = ["shades", "palette", "stylesheet"];

				// Show Description
				if (theme?.description ?? false) {
					// Define Reactive UI
					elements['description'] = new Reef($formGroup($container)[0], {
						data: theme,
						template: (props) => CONTROLS.description(props)
					});

					// Render Element
					elements['description'].render();
					elements['description'].data.description = 'This is a state change';
				}

				// Add Preset
				if ($element.data('load') == MODULE.name) {
					console.log(this.presets);
					elements['preset'] = new Reef($formGroup($container)[0], {
						data: this.presets,
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
				// Binds pickerDone and pickerChange events to color Picker Elements
				$container.find('div.form-group input[type="color"]').on('input change', (event) =>{
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

				$listElement.addClass('active');
			}
		});

		// Select first Option on Load
		$(html).find('nav li:first-child a').trigger('click');
	}

	async close(options) { 
		// User closed application without saving
		if (typeof options == 'undefined') {
			//libThemerES.LOG('Restore saved settings');
			//libThemerES.setTheme();
		}

		// Default Close
		return await super.close(options);
	}

	async _updateObject(event, formData) {
	}
}