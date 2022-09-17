// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlFiles(elemContainer, setting, properties) {
	const controlProperties = {
		value: (properties?.value ?? properties.default).toString() == 'true'
	}
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<div class="form-fields">
            <input type="checkbox" name="${setting}" ${(controlProperties.value ? 'checked' : '')}>
        </div>
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');

	const manageOptionalSettings = (elem, input) => {
		if (input.checked) {
			game.modules.get(MODULE.ID).API.getThemeProperty(input.name).then(response => {
				if (response?.settings ?? false) {
					elem.insertAdjacentHTML('beforeend', '<div class="stylesheet-settings"></div>');

					this.manageControls(elem.querySelector('.stylesheet-settings'), foundry.utils.mergeObject(
						response?.settings, 
						MODULE.setting('themeSettings'), 
						{ inplace: false, insertKeys: false }
					));
				}
			});
		}else{
			elem.querySelector(`.stylesheet-settings`)?.remove() ?? false;
		}
	}
	manageOptionalSettings(elem, elem.querySelector(`input[name="${setting}"]`));


	const  updateCheckbox = (event) => {
		manageOptionalSettings(elem, event.target);
		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, event.target.checked.toString());
	}
	
	elem.querySelector('input[type="checkbox"]').addEventListener('change', updateCheckbox, false);
};