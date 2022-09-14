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
					});
				},
				no: (elemDialog) => {
					return false;
				}
			});
		}

		// Manage Presets Buttons
		html[0].querySelectorAll(`#${MODULE.ID}-presets-list li`).forEach(elemPreset => {
			// UPDATE
			elemPreset.querySelector('button[data-action="update"]').addEventListener('click', updatePreset);
			// Delete
			elemPreset.querySelector('button[data-action="delete"]').addEventListener('click', deletePreset);
			// ACTIVATE
			elemPreset.querySelector('button[data-action="activate"]').addEventListener('click', activatePreset);
		})

		// Create a New Preset
		html[html.length - 1].querySelector('.dialog-buttons button[data-action="create"]').addEventListener('click', (event) => {
			const packages = document.querySelectorAll('#module-management #module-list li.package');
			let presetPackages = [];
			packages.forEach(elemPackage => {
				if (elemPackage.querySelector('input[type="checkbox"]:checked') ?? false) {
					presetPackages.push({
						id: game.modules.get(elemPackage.dataset.moduleId).id,
						title: game.modules.get(elemPackage.dataset.moduleId).title
					})
				}
			});

			return Dialog.confirm({
				id: `${MODULE.ID}-create-preset`,
				title: MODULE.localize('title'),
				content: `<p style="margin-top: 0px;">${MODULE.localize('dialog.presets.create')}</p>
					<input type="text" name="${MODULE.ID}-preset-title" placeholder="Preset Title" />`,
				yes: (elemDialog) => {
					if (elemDialog[0].querySelector(`input[name="${MODULE.ID}-preset-title"]`)?.value?.length == 0) {
						throw `<strong>${MODULE.TITLE}</strong> ${MODULE.localize('dialog.presets.errors.noTitle')}`;
					}

					const presetKey = foundry.utils.randomID();
					MODULE.setting('presets', mergeObject(MODULE.setting('presets'), { 
						[presetKey]: {
							"name": elemDialog[0].querySelector(`input[name="${MODULE.ID}-preset-title"]`)?.value,
							"theme": MODULE.setting('themeSettings')
						}
					}, { inplace: false })).then((response) => {
						html[0].querySelector(`#${MODULE.ID}-presets-list`).insertAdjacentHTML('beforeend', `<li data-preset="${presetKey}">
							<label for="preset-${presetKey}">${elemDialog[0].querySelector(`input[name="${MODULE.ID}-preset-title"]`)?.value}</label>
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
						
						// UPDATE
						html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="update"]`).addEventListener('click', updatePreset);

						// Delete
						html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="delete"]`).addEventListener('click', deletePreset);

						// ACTIVATE
						html[0].querySelector(`#${MODULE.ID}-presets-list li:last-of-type button[data-action="activate"]`).addEventListener('click', activatePreset);
						return true;
					});
				},
				no: () => {
					return 'Player Rejected Setting'
				}
			}).then(response => {
			});
		})
	}
}