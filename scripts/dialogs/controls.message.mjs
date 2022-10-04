
// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlMessage(elemContainer, setting, properties) {
	const controlProperties = {

	}
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<div class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</div>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector(`.form-group[data-type="${properties.type}"]:last-of-type`);
}