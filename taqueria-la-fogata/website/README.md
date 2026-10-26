# Restaurant website

Existing bilingual, static site reused from PR #4. **Review version; not approved for public launch.** Confirmed online phone: (770) 794-2122. Street address, hours, current menu/prices and social ownership require confirmation. Unknown details are omitted; promotions and expansion are off.

See [launch review and sources](../docs/LAUNCH-READINESS.md) for the evidence, outstanding owner input and separate-repository migration instructions.

## Edit and check

Edit `site-config.js`. Verification flags are evidence declarations, not cosmetic switches. Unknown schedule means call for hours, not closed. `launchApproved` remains false until business review is complete. Only explicitly approved promotions render.

```sh
node build-metadata.js
node build-preview.js
node test.js
node validate.js
```

Open `index.html` to review or use a local static server. Phone dialing requires a phone handler; clipboard may require a secure context, with manual text selection as fallback. External Google fonts have system-font fallbacks. The website does not collect orders, accept payments, or send analytics events.

## Release

```sh
node build-release.js
```

This fails until launch review is complete. On success it generates `../dist/` containing only runtime files. Do not deploy the project root, strategy docs or the entire website source directory.

Prepare the separate repository using `../scripts/prepare-repository.js`; use the manual Pages workflow supplied in `../deployment/pages.yml`. No repository, Pages publication or custom domain is created automatically. Pages' branch folder picker supports only root and `/docs`; use GitHub Actions for this layout.

`build-metadata.js` keeps static search metadata in sync with confirmed config. `build-preview.js` produces a complete single-file preview retaining viewport and noindex metadata. Never edit the generated preview directly. After every content change, regenerate both and rerun checks.
