/* Taqueria La Fogata — business content.
   Research and unresolved conflicts: ../docs/LAUNCH-READINESS.md.
   Unknown information stays absent; verification flags must follow evidence.
   Run: node validate.js; node build-preview.js
*/
window.FOGATA = {
  usingPlaceholders: false,
  launchApproved: false,
  verified: { phone: true, address: false, hours: false, menu: false, social: false },
  name: "Taqueria La Fogata",
  tagline: {
    en: "Family-owned tacos in Kennesaw, Georgia",
    es: "Tacos de familia en Kennesaw, Georgia"
  },
  blurb: {
    en: "A family-owned taqueria in Kennesaw. Call us for today's menu, prices and hours.",
    es: "Una taquería familiar en Kennesaw. Llámanos para consultar el menú, los precios y el horario de hoy."
  },
  // Corroborated by Restaurantji, Yellow Pages, Zmenu and Allmenus, 2026-10-26.
  // Directory verification is not a test call or owner confirmation.
  phone: "(770) 794-2122",
  // Conflicting listings: 2650 vs 2651 Cobb Pkwy NW. Do not guess.
  address: { street: "", city: "Kennesaw", state: "GA", zip: "30152" },
  mapsUrl: "",
  // Do not assume a matching business name means the account is ours.
  social: { tiktok: "", instagram: "", facebook: "", google: "" },
  // Unknown is not closed. All seven days need owner confirmation.
  hours: {},
  // Offers and expansion require separate, explicit business approval.
  happyHour: { show: false, approved: false },
  comingSoon: { show: false, approved: false },
  // No current owner-verified menu or prices available. Never deploy sample prices.
  menu: []
};
