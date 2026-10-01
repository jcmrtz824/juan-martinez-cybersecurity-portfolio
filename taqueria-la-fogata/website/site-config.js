/* ============================================================================
   TAQUERIA LA FOGATA — SITE CONFIGURATION
   ============================================================================

   >>> THIS IS THE ONLY FILE YOU NEED TO EDIT. <<<

   Everything on the website comes from this file: your phone number, address,
   hours, and your whole menu. Change it here and the site updates.

   ---------------------------------------------------------------------------
   !! THE CONTACT INFO AND MENU BELOW ARE PLACEHOLDERS. THEY ARE NOT REAL. !!
   ---------------------------------------------------------------------------

   Before you put this website online, you MUST replace:

     1. phone        — currently a fake 555 number
     2. address      — currently a fake street address
     3. hours        — check every day
     4. menu         — your real dishes and your real prices
     5. mapsUrl      — search your taqueria on Google Maps, copy the link
     6. social       — your real TikTok / Instagram / Google links

   Then change  usingPlaceholders  from  true  to  false  to hide the
   yellow warning banner at the top of the site.

   Tips:
     - Prices are plain numbers in quotes: "3.50" shows as $3.50
     - To hide any menu item, delete its line or add  hidden: true
     - Spanish is optional. Leave nameEs/descEs out and it uses the English.
   ========================================================================== */

window.FOGATA = {

  /* Set this to false once you've replaced the placeholder info below. */
  usingPlaceholders: true,

  /* ---------------------------------------------------------------- BASICS */
  name: "Taqueria La Fogata",
  tagline: {
    en: "Family-owned tacos in Kennesaw, Georgia",
    es: "Tacos de familia en Kennesaw, Georgia"
  },
  blurb: {
    en: "Handmade tortillas, salsa ground fresh every morning, and meat off the griddle. Same family, same recipes, every day.",
    es: "Tortillas hechas a mano, salsa molida fresca cada mañana, y carne recién hecha en la plancha. La misma familia, las mismas recetas, todos los días."
  },

  /* --------------------------------------------------------- CONTACT INFO */
  /* REPLACE ALL OF THIS. The 555 number is fake on purpose.                */
  phone: "(770) 555-0100",
  address: {
    street: "1234 Example Parkway NW",
    city: "Kennesaw",
    state: "GA",
    zip: "30144"
  },
  /* Search your business on Google Maps, hit Share, paste the link here. */
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taqueria+La+Fogata+Kennesaw+GA",

  social: {
    tiktok: "https://www.tiktok.com/@taquerialafogata",
    instagram: "",
    google: ""
  },

  /* ----------------------------------------------------------------- HOURS */
  /* 24-hour time, "HH:MM". Use null for closed all day.                    */
  /* The site uses these to show OPEN or CLOSED automatically.              */
  hours: {
    mon: { open: "10:00", close: "21:00" },
    tue: { open: "10:00", close: "21:00" },
    wed: { open: "10:00", close: "21:00" },
    thu: { open: "10:00", close: "21:00" },
    fri: { open: "10:00", close: "22:00" },
    sat: { open: "09:00", close: "22:00" },
    sun: { open: "09:00", close: "20:00" }
  },

  /* -------------------------------------------------------- HAPPY HOUR */
  /* Set show:false to hide this whole section.                          */
  happyHour: {
    show: true,
    name: { en: "La Hora Feliz", es: "La Hora Feliz" },
    when: { en: "Monday – Thursday, 3–6pm", es: "Lunes a jueves, 3–6pm" },
    details: {
      en: "$1 off all beer and micheladas. Two tacos for $5.",
      es: "$1 de descuento en cervezas y micheladas. Dos tacos por $5."
    }
  },

  /* ----------------------------------------------------- COMING IN 2027 */
  /* The patio + margarita teaser. Set show:false to hide it.            */
  comingSoon: {
    show: true,
    eyebrow: { en: "Coming summer 2027", es: "Verano 2027" },
    headline: { en: "Patio & Margaritas", es: "Patio y Margaritas" },
    body: {
      en: "We're building an outdoor patio and adding margaritas, palomas and micheladas preparadas. Follow along on TikTok — we're posting the whole build.",
      es: "Estamos construyendo un patio y agregando margaritas, palomas y micheladas preparadas. Síguenos en TikTok para ver todo el proceso."
    }
  },

  /* ------------------------------------------------------------------ MENU */
  /* REPLACE WITH YOUR REAL MENU AND REAL PRICES.                           */
  menu: [
    {
      id: "tacos",
      name: { en: "Tacos", es: "Tacos" },
      note: { en: "Corn tortilla, onion, cilantro, salsa, lime", es: "Tortilla de maíz, cebolla, cilantro, salsa, limón" },
      items: [
        { name: "Asada",      price: "3.50", desc: { en: "Grilled steak",            es: "Carne asada" } },
        { name: "Al Pastor",  price: "3.50", desc: { en: "Marinated pork, pineapple", es: "Puerco adobado, piña" }, popular: true },
        { name: "Carnitas",   price: "3.50", desc: { en: "Slow-cooked pork",          es: "Puerco cocido lento" } },
        { name: "Pollo",      price: "3.25", desc: { en: "Grilled chicken",           es: "Pollo a la plancha" } },
        { name: "Chorizo",    price: "3.25", desc: { en: "Mexican sausage",           es: "Chorizo mexicano" } },
        { name: "Birria",     price: "3.95", desc: { en: "Stewed beef, consomé on the side", es: "Res guisada, consomé aparte" }, popular: true },
        { name: "Lengua",     price: "3.95", desc: { en: "Beef tongue",               es: "Lengua de res" } },
        { name: "Nopal",      price: "3.00", desc: { en: "Grilled cactus — vegetarian", es: "Nopal asado — vegetariano" } }
      ]
    },
    {
      id: "especialidades",
      name: { en: "Specialties", es: "Especialidades" },
      items: [
        { name: { en: "Quesabirria (3)", es: "Quesabirria (3)" }, price: "13.50",
          desc: { en: "Three crispy cheese-and-birria tacos, consomé for dipping", es: "Tres tacos dorados con queso y birria, con consomé" }, popular: true },
        { name: { en: "Burrito", es: "Burrito" }, price: "11.00",
          desc: { en: "Flour tortilla, rice, beans, your choice of meat", es: "Tortilla de harina, arroz, frijoles, carne a elegir" } },
        { name: { en: "Torta", es: "Torta" }, price: "10.50",
          desc: { en: "Telera roll, avocado, beans, jalapeño, your choice of meat", es: "Pan telera, aguacate, frijoles, jalapeño, carne a elegir" } },
        { name: { en: "Quesadilla", es: "Quesadilla" }, price: "9.50",
          desc: { en: "Flour tortilla, melted cheese, your choice of meat", es: "Tortilla de harina, queso derretido, carne a elegir" } },
        { name: { en: "Taco Plate (3)", es: "Plato de Tacos (3)" }, price: "12.00",
          desc: { en: "Three tacos with rice and beans", es: "Tres tacos con arroz y frijoles" } }
      ]
    },
    {
      id: "acompanamientos",
      name: { en: "Sides", es: "Acompañamientos" },
      items: [
        { name: { en: "Chips & Salsa", es: "Totopos y Salsa" }, price: "4.00" },
        { name: { en: "Guacamole & Chips", es: "Guacamole y Totopos" }, price: "5.50" },
        { name: { en: "Elote", es: "Elote" }, price: "4.00",
          desc: { en: "Grilled corn, crema, cotija, chile", es: "Maíz asado, crema, cotija, chile" }, popular: true },
        { name: { en: "Rice & Beans", es: "Arroz y Frijoles" }, price: "4.00" },
        { name: { en: "Consomé", es: "Consomé" }, price: "3.50", desc: { en: "Cup of birria broth", es: "Vaso de consomé de birria" } }
      ]
    },
    {
      id: "bebidas",
      name: { en: "Drinks", es: "Bebidas" },
      items: [
        { name: { en: "Horchata", es: "Horchata" }, price: "3.50", desc: { en: "Made in house", es: "Hecha en casa" }, popular: true },
        { name: { en: "Agua de Jamaica", es: "Agua de Jamaica" }, price: "3.50", desc: { en: "Hibiscus", es: "Flor de jamaica" } },
        { name: { en: "Jarritos", es: "Jarritos" }, price: "3.00" },
        { name: { en: "Mexican Coke", es: "Coca Mexicana" }, price: "3.00" },
        { name: { en: "Beer", es: "Cerveza" }, price: "5.00", desc: { en: "Domestic & Mexican", es: "Nacional y mexicana" } },
        { name: { en: "Michelada", es: "Michelada" }, price: "8.00",
          desc: { en: "Beer, lime, Clamato, chile-salt rim", es: "Cerveza, limón, Clamato, escarchado de chile" }, popular: true },
        { name: { en: "Michelada Preparada", es: "Michelada Preparada" }, price: "9.00",
          desc: { en: "Loaded — Tajín, cucumber, extra spice", es: "Bien preparada — Tajín, pepino, extra picante" } },
        { name: { en: "Chelada", es: "Chelada" }, price: "7.00", desc: { en: "Beer, lime, salt", es: "Cerveza, limón, sal" } }
      ]
    }
  ]
};
