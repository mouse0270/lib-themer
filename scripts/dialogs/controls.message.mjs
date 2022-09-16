
// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlMessage(elemContainer, setting, properties) {
	const controlProperties = {
		colorPicker: game.modules.get('colorsettings')?.active ?? false,
		value: tinycolor(properties?.value ?? properties.default).toHex8String(),
		alpha: parseInt(tinycolor(properties?.value ?? properties.default).getAlpha() * 100) ?? 100,
		variations: (properties?.metadata?.variations ?? false),
		palette: (properties?.metadata?.palette ?? false),
		shades: (properties?.metadata?.shades ?? false),
		buttons: (properties?.metadata?.buttons ?? false)
	}
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<div class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</div>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');
}