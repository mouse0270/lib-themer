// GET REQUIRED LIBRARIES
import '../libraries/webfont.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlFontFamily(elemContainer, setting, properties) {
	const controlProperties = {
		value: properties?.value ?? properties.default
	}
	
	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<select name="${setting}" style="flex: 0;"></select>
		<button type="button" data-action="reset" data-tooltip="${MODULE.localize('dialog.theme.reset')}"><i class="fa-duotone fa-rotate"></i></button>
		<div class="font-family-preview" style="font-family: var(${setting})">
			<p>The five boxing wizards jump quickly.</p>
		</div>
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector('.form-group:last-of-type');

	// Add Default Fonts
	if (Object.entries(CONFIG.fontDefinitions)?.length > 0 ?? false) elem.querySelector(`select[name="${setting}"]`).insertAdjacentHTML('beforeend', `<optgroup label="System Fonts"></optgroup>`);
	for (const [key, value] of Object.entries(CONFIG.fontDefinitions)) {
		elem.querySelector(`select[name="${setting}"] optgroup[label="System Fonts"]`).insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`);
	}
	// Add Custom Fonts
	if ((Object.entries(game.settings.get('core', 'fonts'))?.length > 0 ?? false) || (Object.entries(MODULE.setting('fonts'))?.length > 0 ?? false)) elem.querySelector(`select[name="${setting}"]`).insertAdjacentHTML('beforeend', `<optgroup label="Custom Fonts"></optgroup>`);
	for (const [key, value] of Object.entries(game.settings.get('core', 'fonts'))) {
		elem.querySelector(`select[name="${setting}"] optgroup[label="Custom Fonts"]`).insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`);
	}
	// Add Google Fonts
	for (const [key, value] of Object.entries(MODULE.setting('fonts'))) {
		elem.querySelector(`select[name="${setting}"] optgroup[label="Custom Fonts"]`).insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`);
	}
	// Add Generic Fonts & Font Awesome 6 Pro
	elem.querySelector(`select[name="${setting}"]`).insertAdjacentHTML('beforeend', `<optgroup label="Generic Fonts"></optgroup>`);
	['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong'].forEach(key => {
		elem.querySelector(`select[name="${setting}"] optgroup[label="Generic Fonts"]`).insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`);
	})
	// Add Icon Fonts (Currently only Font Awesome 6 Pro)
	elem.querySelector(`select[name="${setting}"]`).insertAdjacentHTML('beforeend', `<optgroup label="Icon Fonts"></optgroup>`);
	['Font Awesome 6 Pro'].forEach(key => {
		elem.querySelector(`select[name="${setting}"] optgroup[label="Icon Fonts"]`).insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`);
	})

	elem.querySelectorAll(`select[name="${setting}"] option`).forEach(elemOption => {
		if (controlProperties.value.includes(elemOption.value)) {
			elemOption.closest(`select[name="${setting}"]`).value = elemOption.value;
		}
	});

	const updateValue = (primaryFont) => {
		// Update Variable
		game.modules.get(MODULE.ID).API.setCSSVariable(event.target.name, `"${event.target.value}"`);
	}

	// Bind Events
	elem.querySelector(`select[name="${setting}"]`).addEventListener('change', updateValue, false);

	// Add Function to restore to default setting
	const restoreDefault = (event) => {		
		elem.querySelectorAll(`select[name="${setting}"] option`).forEach(elemOption => {
			if (properties.default.includes(elemOption.value)) {
				elemOption.closest(`select[name="${setting}"]`).value = elemOption.value;
			}
		});

		elem.querySelector(`select[name="${setting}"]`).dispatchEvent(new Event('change'));
	}
	elem.querySelector('button[data-action="reset"]').addEventListener('click', restoreDefault, false);
};