# Google Tag Manager (w/ EEC)

SRFA Cartridge to implement google tag manager with enhanced e-commerce tracking (EEC)

## Installation

1. Add cartridge to cartridge path
2. Import the metadata included in the `meta/` folder
2. Add to `package.json`
    - Should point to the location of this repository within your project

```json
"dependencies": {
...
"gtm": "file:./gtm/"
...
},
```

3. Include in `main.js`

```js
$(document).ready(function () {
...
    var GMT = require('gtm');
    GTM.init();
...
});
```

4. If overriding SFRA common/scripts.isml be sure to add the following at the top. If not overriding the cartridge provides this file based on SFRA (December 2018)

```html
<isinclude template="gtm/globaldatalayer">
<isinclude url="${URLUtils.url('GTM-Tracking')}">
```

## Development

* In development you should reference the gtm init script directly. Either through a webpack "alias" or via relative path to the file itself. Otherwise webpack will ignore changes for watching purposes when referenced as an installed package as described above in the installation instructions.

### Extending

* Additional custom GTM events can simply be added to the GTM dataLayer as normal. It will not interfere with the out of box EEC events.

#### Extension Hooks

* TODO
