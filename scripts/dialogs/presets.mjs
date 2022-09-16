// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export class PresetDialog extends FormApplication {
	constructor(packages) {
		super();
	}

	static get defaultOptions() {
		return {
			...super.defaultOptions,
			title: `${MODULE.TITLE} - ${MODULE.localize('dialog.presets.manage')}`,
			id: `${MODULE.ID}-preset-dialog`,
			classes: ['dialog'],
			template: `./modules/${MODULE.ID}/templates/presets.hbs`,
			resizable: false,
			width: $(window).width() > 400 ? 400 : $(window).width() - 100,
			height: $(window).height() > 275 ? 275 : $(window).height() - 100
		}
	}

	getData() {
		return {
			DIALOG: {
				ID: MODULE.ID,
				TITLE: MODULE.TITLE
			},
			presets: MODULE.setting('presets')
		}
	}
	
	async activateListeners(html) {
		super.activateListeners(html);

		const exportPreset = (event) => {
			const presetKey = event.target.closest('li').dataset.preset;
			let preset = MODULE.setting('presets')[presetKey];

			saveDataToFile(JSON.stringify(preset, null, 4), 'application/json', `${preset.name} Theme Preset.json`);
		}

		const updatePreset = (event) => {
			const presetKey = event.target.closest('li').dataset.preset;
			let presets = MODULE.setting('presets');

			Dialog.confirm({
				id: `${MODULE.ID}-update-preset`,
				title: MODULE.localize('title'),
				content: `<p style="margin-top: 0px;">${MODULE.localize('dialog.presets.overwritePreset')}</p>`,
				yes: (elemDialog) => {
					presets[presetKey].theme = MODULE.setting('themeSettings');
					MODULE.setting('presets', presets).then(response => {
						MODULE.log('UPDATE', response);
					});
				},
				no: (elemDialog) => {
					return false;
				}
			});
		}

		const deletePreset = (event) => {
			const presetKey = event.target.closest('li').dataset.preset;
			let presets = MODULE.setting('presets');

			Dialog.confirm({
				id: `${MODULE.ID}-delete-preset`,
				title: MODULE.localize('title'),
				content: `<p style="margin-top: 0px;">${MODULE.localize('dialog.presets.deletePreset')}?</p>
					<p>${MODULE.localize('dialog.presets.deletePresetWarning')}</p>`,
				yes: (elemDialog) => {
					delete presets[presetKey];
					MODULE.setting('presets', presets).then(response => {
						event.target.closest('li').remove();
					});
				},
				no: (elemDialog) => {
					return false;
				}
			});
		}

		const activatePreset = (event) => {
			const presetKey = event.target.closest('li').dataset.preset;
			let preset = MODULE.setting('presets')[presetKey];

			Dialog.confirm({
				id: `${MODULE.ID}-activate-preset`,
				title: MODULE.localize('title'),
				content: `<p style="margin-top: 0px;">This preset will enable the following Modules?</p>`,
				yes: (elemDialog) => {
					MODULE.setting('themeSettings', preset.theme).then(response => {
						for (const [property, value] of Object.entries(MODULE.setting('themeSettings'))) {
							game.modules.get(MODULE.ID).API.setCSSVariable(property, value.value);
						}
						Object.values(ui.windows)?.find(a => a.title === `${MODULE.TITLE}`)?.render(true) ?? false;
					});
				},
				no: (elemDialog) => {
					return false;
				}
			});
		}

		// Manage Presets Buttons
		html[0].querySelectorAll(`#${MODULE.ID}-presets-list li`).forEach(elemPreset => {
			// EXPORT
			elemPreset.querySelector('button[data-action="export"]').addEventListener('click', exportPreset);
			// UPDATE
			elemPreset.querySelector('button[data-action="update"]').addEventListener('click', updatePreset);
			// DELETE
			elemPreset.querySelector('button[data-action="delete"]').addEventListener('click', deletePreset);
			// ACTIVATE
			elemPreset.querySelector('button[data-action="activate"]').addEventListener('click', activatePreset);
		});

		const saveTheme = (theme, name) => {
			const presetKey = foundry.utils.randomID();
			MODULE.setting('presets', mergeObject(MODULE.setting('presets'), { 
				[presetKey]: {
					"name": name,
					"theme": theme
				}
			}, { inplace: false })).then((response) => {
				html[0].querySelector(`#${MODULE.ID}-presets-list`).insertAdjacentHTML('beforeend', `<li data-preset="${presetKey}">
					<label for="preset-${presetKey}">${name}</label>
					<button data-action="export" data-tooltip="${MODULE.localize('dialog.presets.export')}">
						<i class="fa-regular fa-file-export"></i>
					</button>
					<button data-action="update" data-tooltip="${MODULE.localize('dialog.presets.update')}">
						<i class="fa-solid fa-floppy-disk"></i>
					</button>
					<button data-action="delete" data-tooltip="${MODULE.localize('dialog.presets.delete')}">
						<i class="fa-solid fa-trash"></i>
					</button>
					<button data-action="activate" data-tooltip="${MODULE.localize('dialog.presets.activate')}">
						<i class="fa-solid fa-circle-play"></i>
					</button>
				</li>`);

				// EXPORT
				html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="export"]`).addEventListener('click', exportPreset);
					
				// UPDATE
				html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="update"]`).addEventListener('click', updatePreset);

				// DELETE
				html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="delete"]`).addEventListener('click', deletePreset);

				// ACTIVATE
				html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="activate"]`).addEventListener('click', activatePreset);
				return true;
			});
		}

		const createThemePreset = (event, theme, name) => {
			return Dialog.confirm({
				id: `${MODULE.ID}-create-preset`,
				title: MODULE.localize('title'),
				content: `<p style="margin-top: 0px;">${MODULE.localize('dialog.presets.create')}</p>
					<input type="text" name="${MODULE.ID}-preset-title" placeholder="Preset Title" ${name ?? false ? 'value="'+name+'"' : ''}/>`,
				yes: (elemDialog) => {
					if (elemDialog[0].querySelector(`input[name="${MODULE.ID}-preset-title"]`)?.value?.length == 0) {
						throw `<strong>${MODULE.TITLE}</strong> ${MODULE.localize('dialog.presets.errors.noTitle')}`;
					}

					saveTheme(theme, elemDialog[0].querySelector(`input[name="${MODULE.ID}-preset-title"]`)?.value);
				},
				no: () => {
					return 'Player Rejected Setting'
				}
			}).then(response => {
			});
		}

		// Import Preset
		html[html.length - 1].querySelector('.dialog-buttons button[data-action="import"]').addEventListener('click', (event) => {
			let elemFile = document.createElement('input');
			elemFile.type = "file";
			elemFile.accept = '.json,application/json';
			elemFile.multiple = true;

			const selectFile = (event) => {
				const elemFiles = event.path[0].files;
				
				Array.from(elemFiles).forEach(file => {
					try {
						if (file?.type != 'application/json') {
							ui.notifications.error(`<strong>${MODULE.TITLE}</strong> Failed to process, file (${file?.name ?? 'unknown file name'}) is an unsupported file type.`);
							return false;
						}

						readTextFromFile(file).then(async (response) => {
							try {
								// Convert Response into JSON
								const themeData = JSON.parse(response);

								// Check if Import is for Preset
								if ((themeData.hasOwnProperty('name') ?? false) && (themeData.hasOwnProperty('theme') ?? false)) {
									if (elemFiles.length == 1) {
										createThemePreset(event, themeData.theme, themeData.name);
									}else{
										saveTheme(themeData.theme, themeData.name)
									}
								}else{
									ui.notifications.error(`<strong>${MODULE.TITLE}</strong> File (${file?.name ?? 'unknown file name'}) does not appear to be a ${MODULE.TITLe} theme file.`);
									return false;
								}

							} catch (error) {
								ui.notifications.error(`<strong>${MODULE.TITLE}</strong> Failed to process (${file?.name ?? 'unknown file name'}), Unable to determine how to load file.`);
								return false;
							}
						});

					} catch (error) {
						ui.notifications.error(`<strong>${MODULE.TITLE}</strong> Failed to process (${file?.name ?? 'unknown file name'}), Unable to determine how to load file.`);
						return false;
					}
				});
			};

			elemFile.addEventListener('change', selectFile);
			elemFile.dispatchEvent(new MouseEvent("click"));
		});

		// Create a New Preset
		html[html.length - 1].querySelector('.dialog-buttons button[data-action="create"]').addEventListener('click', (event) => {
			createThemePreset(event, MODULE.setting('themeSettings'));
		})
	}
}