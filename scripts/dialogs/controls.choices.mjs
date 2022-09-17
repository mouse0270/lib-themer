// GET REQUIRED LIBRARIES
import '../libraries/webfont.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlChoices(elemContainer, setting, properties) {
	const controlProperties = {
		value: properties?.value ?? properties.default,
		choices: properties?.choices ?? {}
	}
	
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<select name="${setting}" style="flex: 0;"></select>
		<button type="button" data-action="reset" data-tooltip="${MODULE.localize('dialog.theme.reset')}"><i class="fa-duotone fa-rotate"></i></button>
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
	</div>`);

	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');

	// Add Default Options
	for (const [value, text] of Object.entries(controlProperties.choices)) {
		elem.querySelector(`select[name="${setting}"]`).insertAdjacentHTML('beforeend', `<option value="${value}">${game.i18n.localize(text)}</option>`);
	}
	elem.querySelector(`select[name="${setting}"]`).value = controlProperties.value;

	// Update Value
	const updateValue = (event) => {
		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, `${event.target.value}`);
	}

	// Bind Events
	elem.querySelector(`select[name="${setting}"]`).addEventListener('change', updateValue, false);

	// Add Function to restore to default setting
	const restoreDefault = (event) => {		
		elem.querySelector(`select[name="${setting}"]`).value = properties.default;
		elem.querySelector(`select[name="${setting}"]`).dispatchEvent(new Event('change'));
	}
	elem.querySelector('button[data-action="reset"]').addEventListener('click', restoreDefault, false);
};