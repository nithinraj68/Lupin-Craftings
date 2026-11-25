/* ============================================================
   LUPIN CRAFTINGS: EDIT YOUR DETAILS HERE
   Change a value between the quotes, save, and upload again.
   ============================================================ */

window.SITE = {
  phones: ['+91 80988 33669', '+91 94888 39214'],
  email: 'Lupincraftings@gmail.com',
  address: 'Tiruchengode, Tamil Nadu, India – 637209',
  instagram: 'https://www.instagram.com/lupin_craftings/',
  instagramDM: 'https://ig.me/m/lupin_craftings',   // opens a message to your Instagram account
  whatsapp: '918098833669',                          // country code 91 + number, no spaces or +
  logo: 'images/lc-logo.png',
  footerText: 'Official distributor in India of SM CarDress and Tyredox. All brand names and logos belong to their owners.'
};

/* ============================================================
   METAL WALL ART SHOP
   - Sizes: the same list is used for every normal model.
   - Prices: put a number (for example 4500) to show the price.
     Leave it as null to show "Price on request".
   - Models: copy one { ... } block to add a new model.
     "img" is a file inside the images folder.
   - custom: true  = no fixed sizes; the customer types the size.
   - options: optional choices such as Side view / Angle view.
   ============================================================ */

window.WALL_ART = {
  priceRange: '₹3,200 – ₹6,000',            // shown on every normal model
  priceNote: 'Price depends on the size you choose.',
  sizes: [
    { id: 's',  label: 'Small (2 ft)',       price: null },
    { id: 'm',  label: 'Medium (3 ft)',      price: null },
    { id: 'l',  label: 'Large (4 ft)',       price: null },
    { id: 'xl', label: 'Extra large (5 ft)', price: null }
  ],
  models: [
    { id: 'gt3rs', name: 'Porsche 911 GT3 RS', img: 'images/wa-gt3rs.jpg', alt: 'Porsche 911 GT3 RS metal wall art' },
    { id: 'svj',   name: 'Lamborghini Aventador SVJ', img: 'images/wa-svj.jpg', alt: 'Lamborghini Aventador SVJ rear metal wall art' },
    { id: 'mini',  name: 'MINI Cooper with LED headlights', img: 'images/wa-mini.jpg', alt: 'MINI Cooper metal wall art, plain and with lit headlights' },
    { id: 'custom-car', name: 'Your Custom Car Metal Wall Art', img: 'images/wa-cayman.jpg', alt: 'Custom car metal wall art', custom: true,
      options: [{ id: 'side', label: 'Side view' }, { id: 'angle', label: 'Angle view' }],
      note: 'Any car, any year. After adding to your cart, send us your car model, year and a photo (optional) on Instagram. We prepare a preview for your approval before cutting.' },
    { id: 'custom-bike', name: 'Your Custom Bike Metal Wall Art', img: 'images/wa-h2.jpg', alt: 'Custom bike silhouette metal wall art', custom: true,
      options: [{ id: 'side', label: 'Side view' }, { id: 'angle', label: 'Angle view' }],
      note: 'Any bike, any year. After adding to your cart, send us your bike model, year and a photo (optional) on Instagram. We prepare a preview for your approval before cutting.' },
    { id: 'custom-logo', name: 'Your Custom Logo or Personalised Metal Wall Art', img: 'images/wa-evo.jpg', alt: 'Custom logo and personalised metal wall art', custom: true,
      note: 'Club or company logo, name board, number plate, or your own idea. After adding to your cart, send your logo file or sketch and the text you want on Instagram.' }
  ]
};

/* ============================================================
   LOGIN, REVIEWS AND SAVED ENQUIRIES (needs a free Supabase project)
   Follow SETUP-BACKEND.md. Paste the two values from Supabase here.
   Until you do, login and reviews show "coming soon".
   ============================================================ */

window.LC_BACKEND = {
  url: '',      // for example 'https://abcdxyz.supabase.co'
  anonKey: ''   // the long "anon public" key
};
