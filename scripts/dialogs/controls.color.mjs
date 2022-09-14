
// GET REQUIRED LIBRARIES
import '../libraries/color.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlColor(elemContainer, setting, properties) {
	const controlProperties = {
		colorPicker: game.modules.get('colorsettings')?.active ?? false,
		value: tinycolor(properties?.value ?? properties.default).toHex8String(),
		alpha: parseInt(tinycolor(properties?.value ?? properties.default).getAlpha() * 100) ?? 100,
		variations: (properties?.properties?.variations ?? false),
		contrast: (properties?.metadata?.contrast ?? true),
		shaded: (properties?.metadata?.contrast ?? false),
		palette: (properties?.metadata?.contrast ?? false),
		button: (properties?.metadata?.contrast ?? false),
	}
	if (!controlProperties.colorPicker) controlProperties.value = tinycolor(properties?.value ?? properties.default).toHexString()

	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<input type="${controlProperties.colorPicker ? 'text' : 'color'}" name="${setting}" value="${controlProperties.value}" is="colorpicker-input" data-responsive-color data-watch-picker-change>
		<button type="button" data-action="reset" data-tooltip="${MODULE.localize('dialog.theme.reset')}"><i class="fa-duotone fa-rotate"></i></button>
		<input type="range" name="${setting}" class="${controlProperties.colorPicker ? 'hidden' : ''}" value="${controlProperties.alpha}" min="0" max="100" data-tooltip="${controlProperties.alpha}" />
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
		<ul class="color-palette${controlProperties.variations ? '' : ' hidden'}">
			<li style="background-color: var(${setting});">
				<span style="color: var(${setting}-contrast);">Contrast</span>
				<span style="color: var(${setting}-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting});color: var(${setting}-text);">text</li>
			<li style="background-color: var(${setting});color: var(${setting}-muted);">muted</li>
			<li style="background-color: var(${setting});color: var(${setting}-shaded);">shaded</li>
			<li style="background-color: var(${setting});color: var(${setting}-dark);">dark</li>
		</ul>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');

	// Bind Browser Color Events
	const browserColorWidget = (event) => {
		const colorInput = event.target.closest('.form-group').querySelector('input[type="color"]');
		const rangeInput = event.target.closest('.form-group').querySelector('input[type="range"]');
		let color = tinycolor(colorInput.value).setAlpha(rangeInput.value / 100);

		// Update Range Slider Input
		if (event.target.type == "range") {
			rangeInput.dataset.tooltip = rangeInput.value;
			game.tooltip.activate(rangeInput, {text: rangeInput.value});
		}

		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(colorInput.name, color.toHex8String());
	}

	// Bind ColorSettings Events
	const colorSettingsWidget = (event) => {
		event.target.style.color = tinycolor.mostReadable(event.detail.hex, ['#000', '#fff']);
		event.target.style.backgroundColor = event.detail.hex;

		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, event.detail.hex);
	}

	// If Color Settings is Enabled, Use Custom Color Picker, Otherwise use Browser Color Picker and Range Slider
	if (game.modules.get('colorsettings')?.active) {
		// Bind Events for when Color is Changed
		elem.querySelector('input[is="colorpicker-input"]').addEventListener('pickerChange', colorSettingsWidget, false);
		elem.querySelector('input[is="colorpicker-input"]').addEventListener('pickerDone', colorSettingsWidget, false);

		// Update Input Text Color
		elem.querySelector('input[is="colorpicker-input"]').style.color = tinycolor.mostReadable(elem.querySelector('input[is="colorpicker-input"]').value, ['#000', '#fff']);
	}else{
		// Bind Events for Color and Range Silder
		elem.querySelector('input[type="color"]').addEventListener('input', browserColorWidget, false);
		elem.querySelector('input[type="color"]').addEventListener('change', browserColorWidget, false);
		elem.querySelector('input[type="range"]').addEventListener('input', browserColorWidget, false);
		elem.querySelector('input[type="range"]').addEventListener('change', browserColorWidget, false);
	}

	// Add Function to restore to default setting
	const restoreDefault = (event) => {
		var defaults = {
			value: tinycolor(properties.default).toHex8String(),
			alpha: parseInt(tinycolor(properties.default).getAlpha() * 100) ?? 100,
		}
		
		elem.querySelector('input[is="colorpicker-input"]').value = defaults.value;
		elem.querySelector('input[type="range"]').value = defaults.alpha;

		elem.querySelector('input[is="colorpicker-input"]').dispatchEvent(new Event('change'));
		elem.querySelector('input[is="colorpicker-input"]').dispatchEvent(new CustomEvent('pickerChange', {
			bubbles: true,
			detail: {
				hex: defaults.value
			}
		}));
	}
	elem.querySelector('button[data-action="reset"]').addEventListener('click', restoreDefault, false);
}