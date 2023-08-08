# Version 1.0.12 - Wait so you wanted the module to work? Weird...
- Fixed an issue that caused missing images when using libThemer with the PF2e Dorako UI Theme

# Version 1.0.11 - Opt-in Loading Screen
- Changed the loading overlay to opt-in instead of opt-out. My apologizes to those who were annoyed by it.
 - Also moved setting to client, so individual users can decide if they want to use it or not.
- Moved the `--glass-bg` for PF2e Dorako UI closer to the top, as this variable is used for the app background for this UI

# Version 1.0.10 - Wait, I am Loading...
- Added Loading Overlay to make theme transition smoother between Foundry and libThemer
  - You can disable this in the settings of libThemer
- Moved Player CSS variables to Core libThemer, users will no longer need to enable Tidy Sidebar Chat to get these variables
- Fixed D&D5e Char Card Header Colors
- Fixed Module Management window using `shaded` text color instead of `contrast` text colors
- Added PF2e Dorako UI Theme Frosted Glass Theme Options


# Version 1.0.9 - PF2e System and PF2e Dorako UI Theme Support
- Added Settings to allow users to adjust the CSS variables for the PF2e System
- Added Settings to allow users to adjust the CSS variables for the PF2e Dorako UI Module

# Version 1.0.8 - Tidy Chat
- Added a Chat Card theme design stolen from [Luckas](https://discord.com/channels/170995199584108546/1065764029278212230/1130303762515361902) on Discord... It was too pretty not to steal.
  - Has two settings, one for the border radius of the chat cards and the other if the chat card should be brought to the front when hovered over.
- Added CSS Variables for Player Color `--player-color-PLYAERID`and `--player-color-PLAYERID-contrast` variables
  - These CSS variables will update anytime a player changes their color for live changes to any UI using them
- Fixed Chat Textarea not getting themed in `Foundry Colorized`.... Sorry this took so long...
- Some minor fixes to Chat Card CSS Buttons and headers...

> Not really required but I found the best way to use is to do something like the following
> on your element define a css variable like `--player-color: var(--player-color-PLAYERID, DEFAULT_COLOR);`
> this way in your CSS you just have to do `var(--player-color)`

Here is sample code for how its used in the Tidy Sidebar Chat
```javascript
// On Load of libThemer Logic
// Get Chat Cards and Set Player Color
document.querySelectorAll('#sidebar #chat .chat-message').forEach((elem) => {
  // Loop through all messages that existed before libThemer was laaded
	let message = game.messages.get(elem.dataset.messageId);
  // Set the Player Color
	elem.style.setProperty('--player-color', `var(--player-color-${message.user.id}, ${message.user.color})`);
});

// On New Chat Cards set Player Color
Hooks.on('renderChatMessage', async (chatMessage, [elem], data) => {
  // Hey, a new message! Lets set the Player Color
	elem.style.setProperty('--player-color', `var(--player-color-${data.user.id}, ${data.user.color})`);
});
```

# Version 1.0.7 - v11 Probably...
- Fixed an issue with the default fonts not being wrapped in quotes and breaking fonts with spaces such as *Font Awesome 6 Pro*
- Removed `compatibility.max` from `module.json` and set `compatibility.verified` to `11`

# Version 1.0.6 - Image Patches
- stylesheets are now placed before libThemers style element so that the settings will always take effect.
- Added reset to default for Images
- Added logic to handle if image uses a css variable instead of a url

# Version 1.0.5 - QOL Stuff
- Blatantly copied @TyphonJS StyleManager Logic to move css variables `html` element to `style` element.
- Fixed Localization for Activating Preset.
- Updated TidyHUD
  - Broke Options into individual togglable options
  - Added the ability to align the hotbar
  - Added the option to expand player UI when showing offline Players
- Updated Collapsible Button to a plus and minus
  - Added the ability to click on the title to open and collapse.
- Fixed resetting default color when not using lib - Color Settings from setting color to black
- Updated Presets to only Save values that are not defaults
- Added two Default Presets

# version 1.0.4 - GM Theme
- Fixed issue with GM Theme not hiding Configure Theme Button with Fantasy RPG UI
- Fixed GM Theme not applying to user when logging into world
- Updated GM Theme logic to only update changed setting on players end, This should make it more efficient when changing settings

# version 1.0.3 - You can't replace Integers with a string...
- Fixed `number` control not working correctly if default was set to a value that wasn't a string.

# version 1.0.2 - Patch'm Up Boi's
- Dropped Token Action HUD as its support has been added to TAH
- Fixed Controls querySelector to be more Specific
- Updated `Library` control to do collapsible elements
  - Collapse state does not save. Will be fixed at a later time
- Added `format` key word for theme settings
- Added `Hooks.call('lib-themer.UpdateSettings', ...args)` event.
- Fixed Foundry VTT them font options to have a step of `0.0025` instead of `1`
- Added Theming Support for Monks Tokenbar
- Added Theming Support for Quick Insert - Search Widget 
- Fixed Styling for Library Sub Elements when only one Sub Element Exists

# Version 1.0.1 - Grammar is Hard
- Fixed spelling on Readme
- Added Theming Support for Token Action HUD

# Version 1.0.0 - Foundry, Make it Your Way
## libThemer
libThemer is mostly a library module designed to allow developers to define css variables and optional stylesheets for users to customize the look and feel of foundry, game systems or modules.

> **PLEASE NOTE** This is a library module and isn't intended to do much on its own. Its designed to give developers an easy system to define and edit css varibles and optional stylesheets. With that said, I understand no one would really want a module that doesn't do much, so I have added the ability to modify all of foundry's default CSS variables and created my own examples for how you could implement libThemer into your project.

![image](https://user-images.githubusercontent.com/564874/190925581-53eb9116-ac9d-4c0c-a052-e2a29f93bc2e.png)

### Features
Define css variables with the following types:
- **Color:** Generates a color input using either the default color picker or the amazing color picker from [lib - Color Settings](https://github.com/ardittristan/VTTColorSettings). 
- **Number:** Generates an *adequate* range slider that allows users to pick a number. This range slider allows you to define a suffix or it assumes on based on the default.
- **Font Family:** Generates a dropdown that will allow you to pick from any fonts registered in foundry.
- **Stylesheet:** Generates an input that allows users to toggle optional stylesheets.

#### Google Fonts
To help users expand on their UI design libThemer has added the ability to link to and use fonts from [Google Fonts](https://fonts.google.com/). The most common license is the [SIL Open Font License](https://scripts.sil.org/OFL). Some fonts are under the [Apache license](https://www.apache.org/licenses/LICENSE-2.0) or [Ubuntu Font License](https://ubuntu.com/legal/font-licence).

> **PLEASE NOTE:** That by adding a font via this interface, Google will recieve access to your IP address. If you are uncomfortable with this, turn off this feature.

## Using libThemer

Check out the [wiki](https://github.com/mouse0270/lib-themer/wiki) for all the Theme Type Options and how to [Register a Theme](https://github.com/mouse0270/lib-themer/wiki/Registering-a-Theme)
