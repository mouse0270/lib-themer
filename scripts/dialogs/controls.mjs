// GET MODULE CORE
import { MODULE } from "../_module.mjs";

// GET CONTROLS
import { ControlMessage } from './controls.message.mjs';
import { ControlColor } from './controls.color.mjs';
import { ControlColorPalette } from './controls.color.palette.mjs';
import { ControlNumber } from './controls.number.mjs';
import { ControlFontFamily } from './controls.font-family.mjs';
import { ControlBackground } from './controls.background.mjs';
import { ControlStylesheet } from './controls.stylesheet.mjs';

export class CONTROLS {
	static ControlMessage = ControlMessage;
	static ControlColor = ControlColor;
	static ControlColorPalette = ControlColorPalette;
	static ControlNumber = ControlNumber;
	static ControlFontFamily = ControlFontFamily;
	static ControlBackground = ControlBackground;
	static ControlStylesheet = ControlStylesheet;

	static get ThemeID() {
		return document.querySelector(`#${MODULE.ID}-dialog aside.sidebar nav ol.directory-list li.directory-item.active`).dataset.themeId;
	}

	static localize = (property) => {
		// store localization
		let localizedString = game.i18n.localize(`${property}`);

		// If localized String is equal to localization path, assume locaization failed and let control display value
		return localizedString != `${property}` ? localizedString : property.split('.').slice(0, (property.split('.').length > 1 ? property.split('.').length - 1 : 1)).join('.');
	}

	static manageControls = (elem, settings) => {
		for (const [setting, properties] of Object.entries(settings)) {
			if (properties.type == 'message') {
				CONTROLS.ControlMessage(elem, setting, properties);
			}else if (properties.type == 'color') {
				CONTROLS.ControlColorPalette(elem, setting, properties);
			}else if (properties.type == "number") {
				CONTROLS.ControlNumber(elem, setting, properties);
			}else if (properties.type == "font-family") {
				CONTROLS.ControlFontFamily(elem, setting, properties);
			}else if (properties.type == "background") {
				CONTROLS.ControlBackground(elem, setting, properties);
			}else if (properties.type == "stylesheet") {
				CONTROLS.ControlStylesheet(elem, setting, properties);
			}
		}
	}
}
