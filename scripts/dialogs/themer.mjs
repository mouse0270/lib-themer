// GET REQUIRED LIBRARIES
import '../libraries/color.js';

// GET MODULE CORE
import { MODULE } from '../_module.mjs';

// GET THEME CONTROLS
import { CONTROLS } from './controls.mjs'; 
import { PresetDialog } from './presets.mjs';

export class ThemeDialog extends FormApplication {
	constructor(data) {
		super();
		
		let cloneData = Object.assign({}, data);

		// Make sure FoundryVTT and libThemer are the first Two
		this.THEMES = {
			"lib-themer": cloneData["lib-themer"],
			"foundry-vtt": cloneData["foundry-vtt"]
		}
		// Remove them from the list
		delete cloneData["foundry-vtt"];
		delete cloneData["lib-themer"];

		// Sort Remaning Themes by Title
		const sortable = Object.keys(cloneData).sort(function(a, b) {
			const titleA = game.i18n.localize(cloneData[a].title).toUpperCase();
			const titleB = game.i18n.localize(cloneData[b].title).toUpperCase();
			return titleA < titleB ? -1 : (titleA > titleB) ? 1 : 0;
		});
		// Add Sorted Title to Themes Lists
		sortable.forEach(theme => {
			this.THEMES[theme] = cloneData[theme];
		});
		

		//this.THEMES = data;
		const supportedTypes = ['color', 'number', 'font-family', 'choices', 'library'];

		function countSettings(theme) {
			let counter = 0;
			for (const id in theme) {
				const property = theme[id];
				if (typeof property == 'object' && (supportedTypes.includes((property?.type ?? '').toLowerCase()) ?? false)) {
					counter++
					if ((typeof property?.settings == 'object') ?? false) {
						counter += countSettings(property.settings);
					}
				}
			}

			return counter;
		}

		for (const key in this.THEMES) {
			const theme = this.THEMES[key];
			this.THEMES[key]['properties'] = countSettings(theme) || 0;

			// Remove Theme if it has no properties
			if (this.THEMES[key]['properties'] == 0) delete this.THEMES[key]
		}
	}
  
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: MODULE.TITLE,
			id: `${MODULE.ID}-dialog`,
			classes: ['sheet', 'journal-sheet', 'journal-entry'],
			popOut: true,
			resizable: true,
			template: `./modules/${MODULE.ID}/templates/themer.hbs`,
			width: $(window).width() > 960 ? 960 : $(window).width() - 100,
			height: $(window).height() > 800 ? 800 : $(window).height() - 100
		});
	}
  
	getData() {
		// Send data to the template
		return {
			DIALOG: {
				ID: MODULE.ID,
				TITLE: MODULE.TITLE
			},
			THEMES: this.THEMES
		};
	}
  
	async activateListeners(html) {
		super.activateListeners(html);

		const navElements = html[0].querySelectorAll('aside.sidebar nav ol.directory-list li.directory-item');
		navElements.forEach((navElem) => {
			navElem.querySelectorAll('span').forEach(spanElem => {
				spanElem.addEventListener('click', (event) => {
					const elem = event.target.closest('li');
					html[0].querySelector('.journal-entry-pages > .scrollable').scrollTop = 0;

					// Uncheck active changelog
					navElements.forEach(activeElem => activeElem.classList.remove('active'));
					// Check new changelog as active
					elem.classList.add('active');

					// Update Theme Title
					html[0].querySelector('section.journal-entry-content .journal-header input.title').value = game.i18n.localize(this.THEMES[elem.dataset.themeId]?.title ?? 'UNKNOWN');
					html[0].querySelector('.journal-entry-content article.journal-entry-page form').innerHTML = "";

					CONTROLS.manageControls(html[0].querySelector('.journal-entry-content article.journal-entry-page form'), foundry.utils.mergeObject(
						this.THEMES[elem.dataset.themeId], 
						MODULE.setting('themeSettings'), 
						{ inplace: false, insertKeys: false }
					));

					// Disable Buttons
					html[0].querySelectorAll('aside.sidebar .action-buttons button').forEach(btn => btn.disabled = false );
					if (navElements[0].classList.contains('active')) html[0].querySelector('aside.sidebar .action-buttons button[data-action="previous"]').disabled = true;
					if (navElements[navElements.length - 1].classList.contains('active')) html[0].querySelector('aside.sidebar .action-buttons button[data-action="next"]').disabled = true;
				});
			});
		});

		// Bind Next/Prev Buttons
		const nextButton = html[0].querySelector('aside.sidebar .action-buttons button[data-action="next"]');
		const previousButton = html[0].querySelector('aside.sidebar .action-buttons button[data-action="previous"]');

		nextButton.addEventListener('click', (event) => {
			html[0].querySelector('aside.sidebar nav ol.directory-list li.directory-item.active').nextElementSibling.querySelector('.page-title').click();
		});
		nextButton.addEventListener('mouseleave', (event) => {
			event.target.blur();
		});
		previousButton.addEventListener('click', (event) => {
			html[0].querySelector('aside.sidebar nav ol.directory-list li.directory-item.active').previousElementSibling.querySelector('.page-title').click();
		});
		previousButton.addEventListener('mouseleave', (event) => {
			event.target.blur();
		});

		// Bind Collapse Toggle
		const collapseElem = html[0].querySelector('aside.sidebar .directory-header a.action-button.collapse-toggle');
		collapseElem.addEventListener('click', (event) => {
			const app = html[0].closest('.app');
			const sidebar = app.querySelector(".sidebar");
			const button = sidebar.querySelector(".collapse-toggle");
			const sidebarCollapsed = !sidebar.classList.contains('collapsed');
		
			// Disable application interaction temporarily
			app.style.pointerEvents = "none";
		
			// Configure CSS transitions for the application window
			app.classList.add("collapsing");
			app.addEventListener("transitionend", () => {
				app.style.pointerEvents = "";
				app.classList.remove("collapsing");
			}, {once: true});
		
			// Learn the configure sidebar widths
			const style = getComputedStyle(sidebar);
			const expandedWidth = Number(style.getPropertyValue("--sidebar-width-expanded").trim().replace("px", ""));
			const collapsedWidth = Number(style.getPropertyValue("--sidebar-width-collapsed").trim().replace("px", ""));
		
			// Change application position
			const delta = expandedWidth - collapsedWidth;
			this.setPosition({
			  left: this.position.left + (sidebarCollapsed ? delta : -delta),
			  width: this.position.width + (sidebarCollapsed ? -delta : delta)
			});
		
			// Toggle display of the sidebar
			sidebar.classList.toggle("collapsed", sidebarCollapsed);
		
			// Update icons and labels
			button.dataset.tooltip = sidebarCollapsed ? "JOURNAL.ViewExpand" : "JOURNAL.ViewCollapse";
			const i = button.children[0];
			i.setAttribute("class", `fa-solid ${sidebarCollapsed ? "fa-caret-left" : "fa-caret-right"}`);

			// Add Tooltip for Manage Presets
			const elemPresets = app.querySelector('.journal-sidebar .action-buttons button.manage');
			elemPresets.dataset.tooltip = sidebarCollapsed ? elemPresets.textContent.trim() : "";
			game.tooltip.deactivate();
		});

		// Presets Menu
		const managePresetsButtons = html[0].querySelector('aside.sidebar .action-buttons button[data-action="managePresets"]');
		managePresetsButtons.addEventListener('click', (event) => {
			new PresetDialog().render(true);
		});

		
		navElements[0].querySelector('.page-title').click();
	}
  
	async _updateObject(event, formData) {
		console.log(formData.exampleInput);
	}
}