// Utility function to generate URL-friendly slugs from service titles
export const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Remove leading/trailing spaces
  };
  
  // Service title to slug mapping for consistency
  export const serviceSlugs = {
    'Speech Therapy for All Ages': 'speech-therapy-for-all-ages',
    'Pediatric Hearing Care': 'pediatric-hearing-care',
    'Tinnitus Management': 'tinnitus-management',
    'Senior Citizen Hearing Test Center': 'senior-citizen-hearing-test-center',
    'Listening to TV with Hearing Instruments': 'listening-to-tv-with-hearing-instruments',
    'TV Smartphone or Bluetooth Solutions': 'tv-smartphone-or-bluetooth-solutions',
    'Hearing Aids & Accessories in Boisar': 'hearing-aids-accessories-boisar',
    'Hearing Aids & Accessories in Kalyan': 'hearing-aids-&-accessories-in-kalyan',
    'Siemens Hearing Aids': 'siemens-hearing-aids',
    'PHONAK, UNITRON & AUDIO Service': 'phonak-unitron-audio-service',
    'Expert Hearing Consultation': 'expert-hearing-consultation',
    'Custom Ear Molds & Ear Plugs': 'custom-ear-molds-ear-plugs',
    'Hearing Tests (Audiometry - PTA)': 'hearing-tests-audiometry-pta',
    'Hearing Aid Fitting & Programming': 'hearing-aid-fitting-programming',
    'Affordable Hearing Aids': 'affordable-hearing-aids',
    'Rechargeable Hearing Aids': 'rechargeable-hearing-aids',
    'Hearing Aid Batteries': 'hearing-aid-batteries',
    'Hearing Aid Repair & Maintenance': 'hearing-aid-repair-maintenance'
  };
  