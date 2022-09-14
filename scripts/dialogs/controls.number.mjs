// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlNumber(elemContainer, setting, properties) {
	const controlProperties = {
		min: (!isNaN(parseFloat(properties?.properties?.min)) ? parseFloat(properties?.properties?.min) : 0),
		max: (!isNaN(parseFloat(properties?.properties?.max)) ? parseFloat(properties?.properties?.max) : parseFloat((properties?.value ?? properties.default)) ?? 0),
		step: (!isNaN(parseFloat(properties?.properties?.step)) ? parseFloat(properties?.properties?.step) : 1),
		suffix: (properties?.suffix ?? (properties?.value ?? properties.default)).replace(parseFloat(properties?.value ?? properties.default), ''),
		value: parseFloat(properties?.value ?? properties.default) ?? 0
	}

	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<div class="form-fields${controlProperties.suffix == '' ? ' hide-suffix' : ''}">
			<input type="range" name="${setting}" value="${controlProperties.value}" min="${controlProperties.min}" max="${controlProperties.max}" step="${controlProperties.step}" data-tooltip="${controlProperties.value}${controlProperties.suffix}" />
			<input type="number" value="${controlProperties.value}" min="${controlProperties.min}" max="${controlProperties.max}" step="${controlProperties.step}" />
			<label>${controlProperties.suffix}</label>
			<button type="button" data-action="reset" data-tooltip="${MODULE.localize('dialog.theme.reset')}"><i class="fa-duotone fa-rotate"></i></button>
		</div>
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');

	const updateRange = (event) => {
		const elem = event.target.closest('.form-group');
		const range = elem.querySelector('.form-fields input[type="range"]');
		const number = elem.querySelector('.form-fields input[type="number"]');

		// Equal out Numbers
		number.value = range.value;

		// Update Range Tooltip
		range.dataset.tooltip = `${range.value}${controlProperties.suffix}`;
		game.tooltip.activate(range, {text: `${range.value}${controlProperties.suffix}`});

		// Update Variable
		updateValue(range)
	}

	const updateNumber = (event) => {
		const elem = event.target.closest('.form-group');
		const range = elem.querySelector('.form-fields input[type="range"]');
		const number = elem.querySelector('.form-fields input[type="number"]');

		// Equal out Numbers
		range.value = number.value;

		// Update Range Tooltip
		range.dataset.tooltip = `${number.value}${controlProperties.suffix}`;

		// Update Variable
		updateValue(range)
	}

	const updateValue = (event) => {
		controlProperties.value = event.value;
		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.name, `${event.value}${controlProperties.suffix}`);
	}
	
	elem.querySelector('input[type="range"]').addEventListener('input', updateRange, false);
	elem.querySelector('input[type="range"]').addEventListener('change', updateRange, false);
	
	elem.querySelector('input[type="number"]').addEventListener('input', updateNumber, false);
	elem.querySelector('input[type="number"]').addEventListener('change', updateNumber, false);

	// Add Function to restore to default setting
	const restoreDefault = (event) => {		
		elem.querySelector('input[type="number"]').value = parseFloat(properties?.default);

		elem.querySelector('input[type="number"]').dispatchEvent(new Event('change'));
	}
	elem.querySelector('button[data-action="reset"]').addEventListener('click', restoreDefault, false);
};