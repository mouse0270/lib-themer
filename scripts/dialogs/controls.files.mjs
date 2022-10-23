// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlFiles(elemContainer, setting, properties) {
	const controlProperties = {
		value: (properties?.value ?? properties.default).toString() == 'true'
	}
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group-stacked" data-type="${properties.type}">
		<div class="form-group">
			<div class="toggle"><i class="fa-solid fa-circle-plus"></i></div>
			<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
			<div class="form-fields">
				<input type="checkbox" name="${setting}" ${(controlProperties.value ? 'checked' : '')}>
			</div>
			<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
		</div>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector(`.form-group-stacked[data-type="${properties.type}"]:last-of-type`);

	const manageOptionalSettings = (elem, input) => {
		//if (input.checked) {
			game.modules.get(MODULE.ID).API.getThemeProperty(input.name).then(response => {
				if (response?.settings ?? false) {
					elem.insertAdjacentHTML('beforeend', '<div class="stylesheet-settings hidden"></div>');

					this.manageControls(elem.querySelector('.stylesheet-settings'), foundry.utils.mergeObject(
						response?.settings, 
						MODULE.setting('themeSettings'), 
						{ inplace: false, insertKeys: false }
					));
				}
			});
		/*}else{
			elem.querySelector(`.stylesheet-settings`)?.remove() ?? false;
		}*/
	}
	manageOptionalSettings(elem, elem.querySelector(`input[name="${setting}"]`));


	const  updateCheckbox = (event) => {
		//manageOptionalSettings(elem, event.target);
		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, event.target.checked.toString());
	}
	
	elem.querySelector('input[type="checkbox"]').addEventListener('change', updateCheckbox, false);

	elem.querySelector('.toggle').addEventListener('click', (event) => {
		elem.querySelector('.stylesheet-settings').classList.toggle('hidden');
		event.target.closest('.toggle').classList.toggle('expanded', !elem.querySelector('.stylesheet-settings').classList.contains('hidden'))
	});

	// Check if Library has Settings
	if (Object.keys(properties?.settings ?? []).length == 0) {
		elem.style.paddingLeft = '0px';
		elem.querySelector('.toggle').remove();
	}else{
		elem.querySelector('label').addEventListener('click', (event) => {
			elem.querySelector('.toggle').click();
		});
	}
};