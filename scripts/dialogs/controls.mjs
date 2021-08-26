import { MODULE } from "../_module.mjs";

export class CONTROLS {
	static description(props) {
		return `${props.description}`
	} 
	static preset(props) {
		return `<label>${MODULE.localize('dialog.preset.name')}</label>
			<div class="form-fields">
				<select name="lib-themer.preset"></select>
			</div>
			<div class="notes">${MODULE.localize('dialog.preset.hint')}</div>`
	}
	static presetOptions(props) {
		return `<option value="--preset-custom">${MODULE.localize('preset.custom.name')}</option>
			${Object.entries(props).map(([settingId, setting]) => {
				if (settingId != 'activePreset'){ 
					return `<option value="${settingId}" ${settingId == props.activePreset ? 'selected' : ''}>${setting.name ?? MODULE.localize(`${settingId.substr(2).replace(/-/g, '.')}.name`)}</option>`;
				}
			}).join('')}`
	}
	static color(props) {
		return `<label>${game.i18n.localize(props.name)}</label>
			<input type="${game.modules.get('colorsettings')?.active ?? false ? 'text' : 'color'}" name="${props.property}" style="background: var(${props.property}); color: var(${props.property}-contrast-text);" data-type="${props.type}" value="${game.modules.get('colorsettings')?.active ?? false ? props.default : props.default.substr(0, 7)}" ${game.modules.get('colorsettings')?.active ?? false ? 'is="colorpicker-input" data-responsive-color data-watch-picker-change' : ''}>
			<div class="notes">${game.i18n.localize(props.hint)}</div>
			<div class="lib-themer-preview shades">
				<span style="background: var(${props.property}); color: var(${props.property}-contrast-text);">
					Base
					<span style="color: var(${props.property}-shaded-text);">Shaded</span>
				</span>
			</div>`
	}
	static shades(props) { 
		return `<label>${game.i18n.localize(props.name)}</label>
			<input type="${game.modules.get('colorsettings')?.active ?? false ? 'text' : 'color'}" name="${props.property}" style="background: var(${props.property}); color: var(${props.property}-contrast-text);" data-type="${props.type}" value="${game.modules.get('colorsettings')?.active ?? false ? props.default : props.default.substr(0, 7)}" ${game.modules.get('colorsettings')?.active ?? false ? 'is="colorpicker-input" data-responsive-color data-watch-picker-change' : ''}>
			<div class="notes">${game.i18n.localize(props.hint)}</div>
			<div class="lib-themer-preview shades">
				<span style="background: var(${props.property}-lighter); color: var(${props.property}-lighter-contrast-text);">
					lighter
					<span style="color: var(${props.property}-lighter-shaded-text);">Shaded</span>
				</span>
				<span style="background: var(${props.property}-light); color: var(${props.property}-light-contrast-text);">
					light
					<span style="color: var(${props.property}-light-shaded-text);">Shaded</span>
				</span>
				<span style="background: var(${props.property}); color: var(${props.property}-contrast-text);">
					Base
					<span style="color: var(${props.property}-shaded-text);">Shaded</span>
				</span>
				<span style="background: var(${props.property}-hover); color: var(${props.property}-contrast-text);">hover</span>
				<span style="background: var(${props.property}-active); color: var(${props.property}-contrast-text);">active</span>
				<span style="background: var(${props.property}-dark); color: var(${props.property}-dark-contrast-text);">
					dark
					<span style="color: var(${props.property}-dark-shaded-text);">Shaded</span>
				</span>
				<span style="background: var(${props.property}-darker); color: var(${props.property}-darker-contrast-text);">
					darker
					<span style="color: var(${props.property}-darker-shaded-text);">Shaded</span>
				</span>
			</div>`
	}
	static palette(props) {
		return `<label>${game.i18n.localize(props.name)}</label>
			<input type="${game.modules.get('colorsettings')?.active ?? false ? 'text' : 'color'}" name="${props.property}" style="background: var(${props.property}); color: var(${props.property}-contrast-text);" data-type="${props.type}" value="${game.modules.get('colorsettings')?.active ?? false ? props.default : props.default.substr(0, 7)}" ${game.modules.get('colorsettings')?.active ?? false ? ' is="colorpicker-input" data-responsive-color data-watch-picker-change' : ''} >
			<div class="notes">${game.i18n.localize(props.hint)}</div>
			<div class="lib-themer-preview shades">
				<span style="background: var(${props.property}-100); color: var(${props.property}-100-contrast-text);">100</span>
				<span style="background: var(${props.property}-200); color: var(${props.property}-200-contrast-text);">200</span>
				<span style="background: var(${props.property}-300); color: var(${props.property}-300-contrast-text);">300</span>
				<span style="background: var(${props.property}-400); color: var(${props.property}-400-contrast-text);">400</span>
				<span style="background: var(${props.property}-500); color: var(${props.property}-500-contrast-text);">500</span>
				<span style="background: var(${props.property}-600); color: var(${props.property}-600-contrast-text);">600</span>
				<span style="background: var(${props.property}-700); color: var(${props.property}-700-contrast-text);">700</span>
				<span style="background: var(${props.property}-800); color: var(${props.property}-800-contrast-text);">800</span>
				<span style="background: var(${props.property}-900); color: var(${props.property}-900-contrast-text);">900</span>
			</div>`
	}
	static stylesheet(props) {
		return `<label for="${props.property}">${game.i18n.localize(props.name)}</label>
			<div class="form-fields">
				<input type="checkbox" name="${props.property}" data-type="${props.type}" data-dtype="Boolean" ${props.default ? 'checked' : ''}>
			</div>
			<div class="notes">${game.i18n.localize(props.hint)}</div>`
	}
	static imagevideo(props) {
		return `<div class="form-group form-group-file-picker">
			<label for="${props.property}">${game.i18n.localize(props.name)}</label>
			<div class="form-fields">
				<select>
					<option value="normal" ${props.default?.[`${props.property}-blend-mode`] == 'normal' ? 'selected' : '' ?? ''}>Normal</option>
					<option value="multiply" ${props.default?.[`${props.property}-blend-mode`] == 'multiply' ? 'selected' : '' ?? ''}>Multiply</option>
					<option value="screen" ${props.default?.[`${props.property}-blend-mode`] == 'screen' ? 'selected' : '' ?? ''}>Screen</option>
					<option value="overlay" ${props.default?.[`${props.property}-blend-mode`] == 'overlay' ? 'selected' : '' ?? ''}>Overlay</option>
					<option value="darken" ${props.default?.[`${props.property}-blend-mode`] == 'darken' ? 'selected' : '' ?? ''}>Darken</option>
					<option value="lighten" ${props.default?.[`${props.property}-blend-mode`] == 'lighten' ? 'selected' : '' ?? ''}>Lighten</option>
					<option value="color-dodge" ${props.default?.[`${props.property}-blend-mode`] == 'color-dodge' ? 'selected' : '' ?? ''}>Color Dodge</option>
					<option value="color-burn" ${props.default?.[`${props.property}-blend-mode`] == 'color-burn' ? 'selected' : '' ?? ''}>Color Burn</option>
					<option value="hard-light" ${props.default?.[`${props.property}-blend-mode`] == 'hard-light' ? 'selected' : '' ?? ''}>Hard Light</option>
					<option value="soft-light" ${props.default?.[`${props.property}-blend-mode`] == 'soft-light' ? 'selected' : '' ?? ''}>Soft Light</option>
					<option value="difference" ${props.default?.[`${props.property}-blend-mode`] == 'difference' ? 'selected' : '' ?? ''}>Difference</option>
					<option value="exclusion" ${props.default?.[`${props.property}-blend-mode`] == 'exclusion' ? 'selected' : '' ?? ''}>Exclusion</option>
					<option value="hue" ${props.default?.[`${props.property}-blend-mode`] == 'hue' ? 'selected' : '' ?? ''}>Hue</option>
					<option value="saturation" ${props.default?.[`${props.property}-blend-mode`] == 'saturation' ? 'selected' : '' ?? ''}>Saturation</option>
					<option value="color" ${props.default?.[`${props.property}-blend-mode`] == 'color' ? 'selected' : '' ?? ''}>Color</option>
					<option value="luminosity" ${props.default?.[`${props.property}-blend-mode`] == 'luminosity' ? 'selected' : '' ?? ''}>Luminosity</option>
				</select>
				<input type="text" data-type="${props.type}" name="${props.property}" value="${props.default?.[props.property] ?? ''}" />
				<button type="button" class="file-picker" data-type="${props.type}" data-target="${props.property}" title="Browse Images" tabindex="-1">
					<i class="fas fa-file-import fa-fw"></i>
				</button>
			</div>
			<div class="notes">${game.i18n.localize(props.hint)}</div>
		</div>`
	}
}