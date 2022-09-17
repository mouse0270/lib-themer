// GET MODULE CORE
import { MODULE } from "../_module.mjs";

// GET CONTROLS
import { ControlMessage } from './controls.message.mjs';
import { ControlColor } from './controls.color.mjs';
import { ControlNumber } from './controls.number.mjs';
import { ControlFontFamily } from './controls.font-family.mjs';
import { ControlChoices } from './controls.choices.mjs';
import { ControlBackground } from './controls.background.mjs';
import { ControlFiles } from './controls.files.mjs';

export class CONTROLS {
	static ControlMessage = ControlMessage;
	static ControlColor = ControlColor;
	static ControlNumber = ControlNumber;
	static ControlFontFamily = ControlFontFamily;
	static ControlChoices = ControlChoices;
	static ControlBackground = ControlBackground;
	static ControlFiles = ControlFiles;

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
				CONTROLS.ControlColor(elem, setting, properties);
			}else if (properties.type == "number") {
				CONTROLS.ControlNumber(elem, setting, properties);
			}else if (properties.type == "font-family") {
				CONTROLS.ControlFontFamily(elem, setting, properties);
			}else if (properties.type == "choices") {
				CONTROLS.ControlChoices(elem, setting, properties);
			}else if (properties.type == "background") {
				CONTROLS.ControlBackground(elem, setting, properties);
			}else if (properties.type == "library") {
				CONTROLS.ControlFiles(elem, setting, properties);
			}
		}
	}
}
