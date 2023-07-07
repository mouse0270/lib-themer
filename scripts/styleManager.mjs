import { MODULE } from "./_module.mjs";

export class StyleManager {
	#stylesheet;
	#cssRules;

	constructor() {
		if (!document.querySelector(`head style[name="${MODULE.ID}"]`)) {
			document.querySelector(`head`).insertAdjacentHTML('beforeend', `<style name="${MODULE.ID}">:root {}</style>`);
		}

		this.#stylesheet = document.querySelector(`head style[name="${MODULE.ID}"]`);
		this.#cssRules = this.#stylesheet.sheet.cssRules[0].style;
	}

	get(property) {
		this.#cssRules.getPropertyValue(property);
	}

	set(properties) {
		for (const [property, value] of Object.entries(properties)) {
			this.#cssRules.setProperty(property, value);
		}
	}

	remove(properties) {
		for (const property of Array.isArray(properties) ? properties : [properties])
			if (typeof property === 'string')
				this.#cssRules.removeProperty(property);
	}
}