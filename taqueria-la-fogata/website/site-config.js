/* Taqueria La Fogata — business content.
   Research and unresolved conflicts: ../docs/LAUNCH-READINESS.md.
   Unknown information stays absent; verification flags must follow evidence.
   Run: node validate.js; node build-preview.js
*/
window.FOGATA = {
  usingPlaceholders: false,
  launchApproved: false,
  verified: { phone: true, address: true, hours: true, menu: false, social: false },
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
  // Customer-facing address and suite confirmed by Juan on 2026-10-26.
  address: { street: "2650 Cobb Parkway NW, Suite 2", city: "Kennesaw", state: "GA", zip: "30152" },
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=2650%20Cobb%20Parkway%20NW%2C%20Suite%202%2C%20Kennesaw%2C%20GA%2030152",
  // Do not assume a matching business name means the account is ours.
  social: { tiktok: "", instagram: "", facebook: "", google: "" },
  // Regular weekly hours confirmed by Juan on 2026-10-26; Eastern time.
  hours: {
    mon: { open: "10:00", close: "20:00" },
    tue: { open: "10:00", close: "20:00" },
    wed: { open: "10:00", close: "20:00" },
    thu: { open: "10:00", close: "20:00" },
    fri: { open: "10:00", close: "20:00" },
    sat: { open: "10:00", close: "21:00" },
    sun: { open: "10:00", close: "21:00" }
  },
  // Offers and expansion require separate, explicit business approval.
  happyHour: { show: false, approved: false },
  comingSoon: { show: false, approved: false },
  // No current owner-verified menu or prices available. Never deploy sample prices.
  menu: []
};
