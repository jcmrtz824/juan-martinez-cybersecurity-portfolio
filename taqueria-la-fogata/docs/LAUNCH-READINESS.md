# Taqueria La Fogata launch review

Reviewed October 26, 2026. **Not approved for public launch.** Existing implementation reused from PR #4 at `de4f7ac714eef26ac6e47cec2641f5240cda6b5d`. No new public website, domain, offer, expansion promise, or social account has been created. No restaurant listing has been edited.

## Business evidence and decisions

| Field | Evidence found | Website decision |
|---|---|---|
| Name / city / family ownership | User-provided project scope; existing project | Keep Taqueria La Fogata, Kennesaw, GA |
| Telephone | Restaurantji, Yellow Pages, Zmenu, Allmenus agree on (770) 794-2122 | Replace 555 number, including metadata and regenerated preview. Corroborated online; no test call made |
| Street / suite | Restaurantji and Zmenu show 2651 Cobb Pkwy NW; Yellow Pages shows 2650. Cobb Courier's June 2025 inspection report gives 2650, suite 2. A historical Georgia DOR record gives 2651, suite 2 | Resolved by Juan on October 26, 2026: **2650 Cobb Parkway NW, Suite 2, Kennesaw, GA 30152**. Address and address-based Google Maps directions enabled; exact business pin not yet confirmed |
| Weekly hours | Restaurantji (page says updated Oct 10, 2026), Zmenu: Mon–Fri 10am–8pm, Sat–Sun 10am–9pm. Yellow Pages: daily 10am–9pm. MenuPix: Mon–Wed/Sun until 9pm, Thu–Sat until 10pm | Withhold schedule; display bilingual call-for-hours message. Never interpret missing hours as closed |
| Menu / pricing | Allmenus and SinglePlatform have matching-address menus but no reliable current owner approval; Restaurantji references tacos/menudo. Menu photos could not be retrieved | Remove entire sample menu from runtime, including popular/dietary/ingredient claims; request current owner menu. Do not copy third-party prices or claim online ordering is available |
| Social / Google links | Yellow Pages links a Facebook page, but ownership/current use could not be checked. No verified Kennesaw Instagram/TikTok handle found. Matching names belong to many other restaurants | Remove guessed TikTok; leave social links blank. Do not call the candidate Facebook link official |
| Promotions / expansion | No specific authorization to offer the discount or promise patio/cocktails/summer 2027 | Both disabled and require explicit approval flags to render; sample promotional text removed |
| Food preparation claims | Original config claimed handmade tortillas and daily-ground salsa without current owner evidence | Replace with modest family-owned description |

Directory freshness is not proof of accuracy or independent sourcing. Some listings may share upstream data. Conflicts cannot be resolved by counting listings.

Sources checked:

- https://www.restaurantji.com/ga/kennesaw/la-fogata-/
- https://www.zmenu.com/la-fogata-kennesaw-online-menu/ (search text available; direct fetch blocked)
- https://www.yellowpages.com/kennesaw-ga/mip/la-fogata-1353806
- https://www.menupix.com/atlanta/restaurants/2212754/La-Fogata-Kennesaw-GA
- https://www.allmenus.com/ga/kennesaw/641909-la-fogata/menu/
- https://places.singleplatform.com/la-fogata-34/menu
- https://cobbcountycourier.com/2025/07/health-inspection-scores-for-cobb-county-restaurants-and-other-food-services-from-june-27-to-july-3/
- https://dor.georgia.gov/sites/dor.georgia.gov/files/related_files/document/Alcohol%20accounts%20active%204-1-2019.pdf (historical record only; not evidence of current licensing)
- Candidate Facebook (unverified): https://www.facebook.com/pages/la-fogata/144247412264633 (direct fetch unavailable)

## Implemented safeguards

`usingPlaceholders` is false because fabricated content was removed, **not because all business facts are confirmed**. Separate `verified` fields control rendering. `launchApproved` stays false. Review notice and `noindex, nofollow` remain. Noindex is a search hint, not access control; use local review until a private hosting route is selected.

The street and suite are owner-confirmed. Unknown hours/menu/social details never appear as customer facts. Address metadata is included; unverified schedules and menu remain absent from schema.org metadata. Directions use the confirmed address, without claiming a verified Google business pin. `build-metadata.js` generates static JSON-LD from confirmed config rather than a separately maintained copy. Regenerate metadata and preview after every content edit.

Existing language/theme controls, phone CTAs, copy behavior and layout are reused. Overnight status now checks the previous day's interval, including when the following day is closed. If timezone support fails, status becomes unknown instead of using the visitor's local time. Today highlighting refreshes at midnight.

## Verification

- JavaScript syntax checks and review-content validation pass.
- 14 regression scenario groups pass: confirmed-address rendering/directions; unknown data; Spanish/theme controls; opening/closing boundaries; Eastern standard/daylight time; previous-day overnight hours; closed days; unapproved offer suppression.
- Actual browser: English and Spanish rendering, language/theme toggles, visible phone URL, absent promotions/social/sample menu (directions were withheld during the initial review and enabled after owner address confirmation), phone-copy fallback (clipboard unavailable; correct number selected for manual copying), language persistence and visual layout checked. Browser-extension diagnostics are unrelated to this app.
- Release validation intentionally refuses the current config because owner review is incomplete.
- Real phone dialing, a confirmed map pin, current social ownership, verified prices, mobile-device testing and a deployed HTTPS URL remain outstanding.

## Owner input needed

1. **Address resolved:** Juan confirmed 2650 Cobb Parkway NW, Suite 2 on October 26, 2026. Address-based directions are enabled. An exact business-pin/share URL and customer entrance remain to be checked.
2. Current seven-day hours, including closed days and any holiday exceptions. If special hours differ, update the schedule for those dates before relying on the badge.
3. Current menu: items, prices, portions, availability and any dietary/ingredient wording. A current menu photo is sufficient to start transcription.
4. Official social profile URLs, or confirm that there are none. Optional links may remain absent for launch.
5. Confirm the listed phone still reaches the restaurant, then approve reviewed business content. No promotions or expansion announcements are needed for launch.

## Separate repository and deployment

The GitHub connector exposes no repository-creation operation. `jcmrtz824/taqueria-la-fogata` returned 404: absent **or inaccessible**, not proof that it does not exist. The portfolio repo reports `has_pages: false`; this does not rule out an unrelated external deployment. Publication remains unverified.

Prepare a clean standalone source folder (no portfolio history or other portfolio projects):

```sh
node taqueria-la-fogata/scripts/prepare-repository.js /absolute/new/taqueria-la-fogata
```

An authorized GitHub owner should create or provide access to an empty `jcmrtz824/taqueria-la-fogata` repository, initially private where supported. Do not initialize it with a README. From the prepared directory:

```sh
git init -b main
git add .
git commit -m "Reuse and prepare La Fogata website for reviewed launch"
git remote add origin https://github.com/jcmrtz824/taqueria-la-fogata.git
git push -u origin main
```

Keep Pages disabled during source migration. Source visibility and website visibility are separate. GitHub Pages can expose a public website even from a private repository. Existing `docs/` and `docs/later/` contain historical assumptions and business planning; keep source private until the owner reviews them. **Only `dist/` is a hosting artifact.**

After business confirmation: update config and verification flags, keep promotions off, set `launchApproved: true`, regenerate metadata/preview and run tests plus `node website/validate.js --release`. `node website/build-release.js` copies only four runtime files and `.nojekyll` into `dist/`; it excludes planning docs, financial assumptions, tests and preview files.

`deployment/pages.yml` is inert in the portfolio. The preparation script installs it as `.github/workflows/pages.yml` in the standalone repo. It is manual-only, restricted to `jcmrtz824/taqueria-la-fogata` on `main`, and runs the release gate before uploading `dist/`.

When ready to publish, an owner can configure Settings → Pages → GitHub Actions and appropriate `github-pages` environment restrictions, then manually dispatch the workflow. The old README incorrectly suggested choosing `/taqueria-la-fogata/website` in Pages' branch-folder picker; GitHub only supports root or `/docs` in that picker.

Deployment reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

After a successful deployment: verify the returned HTTPS URL, test it on a phone, check calls and the owner-confirmed destination, confirm Spanish and layout, and inspect source metadata. Only then add the verified URL to GBP and official social profiles. No domain availability or ownership is assumed. Preserve PR #4 until migration and deployment are verified; do not merge restaurant work into the portfolio just to host it. Roll back using the last known-good commit/artifact if any customer-facing detail is wrong.
