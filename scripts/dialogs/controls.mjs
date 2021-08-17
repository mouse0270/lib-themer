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
		return `<option>custom</option>
			${Object.entries(props).map(([settingId, setting]) => {
				return `<option value="${settingId}">${MODULE.localize(`${settingId.substr(2).replace(/-/g, '.')}.name`)}</option>`;
			}).join('')}`
	}
	static shades(props) { 
		return `<label>${game.i18n.localize(props.name)}</label>
			<input type="${game.modules.get('colorsetting') ?? false ? 'text' : 'color'}" name="${props.property}" style="background: var(${props.property}); color: var(${props.property}-contrast-text);" data-type="${props.type}" value="${game.modules.get('colorsetting') ?? false ? props.default : props.default.substr(0, 7)}" ${game.modules.get('colorsetting') ?? false ? 'is="colorpicker-input" data-responsive-color data-watch-picker-change' : ''}>
			<div class="notes">${game.i18n.localize(props.hint)}</div>
			<div class="lib-themer-preview shades">
				<span style="background: var(${props.property}); color: var(${props.property}-contrast-text);">
					Base
					<span style="color: var(${props.property}-shaded-text);">shaded</span>
				</span>
				<span style="background: var(${props.property}-hover); color: var(${props.property}-contrast-text);">hover</span>
				<span style="background: var(${props.property}-active); color: var(${props.property}-contrast-text);">active</span>
				<span style="background: var(${props.property}-dark); color: var(${props.property}-dark-contrast-text);">
					dark
					<span style="color: var(${props.property}-dark-shaded-text);">shaded</span>
				</span>
				<span style="background: var(${props.property}-light); color: var(${props.property}-light-contrast-text);">
					light
					<span style="color: var(${props.property}-light-shaded-text);">shaded</span>
				</span>
			</div>`
	}
	static palette(props) {
		return `<label>${game.i18n.localize(props.name)}</label>
				<input type="${game.modules.get('colorsetting') ?? false ? 'text' : 'color'}" name="${props.property}" style="background: var(${props.property}); color: var(${props.property}-contrast-text);" data-type="${props.type}" value="${game.modules.get('colorsetting') ?? false ? props.default : props.default.substr(0, 7)}" ${game.modules.get('colorsetting') ?? false ? ' is="colorpicker-input" data-responsive-color data-watch-picker-change' : ''} >
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
				</div>
			</div>`
	}
	static stylesheet(props) {
		return `<label for="${props.property}">${game.i18n.localize(props.name)}</label>
			<div class="form-fields">
				<input type="checkbox" name="${props.property}" data-type="${props.type}" data-dtype="Boolean" ${props.default ? 'checked' : ''}>
			</div>
			<div class="notes">${game.i18n.localize(props.hint)}</div>`
	}
}