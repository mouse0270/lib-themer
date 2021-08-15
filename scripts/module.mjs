class LibThemerES extends MousesLib {
	constructor(module) {
		super(module);

		// Store Theme Data
		this.themeData = {};
		this.themeDefaults = {};

		// register API Calls
		this.api();
	}

	api = () => {
		// Yes this only has one function
		game.modules.get("lib-themer").api = {
			registerTheme: this.registerTheme
		}
	}

	setTheme = (options) => {
		// If options are left blank, use saved themes setting
		options = (typeof options == 'undefined' ? this.themeData : options);
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

	// TODO: Move Check if File exists to Mouses-Lib
	// ? Should I make a function/method to get file name from string path... It looks ugly
	checkIfFileExists = async (fileLocation, options={}) => {
		// Use Foundry FilePicker to get list of available files
		return await FilePicker.browse('user', fileLocation, options).then(response => {
			// Get filename from Path | Split pop found to be the fastest method
			let fileName = fileLocation.split('\\').pop().split('/').pop();
			// Get a list of files that match fileName | Should only ever be one file
			let files =  response.files.filter(file => file.toLowerCase().endsWith(fileName));
			// If a file exists, return that file
			if (files.length > 0) return files[0];
			throw TypeError(`unable to find ${file}, this theme will not be registered`);
		})
		// Return File That Was Found
		.then(file => file)
		// Throw Error
		.catch(error => this.ERROR(error))
	}

	// ? Should this be off handed to mouses-lib.
	// ? its a useful function for managing dynamic localization
	loadLocalizationFile = async (fileLocation) => {
		// Check if file Location has more then one file, if so use the default game language file, otherwise use the first file
		const languageFile = fileLocation[
			fileLocation.length > 1 ? fileLocation.filter(file => file.lang == game.i18n.lang)[0] : fileLocation[0]
		];

		// Absolute paths are expected from registered modules. 
		// Modules should provide `./` with their modules
		// If this is missing from the string, assume were loading a user defined theme
		if (!languageFile.path.startsWith('./')) languageFile.path = `./${this.setting('localStorage')}/${languageFile.path}`;

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
				this.LOG(`Loaded localization file ${file}`);
				// Merge Dynamically loaded Localization inot Foundry.
				// Expand json to make sure we account for user formatting.
				foundry.utils.mergeObject(
					game.i18n.translations, 
					foundry.utils.expandObject(json)
				);
			});
		}
	}

	setupThemeOptions = (themeId, themeData) => {
		// define localization options as defaults if they are not provided
		themeData = foundry.utils.mergeObject({
			name: `lib-themer.theme.${themeId}.name`,
			title: `lib-themer.theme.${themeId}.title`
		}, themeData, { inplace: false });

		// Handle for Localization Files
		// Check if localization is provided in theme data, otherwise use en
		if (themeData?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en")?.length > 0) {
			this.loadLocalizationFile(themeData?.languages?.filter(language => language.lang == game.i18n.lang || language.lang == "en"));
		}

		// create theme option where themeId is key
		let themeOptions = {}; themeOptions[themeId] = themeData;
		foundry.utils.mergeObject(this.themeDefaults, themeOptions);
		this.themeData = foundry.utils.mergeObject(themeOptions, this.themeData, { inplace: false });

		// Save Player Theme Data
		this.setting('themeSettings', this.themeData);

		// Return Theme Data
		return ([themeId, themeOptions])
	}

	registerThemesInFolder = async(folderPath) => {
		let files = await FilePicker.browse('user', `${folderPath}`, { extensions: ['.json'] }).then(response => response.files);

		if (files.length > 0) {
			for (const file of files) {
				await this.registerTheme(file);
			}
		}
	}

   /**
	* Registers a themes data with lib-themer
    * @param {string} [themeId] - They key given to lib-themer for internal use.
    * @param {string | object} themeData - Either a string value pointing to a file, or a json object containing theme data.
    */
	// ? Should I make a function/method to get file name from string path... It looks ugly
	registerTheme = async (themeId, themeData) => {
		// If themeData is empty, assume themeId contains themeData
		themeData = themeData ?? themeId;
		themeId = themeId == themeData ? themeId.split('\\').pop().split('/').pop() : themeId;

		// If themeData is a string, Assume its a File
		if (typeof themeData == 'string') {
			// Check if File Exists
			let themeFile = await this.checkIfFileExists(themeData, { extensions: ['.json'] });

			// If file exists | Process returned JSON data.
			if (themeFile ?? false) {
				// Fetch JSON data from file location and save into themeData
				themeData = await fetch(themeFile).then(response => response.json()).then(json => json);

				// Save Fetched JSON into Library Theme Data
				this.themeData = foundry.utils.mergeObject(themeData, this.themeData);
			} 
		}

		// Setup the Theme Options and return that for use by caller.
		return this.setupThemeOptions(themeId, this.themeData);
	}
}

Hooks.on('init', () => {
	let libThemerES	= new LibThemerES({
		name: 'lib-themer',
		title: 'Lib Themer',
	});
	console.log(libThemerES)
});

Hooks.once('ready', async () => {
	game.modules.get('lib-themer').api.registerTheme('./modules/lib-themer/themes/lib-themer.json').then(([themeId, themeData]) => {
		console.log(themeId, themeData);
	});
})
