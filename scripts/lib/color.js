class Color {
	constructor(color) {
		this.color = (color.toLowerCase().startsWith('rgb') ? this.#rgba2hex(color) : color.padEnd(9, 'f')).toLowerCase();
	}
	// Private Classes
	#dex2hex = (dex) => dex.toString(16);
	#hex2dec = (hex) => parseInt(hex, 16);
	#hex2rgba = (hex) => {
		return {
			r: +`0x${hex[1]+hex[2]}`,
			g: +`0x${hex[3]+hex[4]}`,
			b: +`0x${hex[5]+hex[6]}`,
			a: hex.length == 9 ? +(`0x${hex[7]+hex[8]}` / 255).toFixed(3) : 1
		}
	};
	#rgba2hex = (rgba) => {
		if (typeof rgba == 'string') {
			let color = rgba.match(/[d*\.?\d*$\?%]+/g);
			rgba = {
				r: parseInt(color[0]),
				g: parseInt(color[1]),
				b: parseInt(color[2]),
				a: parseFloat(color.length == 4 ? (color[3].endsWith('%') ? (parseInt(color[3]) / 100) : color[3]) : 1).toFixed(3)
			}
			
		}
		return `#${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}${Math.round(rgba.a * 255).toString(16).padStart(2, '0')}`
	}

	brightness = () => {
		let rgba = this.#hex2rgba(this.color);
		return (rgba.r * 0.299 + rgba.g * 0.587 + rgba.b * 0.114)
	}

	contrast = () => {
		let rgba = this.#hex2rgba(this.color);
		return (rgba.r * 0.299 + rgba.g * 0.587 + rgba.b * 0.114) > 130 ? '#000000' : '#ffffff';
	}

	// Method
	mix = (color, weight) => {
		// If weight is not provided set to 50%
		weight = (typeof weight != 'undefined' ? 100 - weight : 50);

		// Handle for Opacity not Provided || Use opacity of option provided or default to FF
		if (this.color.length <= 7 && color.length == 9) this.color += color.slice(7, 9);
		if (color.length <= 7 && this.color.length == 9) color += this.color.slice(7, 9);

		// Create Place Holder for return Color
		let newColor = '';

		// Loop through hex pairs
		for (let index = 1; index <= (this.color.length - 2); index += 2) {
			let colorPart1 = this.#hex2dec(this.color.slice(index, index + 2));
			let colorPart2 = this.#hex2dec(color.slice(index, index + 2));

			let colorValue = this.#dex2hex(Math.floor(colorPart2 + (colorPart1 - colorPart2) * (weight / 100)));
			newColor += colorValue.padStart(2, '0');
		}
		return `#${newColor}`.toLowerCase();
	}
	tint = (weight) => this.mix('#ffffff', weight);
	shade = (weight) => this.mix('#000000', weight);
}