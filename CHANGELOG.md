# Version 1.0.2 - More Support
- Added Themeing Support for Monks Tokenbar

# Version 1.0.1 - Grammar is Hard
- Fixed spelling on Readme
- Added Themeing Support for Token Action HUD

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

> **PLEASE NOTE:** That by adding a font via this interface, Google will recieve access to your IP address. If you are comfortable with this, turn off this feature.

## Using libThemer

Check out the [wiki](https://github.com/mouse0270/lib-themer/wiki) for all the Theme Type Options and how to [Register a Theme](https://github.com/mouse0270/lib-themer/wiki/Registering-a-Theme)
