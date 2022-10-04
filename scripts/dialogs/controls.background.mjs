// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

export function ControlBackground(elemContainer, setting, properties) {
	const controlProperties = {
		value: {
			blend: (properties?.value?.blend ?? properties.default?.blend) ?? 'normal',
			url: ((properties?.value?.url ?? properties.default?.url) ?? '').replace('url(/', '').replace(')', '')
		}
	}

	// Add Element To Container
	elemContainer.insertAdjacentHTML('beforeend', `<div class="form-group" data-type="${properties.type}">
		<label><strong>${this.localize(properties?.name ?? `${setting}.name`) ?? setting}</strong></label>
		<div class="form-fields">
			<select>
				<option value="normal">Normal</option>
				<option value="multiply">Multiply</option>
				<option value="screen">Screen</option>
				<option value="overlay">Overlay</option>
				<option value="darken">Darken</option>
				<option value="lighten">Lighten</option>
				<option value="color-dodge">Color Dodge</option>
				<option value="color-burn">Color Burn</option>
				<option value="hard-light">Hard Light</option>
				<option value="soft-light">Soft Light</option>
				<option value="difference">Difference</option>
				<option value="exclusion">Exclusion</option>
				<option value="hue">Hue</option>
				<option value="saturation">Saturation</option>
				<option value="color">Color</option>
				<option value="luminosity">Luminosity</option>
			</select>
			<input type="text" name="${setting}" value="${controlProperties.value.url}" />
			<button type="button" class="file-picker" title="Browse Images" tabindex="-1">
				<i class="fas fa-file-import fa-fw"></i>
			</button>
		</div>
		<p class="notes${(properties?.hint ?? false) ? '' : ' hidden'}">${this.localize(properties?.hint ?? `${setting}.hint`) ?? ''}</p>
	</div>`);
	// Get Element Added
	const elem = elemContainer.querySelector(`.form-group[data-type="${properties.type}"]:last-of-type`);

	if (!game.permissions.FILES_BROWSE.includes(game.user.role)) elem.querySelector('button.file-picker').remove();

	// Select Blend Mode
	elem.querySelector('select').value = controlProperties.value.blend;

	const updateURL = (event) => {
		// Update Variable
		let url = elem.querySelector('input[type="text"]').value;
		if (url.length > 0 && !url.startsWith('http')) url = `/${url}`;
		if (url.length > 0) url = `url(${url})`;
		
		game.modules.get(MODULE.ID).API.setCSSVariable(`${elem.querySelector('input[type="text"]').name}`, {
			blend: elem.querySelector('select').value,
			url: url
		});
	}

	const openFileBrowser = (event) => {
		const filePicker = new FilePicker({
			type: 'imagevideo',
			current: elem.querySelector('input[type="text"]').value,
			callback: path => {
				elem.querySelector('input[type="text"]').value = path;
				elem.querySelector('input[type="text"]').dispatchEvent(new Event('change'));
			}
		});
		return filePicker.browse();
	}

	elem.querySelector('select').addEventListener('change', updateURL, false);
	elem.querySelector('input[type="text"]').addEventListener('change', updateURL, false);
	elem.querySelector('button.file-picker')?.addEventListener('click', openFileBrowser, false) ?? false;
};