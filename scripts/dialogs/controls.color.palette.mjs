
// GET REQUIRED LIBRARIES
import '../libraries/color.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlColorPalette(elemContainer, setting, properties) {
	const controlProperties = {
		colorPicker: game.modules.get('colorsettings')?.active ?? false,
		value: tinycolor(properties?.value ?? properties.default).toHex8String(),
		alpha: parseInt(tinycolor(properties?.value ?? properties.default).getAlpha() * 100) ?? 100,
		variations: (properties?.metadata?.variations ?? false),
		palette: (properties?.metadata?.palette ?? false),
		shades: (properties?.metadata?.shades ?? false),
		buttons: (properties?.metadata?.buttons ?? false)
	}
	if (!controlProperties.colorPicker) controlProperties.value = tinycolor(properties?.value ?? properties.default).toHexString()

	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<input type="${controlProperties.colorPicker ? 'text' : 'color'}" name="${setting}" value="${controlProperties.value}" is="colorpicker-input" data-responsive-color data-watch-picker-change>
		<button type="button" data-action="reset" data-tooltip="${MODULE.localize('dialog.theme.reset')}"><i class="fa-duotone fa-rotate"></i></button>
		<input type="range" name="${setting}" class="${controlProperties.colorPicker ? 'hidden' : ''}" value="${controlProperties.alpha}" min="0" max="100" data-tooltip="${controlProperties.alpha}" />
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
		<ul class="color-palette palette${controlProperties.palette ? '' : ' hidden'}">
			<li style="background-color: var(${setting}-100);">
				<span style="color: var(${setting}-100-contrast);">100</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-100-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-200);">
				<span style="color: var(${setting}-200-contrast);">200</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-200-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-300);">
				<span style="color: var(${setting}-300-contrast);">300</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-300-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-400);">
				<span style="color: var(${setting}-400-contrast);">400</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-400-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-500);">
				<span style="color: var(${setting}-500-contrast);">500</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-500-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-600);">
				<span style="color: var(${setting}-600-contrast);">600</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-600-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-700);">
				<span style="color: var(${setting}-700-contrast);">700</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-700-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-800);">
				<span style="color: var(${setting}-800-contrast);">800</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-800-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-900);">
				<span style="color: var(${setting}-900-contrast);">900</span>
				<span${controlProperties.shades ? '' : ' class="hidden"'} style="color: var(${setting}-900-shaded);">shaded</span>
			</li>
		</ul>
		<ul class="color-palette variations${controlProperties.variations ? '' : ' hidden'}">
			<li style="background-color: var(${setting}-light);">
				<span style="color: var(${setting}-light-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting});">
				<span style="color: var(${setting}-contrast);">Contrast</span>
				<span style="color: var(${setting}-shaded);">shaded</span>
			</li>
			<li style="background-color: var(${setting}-dark);">
				<span style="color: var(${setting}-dark-shaded);">shaded</span>
			</li>
		</ul>
		<ul class="color-palette buttons${controlProperties.buttons ? '' : ' hidden'}">
			<li>
				<a name="${setting}">Example Button</a>
				<a name="${setting}-hover">Button State :hover</a>
				<a name="${setting}-active">Button State :active</a>
			</li>
			<style>
				.color-palette a[name="${setting}"],
				.color-palette a[name="${setting}-hover"],
				.color-palette a[name="${setting}-active"] {
					width: 50%;
					margin: 0 1px;
					font-size: var(--font-size-14);
					line-height: 28px;
					font-family: var(--font-primary);
					cursor: pointer;
					text-align: center;
					border-radius: 3px;
					user-select: none !important;
					-webkit-user-select: none !important;

					background-color: var(${setting});
					border: 1px solid var(${setting}-outline);
					color: var(${setting}-contrast);
					transition: all 0.1s ease-in-out;
				}
				.color-palette a[name="${setting}-hover"],
				.color-palette a[name="${setting}"]:hover {
					background-color: var(${setting}-hover) !important;
					border-color: var(${setting}-hover-outline) !important;
					color: var(${setting}-hover-contrast) !important;
					text-shadow: none !important;
				}
				.color-palette a[name="${setting}-active"],
				.color-palette a[name="${setting}"]:active {
					background-color: var(${setting}-active) !important;
					border-color: var(${setting}-active-outline) !important;
					color: var(${setting}-active-contrast) !important;
					text-shadow: none !important;
				}
			</style>
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
		// Fix Input Text Color
		event.target.style.color = tinycolor.mostReadable(event.detail.hex, ['#000', '#fff']);
		event.target.style.backgroundColor = event.detail.hex;

		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, event.detail.hex);
	}

	// If Color Settings is Enabled, Use Custom Color Picker, Otherwise use Browser Color Picker and Range Slider
	if (game.modules.get('colorsettings')?.active) {
		// Bind Events for when Color is Changed
		elem.querySelector('input[type="text"][is="colorpicker-input"]').addEventListener('pickerChange', colorSettingsWidget, false);
		elem.querySelector('input[type="text"][is="colorpicker-input"]').addEventListener('pickerDone', colorSettingsWidget, false);

		// Update Input Text Color
		elem.querySelector('input[type="text"][is="colorpicker-input"]').style.color = tinycolor.mostReadable(elem.querySelector('input[type="text"][is="colorpicker-input"]').value, ['#000', '#fff']);
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