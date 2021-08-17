import { MODULE } from "./_module.mjs";
import Color from "./lib/color.mjs";

export default class LibThemerES {
	constructor() {
		// Store Theme Data
		MODULE.store = { themeData: {}, themeDefaults: {} };
	}

	static init = () => {
		// Initialize Settings be retrieving saved settings
		MODULE.store.themeData = MODULE.setting('themeSettings');

		// Initialize the API
		this.api()

		// Register Built in Themes
		this.registerThemesInFolder(`./modules/${MODULE.name}/themes/`).then(response => {
			if (MODULE.setting('userStorage').length > 0) {
				this.registerThemesInFolder(MODULE.setting('userStorage')).then(response => {
					this.setTheme(MODULE.setting('themeSettings'));
				});
			}else{
				this.setTheme(MODULE.setting('themeSettings'));
			}
		});
	}

	static api = () => {
		// Yes this only has one function
		game.modules.get(MODULE.name).api = {
			registerTheme: this.registerTheme,
			registerThemes: this.registerThemesInFolder,
			setTheme: this.setTheme,
			generateColor: this.generateColor,
			generatePalette: this.generatePalette
		}
	}

	/**
	 * Loops through a list of of theme settings and applies them
	 * @param {Object} [options] - Theme options to be changed or applied. Leaving this empty will apply all theme options
	 */
	 static setTheme = (options) => {
		// If options are left blank, use saved themes setting
		options = (typeof options == 'undefined' ? MODULE.store.themeData : options);
		for (const [themeId, settings] of Object.entries(options)) {
			for (const [settingId, setting] of Object.entries(settings)) {
				if (setting.type == 'color' || setting.type == 'shades' || setting.type == 'palette') {
					let colors = setting.type == 'palette' ? this.generatePalette(settingId, setting.default) : this.generateColor(settingId, setting.default, setting.type);
					for (const [key, color] of Object.entries(colors)) {
						document.documentElement.style.setProperty(key, color);
					}
				}else if (setting.type == 'stylesheet') {
					if (!setting.default) { // Remove Setting if its false
						$(`head link[name="${settingId}"]`).remove();
					} else if ($(`head link[name="${settingId}"]`).length == 0) { // If setting is enabled but stylesheet is not laoded
						// Verify File Exists
						this.checkIfFileExists(setting.style).then(file => {
							if ($(`head link[name="${settingId}"]`).length == 0) { // Check incase async call has happened again. Prevent adding again.
								$('head').append(`<link rel="stylesheet" type="text/css" name="${settingId}" href="${file}">`);
							}
						});
					} else if (setting.type == 'imagevideo') {
						if (typeof setting.default == 'string') { // If only the background image was provided, set blend mode to normal;
							document.documentElement.style.setProperty(`${settingId}-blend-mode`, 'normal');
							document.documentElement.style.setProperty(settingId, setting.default.length == 0 ? 'none' : `url('/${setting.default}')`);
						}else if (typeof setting.default == 'object') {
							for (const [key, imageProperty] of Object.entries(setting.default)) {
								if (key.endsWith('-blend-mode')) {
									document.documentElement.style.setProperty(key, imageProperty);
								}else{
									document.documentElement.style.setProperty(key, imageProperty.length >= 1 ? `url('/${imageProperty}')` : 'none');
								}
							};
						}
					}
				}
			}
		};
	}

	/**
	 * Uses foundry's filebrowser to verify a specific file exists.
	 * This should be used before attempting to fetch a file, as this will help prevent errors for missing files.
	 * @param {string} [fileLocation] - The file to Check if it exists
	 * @param {Object} options - Foundrys FileBrowser Options
	 */
	// TODO: Move Check if File exists to Mouses-Lib
	// ? Should I make a function/method to get file name from string path... It looks ugly
	static checkIfFileExists = async (fileLocation, options={}) => {
		// Use Foundry FilePicker to get list of available files
		return await FilePicker.browse('user', fileLocation, options).then(response => {
			// Get filename from Path | Split pop found to be the fastest method
			let fileName = fileLocation.split('\\').pop().split('/').pop();
			// Get a list of files that match fileName | Should only ever be one file
			let files =  response.files.filter(file => file.toLowerCase().endsWith(fileName));
			// If a file exists, return that file
			if (files.length > 0) return files;
			throw TypeError(`unable to find ${file}, this theme will not be registered`);
		})
		// Return File That Was Found
		.then(file => file)
		// Throw Error
		.catch(error => console.warn(error))
	}

	/**
	 * Attempts to load a localization file and import it into foundrys localization
	 * @param {string} fileLocation - The directory to loop through
	 */
	// ? Should this be off handed to mouses-lib.
	// ? its a useful function for managing dynamic localization
	static loadLocalizationFile = async (fileLocation) => {
		// Check if file Location has more then one file, if so use the default game language file, otherwise use the first file
		const languageFile = fileLocation.length > 1 ? fileLocation.filter(file => file.lang == game.i18n.lang)[0] : fileLocation[0]

		// Absolute paths are expected from registered modules. 
		// Modules should provide `./` with their modules
		// If this is missing from the string, assume were loading a user defined theme
		if (!languageFile.path.startsWith('./')) languageFile.path = `./${MODULE.setting('localStorage')}/${languageFile.path}`;

		// Check if file Exists and assign the returning file to file variable.
		let file = await this.checkIfFileExists(languageFile.path, { extensions: ['.json'] });

		// If file exists | Process returned JSON data.
		if (file ?? false) {
			await fetch(file).then(response => {
				// Verify File was Fetched
				if (response.status !== 200) throw TypeError(`Unable to load requested localization file ${file}`);
				return response.json();
			}).then(json => {
				// Inform console that File was loaded
				console.log(`Loaded localization file ${file}`);
				// Merge Dynamically loaded Localization inot Foundry.
				// Expand json to make sure we account for user formatting.
				foundry.utils.mergeObject(
					game.i18n.translations, 
					foundry.utils.expandObject(json)
				);
			});
		}
	}

   /**
	* Stores the Theme Data.
    * @param {string} themeId - They key given to lib-themer for internal use.
    * @param {object} themeData - A json object containing theme data.
    */
	static setupThemeOptions = (themeId, themeData) => {
		// define localization options as defaults if they are not provided
		themeData = foundry.utils.mergeObject({
			name: `${MODULE.name}.theme.${themeId}.name`,
			title: `${MODULE.name}.theme.${themeId}.title`
		}, themeData, { inplace: false });

		// Handle for Localization Files
		// Check if localization is provided in theme data, otherwise use en
		if (themeData?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en")?.length > 0) {
			this.loadLocalizationFile(themeData?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en"));
		}

		// create theme option where themeId is key
		let themeOptions = {}; themeOptions[themeId] = themeData;

		foundry.utils.mergeObject(MODULE.store.themeDefaults ?? {}, themeOptions);
		MODULE.store.themeData = foundry.utils.mergeObject(themeOptions, MODULE.store.themeData ?? {}, { inplace: false });
		MODULE.store = {themeData: MODULE.store.themeData };

		// Save Player Theme Data
		MODULE.setting('themeSettings', MODULE.store.themeData);

		// Return Theme Data
		return ([themeId, themeOptions])
	}

   /**
	* Loops through folder path and attempts to load any json files in that directory
    * @param {string} folderPath - The directory to loop through
    */
	static registerThemesInFolder = async(folderPath) => {
		let files = await FilePicker.browse('user', `${folderPath}`, { extensions: ['.json'] }).then(response => response.files);

		let themeData = [];

		if (files.length > 0) {
			for (const file of files) {
				themeData.push(await this.registerTheme(file));
			}
		}

		return themeData;
	}

   /**
	* Registers a themes data with lib-themer
    * @param {string} [themeId] - They key given to lib-themer for internal use.
    * @param {string | object} themeData - Either a string value pointing to a file, or a json object containing theme data.
    */
	// ? Should I make a function/method to get file name from string path... It looks ugly
	static registerTheme = async (themeId, themeData) => {
		// If themeData is empty, assume themeId contains themeData
		themeData = themeData ?? themeId;
		themeId = (themeId == themeData ? themeId.split('\\').pop().split('/').pop() : themeId).replace('.json', '');

		// If themeData is a string, Assume its a File
		if (typeof themeData == 'string') {
			// Check if File Exists
			let themeFile = await this.checkIfFileExists(themeData, { extensions: ['.json'] });

			// If file exists | Process returned JSON data.
			if (themeFile ?? false) {
				// Fetch JSON data from file location and save into themeData
				themeData = await fetch(themeFile).then(response => response.json()).then(json => json);
			} 
		}

		// Setup the Theme Options and return that for use by caller.
		return this.setupThemeOptions(themeId, themeData);
	}

	static generateColor(name, color, type) {
		let palette = {};
		// Set Default --[name]
		palette[`${name}`] = new Color(color).color;

		// If type is shades generate Shading and text contrast options
		if (type == 'shades') {
			// Set Default --[name]-contrast-text
			palette[`${name}-contrast-text`] = new Color(new Color(color).color).contrast();

			// Set Default --[name]-light && --[name]-dark
			palette[`${name}-light`] = new Color(color).tint(30);
			palette[`${name}-light-contrast-text`] = new Color(palette[`${name}-light`]).contrast();
			palette[`${name}-light-shaded-text`] = new Color(palette[`${name}-light`]).shiftColor(40);

			palette[`${name}-dark`] = new Color(color).shade(30);
			palette[`${name}-dark-contrast-text`] = new Color(palette[`${name}-dark`]).contrast();
			palette[`${name}-dark-shaded-text`] = new Color(palette[`${name}-dark`]).shiftColor(40);
			
			// Set Default --[name]-hover && --[name]-active
			if (palette[`${name}-contrast-text`] == '#ffffff') {
				palette[`${name}-hover`] = new Color(color).shade(15);
				palette[`${name}-active`] = new Color(color).shade(20);
			}else{
				palette[`${name}-hover`] = new Color(color).tint(15);
				palette[`${name}-active`] = new Color(color).tint(20);
			}
			palette[`${name}-shaded-text`] = new Color(color).shiftColor(40);
		}

		return palette
	}

	static generatePalette(name, color) {
		let palette = {};
		// Set Default --palette-[color]
		palette[`${name}`] = new Color(color).color;
		palette[`${name}-contrast-text`] = new Color(new Color(color).color).contrast();
		// Set Default --palette-[color]-[level]
		palette[`${name}-100`] = new Color(color).tint(80);
		palette[`${name}-100-contrast-text`] = new Color(new Color(color).tint(80)).contrast();
		palette[`${name}-200`] = new Color(color).tint(60);
		palette[`${name}-200-contrast-text`] = new Color(new Color(color).tint(60)).contrast();
		palette[`${name}-300`] = new Color(color).tint(40);
		palette[`${name}-300-contrast-text`] = new Color(new Color(color).tint(40)).contrast();
		palette[`${name}-400`] = new Color(color).tint(20);
		palette[`${name}-400-contrast-text`] = new Color(new Color(color).tint(20)).contrast();
		palette[`${name}-500`] = new Color(color).color;
		palette[`${name}-500-contrast-text`] = new Color(new Color(color).color).contrast();
		palette[`${name}-600`] = new Color(color).shade(20);
		palette[`${name}-600-contrast-text`] = new Color(new Color(color).shade(20)).contrast();
		palette[`${name}-700`] = new Color(color).shade(40);
		palette[`${name}-700-contrast-text`] = new Color(new Color(color).shade(40)).contrast();
		palette[`${name}-800`] = new Color(color).shade(60);
		palette[`${name}-800-contrast-text`] = new Color(new Color(color).shade(60)).contrast();
		palette[`${name}-900`] = new Color(color).shade(80);
		palette[`${name}-900-contrast-text`] = new Color(new Color(color).shade(80)).contrast();

		return palette
	}
}