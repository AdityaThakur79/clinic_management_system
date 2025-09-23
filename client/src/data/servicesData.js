import { assets } from '../assets/assets';

// Comprehensive service data with detailed content for SEO and user experience
export const servicesData = [
  {
    id: 1,
    title: "Hearing Tests (Audiometry - PTA)",
    slug: "hearing-tests-audiometry-pta",
    description: "Comprehensive hearing assessments using audiometry (PTA) to accurately diagnose hearing conditions in all age groups.",
    image: assets.audiologist_test,
    category: "Diagnostics",
    detailedContent: {
      overview: "Comprehensive hearing tests use Pure Tone Audiometry (PTA) to accurately assess your hearing abilities across different frequencies. This gold-standard test helps identify hearing loss patterns and guides treatment decisions.",
      benefits: [
        "Accurate hearing loss diagnosis",
        "Frequency-specific hearing assessment",
        "Air and bone conduction testing",
        "Speech audiometry evaluation",
        "Tympanometry for middle ear assessment",
        "Detailed hearing profile creation"
      ],
      process: [
        "Case history and symptom discussion",
        "Visual inspection of ear canal and eardrum",
        "Pure tone audiometry (air conduction)",
        "Bone conduction testing",
        "Speech audiometry and word recognition",
        "Tympanometry and acoustic reflex testing",
        "Results interpretation and counseling"
      ],
      testTypes: {
        pta: "Pure Tone Audiometry - tests hearing sensitivity across different frequencies",
        speech: "Speech audiometry - evaluates speech understanding abilities",
        tympanometry: "Middle ear function assessment",
        oae: "Otoacoustic emissions - inner ear hair cell function"
      },
      duration: "Complete assessment takes 30-45 minutes",
      cost: "Affordable pricing with easy payment mode"
    },
    seo: {
      title: "Hearing Tests Mumbai | Audiometry PTA | Best Speech & Hearing",
      description: "Professional hearing tests and audiometry (PTA) in Mumbai. Comprehensive hearing assessment for all ages. Accurate diagnosis and treatment planning. Book today.",
      keywords: "hearing test Mumbai, audiometry PTA, hearing assessment, audiologist Mumbai, hearing evaluation"
    }
  },
  {
    id: 2,
    title: "Hearing Aid Fitting & Programming",
    slug: "hearing-aid-fitting-programming",
    description: "Expert fitting, tuning, and programming of hearing aids based on your specific hearing profile and lifestyle.",
    image: assets.fitting,
    category: "Hearing Aids",
    detailedContent: {
      overview: "Professional hearing aid fitting and programming services ensure optimal performance and comfort. The audiologist uses advanced technology to customize hearing aids to your specific hearing needs and lifestyle preferences.",
      benefits: [
        "Personalized hearing aid programming",
        "Real-ear measurement verification",
        "Comfort and fit optimization",
        "Lifestyle-specific adjustments",
        "Multiple programming sessions",
        "Ongoing fine-tuning support"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Hearing aid selection based on needs and budget",
        "Ear impression taking for custom devices",
        "Initial programming and fitting",
        "Real-ear measurement verification",
        "Trial period with adjustments",
        "Final programming and user training"
      ],
      technologies: {
        digital: "Advanced digital signal processing for natural sound quality",
        wireless: "Bluetooth connectivity and smartphone integration",
        rechargeable: "Convenient rechargeable options for daily use",
        directional: "Directional microphones for better speech understanding"
      },
      duration: "Initial fitting: 30-45 minutes, Follow-up adjustments: 30-45 minutes",
      cost: "Programming included with hearing aid purchase, easy payment mode available"
    },
    seo: {
      title: "Hearing Aid Fitting Mumbai | Programming & Tuning Services",
      description: "Expert hearing aid fitting and programming in Mumbai. Professional tuning, real-ear measurement, and personalized adjustments for optimal hearing. Book consultation.",
      keywords: "hearing aid fitting Mumbai, hearing aid programming, audiologist fitting, hearing aid tuning, real ear measurement"
    }
  },
  {
    id: 3,
    title: "Affordable Hearing Aids",
    slug: "affordable-hearing-aids",
    description: "High-quality hearing aids available at affordable prices, including options from leading brands like Siemens.",
    image: assets.service_7,
    category: "Hearing Aids",
    detailedContent: {
      overview: "Quality hearing aids at affordable prices without compromising on performance. The audiologist offers a range of budget-friendly options from leading manufacturers, ensuring everyone has access to better hearing.",
      benefits: [
        "High-quality at affordable prices",
        "Leading brand options",
        "Professional fitting included",
        "Warranty and support",
        "Financing options available",
        "Trade-in programs"
      ],
      process: [
        "Hearing assessment and consultation",
        "Budget discussion and options review",
        "Hearing aid selection and demonstration",
        "Professional fitting and programming",
        "Trial period with adjustments",
        "Ongoing support and maintenance"
      ],
      priceRanges: {
        basic: "Essential features for basic hearing needs",
        midRange: "Advanced features with good value",
        premium: "Top-tier features at competitive prices"
      },
      duration: "Consultation: 30-45 minutes, Fitting: 30-45 minutes",
      cost: "Affordable pricing with easy payment mode"
    },
    seo: {
      title: "Affordable Hearing Aids Mumbai | Budget Hearing Solutions",
      description: "Affordable hearing aids in Mumbai. Quality hearing solutions at budget-friendly prices. Professional fitting and support included. Easy payment mode available.",
      keywords: "affordable hearing aids Mumbai, budget hearing aids, cheap hearing aids, hearing aid financing, hearing aid prices"
    }
  },
  {
    id: 4,
    title: "Rechargeable Hearing Aids",
    slug: "rechargeable-hearing-aids",
    description: "Modern rechargeable hearing aids that offer convenience and long battery life for everyday use.",
    image: assets.rechargeable_machine,
    category: "Hearing Aids",
    detailedContent: {
      overview: "Modern rechargeable hearing aids offering the convenience of no battery changes, long-lasting power, and eco-friendly operation. Perfect for active lifestyles and daily use.",
      benefits: [
        "No battery changes required",
        "Long-lasting daily power",
        "Convenient overnight charging",
        "Eco-friendly operation",
        "Cost savings over time",
        "Easy maintenance"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Rechargeable hearing aid demonstration",
        "Selection and fitting",
        "Charging system setup",
        "User training and education",
        "Ongoing support and maintenance"
      ],
      features: {
        battery: "Lithium-ion battery technology",
        charging: "Overnight charging for all-day use",
        indicator: "Battery level indicators",
        case: "Charging case included"
      },
      duration: "Fitting: 30-45 minutes, Training: 30-45 minutes",
      cost: "Premium pricing with long-term savings"
    },
    seo: {
      title: "Rechargeable Hearing Aids Mumbai | No Battery Hearing Aids",
      description: "Rechargeable hearing aids in Mumbai. Modern hearing aids with no battery changes, long-lasting power, and convenient charging. Expert fitting available.",
      keywords: "rechargeable hearing aids Mumbai, no battery hearing aids, hearing aid charging, lithium hearing aids"
    }
  },
  {
    id: 5,
    title: "Hearing Aid Batteries",
    slug: "hearing-aid-batteries",
    description: "Reliable and long-lasting hearing aid batteries suitable for all major hearing aid models.",
    image: assets.battery2,
    category: "Accessories",
    detailedContent: {
      overview: "High-quality hearing aid batteries for all major hearing aid models. The clinic stocks reliable, long-lasting batteries with competitive pricing and convenient availability.",
      benefits: [
        "Compatible with all major brands",
        "Long-lasting performance",
        "Reliable power delivery",
        "Competitive pricing",
        "Bulk purchase discounts",
        "Convenient availability"
      ],
      process: [
        "Hearing aid model identification",
        "Battery size and type selection",
        "Purchase and testing",
        "Battery replacement guidance",
        "Storage and handling tips",
        "Bulk ordering options"
      ],
      batteryTypes: {
        zincAir: "Zinc-air batteries for most hearing aids",
        lithium: "Lithium batteries for specific models",
        rechargeable: "Rechargeable battery options"
      },
      duration: "Purchase: 5 minutes, Guidance: 10 minutes",
      cost: "Competitive pricing with bulk discounts"
    },
    seo: {
      title: "Hearing Aid Batteries Mumbai | Hearing Aid Battery Store",
      description: "Hearing aid batteries in Mumbai. High-quality batteries for all hearing aid models. Competitive pricing and bulk discounts available. Visit our store.",
      keywords: "hearing aid batteries Mumbai, hearing aid battery store, hearing aid battery prices, zinc air batteries"
    }
  },
  {
    id: 6,
    title: "Hearing Aid Repair & Maintenance",
    slug: "hearing-aid-repair-maintenance",
    description: "Professional repair, cleaning, and maintenance for all types and brands of hearing instruments.",
    image: assets.service_15,
    category: "Services",
    detailedContent: {
      overview: "Professional repair and maintenance services for all types and brands of hearing aids. The audiologist provides expert repair, cleaning, and maintenance to keep your hearing aids working optimally.",
      benefits: [
        "All brands and types serviced",
        "Expert repair services",
        "Quick turnaround times",
        "Warranty on repairs",
        "Preventive maintenance",
        "Cleaning and sanitization"
      ],
      process: [
        "Hearing aid inspection and diagnosis",
        "Repair estimate and approval",
        "Professional repair work",
        "Testing and quality control",
        "Cleaning and maintenance",
        "Final testing and delivery"
      ],
      services: {
        repair: "Electronic and mechanical repairs",
        cleaning: "Deep cleaning and sanitization",
        maintenance: "Preventive maintenance services",
        modification: "Custom modifications and upgrades"
      },
      duration: "Inspection: 15 minutes, Repair: 10-15 days",
      cost: "Competitive repair pricing with warranty"
    },
    seo: {
      title: "Hearing Aid Repair Mumbai | Hearing Aid Maintenance Service",
      description: "Professional hearing aid repair and maintenance in Mumbai. Expert repair for all brands and types. Quick turnaround and warranty included. Book service.",
      keywords: "hearing aid repair Mumbai, hearing aid maintenance, hearing aid service center, hearing aid cleaning"
    }
  },
  {
    id: 7,
    title: "Speech Therapy for All Ages",
    slug: "speech-therapy-for-all-ages",
    description: "Personalized speech therapy services for children, adults, and senior citizens facing speech or language difficulties.",
    image: assets.service_4,
    category: "Speech Therapy",
    detailedContent: {
      overview: "Comprehensive speech therapy program is designed to address communication challenges across all age groups. The audiologist provides evidence-based treatment approaches tailored to individual needs, helping patients improve their speech clarity, language skills, and overall communication abilities.",
      benefits: [
        "Improved speech clarity and pronunciation",
        "Enhanced language development in children",
        "Better communication skills for adults",
        "Stroke recovery and rehabilitation support",
        "Accent modification and voice therapy",
        "Swallowing disorder treatment"
      ],
      process: [
        "Initial speech and language assessment",
        "Personalized treatment plan development",
        "Regular therapy sessions",
        "Progress monitoring and plan adjustments",
        "Home practice exercises and guidance",
        "Family education and support"
      ],
      ageGroups: {
        children: "Early intervention programs for developmental delays, articulation disorders, and language development",
        adults: "Voice therapy, accent modification, and communication enhancement for professional needs",
        seniors: "Stroke recovery, swallowing therapy, and age-related communication challenges"
      },
      duration: "Sessions typically last 30-45 minutes, with frequency based on individual needs",
      cost: "Competitive pricing with easy payment mode"
    },
    seo: {
      title: "Speech Therapy Services in Mumbai | Best Speech & Hearing",
      description: "Professional speech therapy for all ages in Mumbai. Expert treatment for speech disorders, language delays, and communication challenges. Book consultation today.",
      keywords: "speech therapy Mumbai, speech language pathologist, communication therapy, speech disorders, language development"
    }
  },
  {
    id: 8,
    title: "Pediatric Hearing Care",
    slug: "pediatric-hearing-care",
    description: "Kid-friendly hearing tests and treatment tailored for infants and children in a comfortable environment.",
    image: assets.service_6,
    category: "Pediatric Care",
    detailedContent: {
      overview: "Specialized pediatric hearing care designed to make children feel comfortable and safe during hearing assessments. The audiologist's child-friendly approach ensures accurate diagnosis and effective treatment for young patients.",
      benefits: [
        "Child-friendly testing environment",
        "Early detection of hearing issues",
        "Specialized pediatric care",
        "Parent education and support",
        "Hearing aid fitting for children",
        "School communication support"
      ],
      process: [
        "Comprehensive hearing evaluation using child-appropriate methods",
        "Behavioral observation audiometry for younger children",
        "Otoacoustic emissions (OAE) testing",
        "Auditory brainstem response (ABR) testing when needed",
        "Hearing aid selection and fitting if required",
        "Ongoing monitoring and support"
      ],
      ageGroups: {
        infants: "Newborn hearing screening and early intervention programs",
        toddlers: "Play-based hearing assessments and language development support",
        schoolAge: "Academic support and classroom hearing assistance"
      },
      duration: "Initial assessment: 30-45 minutes, Follow-up sessions: 30-45 minutes",
      cost: "Easy payment mode available"
    },
    seo: {
      title: "Pediatric Hearing Care Mumbai | Children's Hearing Tests",
      description: "Expert pediatric hearing care in Mumbai. Child-friendly hearing tests, early intervention, and specialized treatment for infants and children. Book appointment now.",
      keywords: "pediatric hearing care Mumbai, children hearing test, infant hearing screening, pediatric audiologist, child hearing aids"
    }
  },
  {
    id: 9,
    title: "Tinnitus Management",
    slug: "tinnitus-management",
    description: "Evaluation and therapeutic solutions for managing ringing in the ears (tinnitus).",
    image: assets.service_1,
    category: "Specialized Care",
    detailedContent: {
      overview: "Comprehensive tinnitus management program designed to help patients cope with and reduce the impact of ringing, buzzing, or other sounds in the ears. The audiologist's approach combines evaluation, sound therapy, and counseling.",
      benefits: [
        "Comprehensive tinnitus evaluation",
        "Sound therapy and masking solutions",
        "Counseling and coping strategies",
        "Hearing aid integration for tinnitus relief",
        "Stress management techniques",
        "Support group access"
      ],
      process: [
        "Detailed tinnitus history and impact assessment",
        "Comprehensive hearing evaluation",
        "Tinnitus pitch and loudness matching",
        "Treatment plan development",
        "Sound therapy device fitting if needed",
        "Follow-up and adjustment sessions"
      ],
      treatments: {
        soundTherapy: "White noise generators and hearing aids with tinnitus masking features",
        counseling: "Cognitive behavioral therapy and tinnitus retraining therapy",
        medical: "Evaluation for underlying medical conditions contributing to tinnitus"
      },
      duration: "Initial evaluation: 30-45 minutes, Follow-up sessions: 30-45 minutes",
      cost: "Easy payment mode available for all services"
    },
    seo: {
      title: "Tinnitus Management Mumbai | Ringing Ears Treatment",
      description: "Expert tinnitus management in Mumbai. Professional evaluation, sound therapy, and counseling for ringing ears. Effective treatment solutions available. Book consultation.",
      keywords: "tinnitus management Mumbai, ringing ears treatment, tinnitus therapy, sound therapy, tinnitus counseling"
    }
  },
  {
    id: 10,
    title: "Senior Citizen Hearing Test Center",
    slug: "senior-citizen-hearing-test-center",
    description: "Specialized hearing tests and solutions for elderly patients in a senior-friendly environment.",
    image: assets.service_12,
    category: "Senior Care",
    detailedContent: {
      overview: "Dedicated hearing care center designed specifically for senior citizens, providing comfortable and accessible hearing tests and solutions in a senior-friendly environment with specialized equipment and patient care.",
      benefits: [
        "Senior-friendly testing environment",
        "Extended appointment times",
        "Family member involvement encouraged",
        "Large print materials and clear communication",
        "Wheelchair accessible facilities",
        "Comprehensive hearing aid options for seniors"
      ],
      process: [
        "Comfortable consultation in senior-friendly setting",
        "Comprehensive hearing evaluation with extra time",
        "Family member consultation and education",
        "Hearing aid demonstration and trial",
        "Home visit services if needed",
        "Ongoing support and maintenance"
      ],
      ageGroups: {
        seniors: "Specialized care for age-related hearing loss and communication challenges",
        family: "Family education and support for hearing care decisions",
        caregivers: "Training and support for family caregivers"
      },
      duration: "Extended appointments: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Senior discounts available, easy payment mode"
    },
    seo: {
      title: "Senior Hearing Test Center Mumbai | Elderly Hearing Care",
      description: "Specialized senior hearing test center in Mumbai. Senior-friendly hearing care, accessible facilities, and comprehensive solutions for elderly patients. Book appointment.",
      keywords: "senior hearing test Mumbai, elderly hearing care, senior citizen hearing center, age-related hearing loss, senior hearing aids"
    }
  },
  {
    id: 11,
    title: "TV Smartphone/Bluetooth Solutions",
    slug: "tv-smartphone-or-bluetooth-solutions",
    description: "Solutions and accessories to improve TV and smartphone listening experiences using your hearing aids with Bluetooth connectivity.",
    image: assets.service_15,
    category: "Accessories",
    detailedContent: {
      overview: "Specialized solutions to enhance your TV and smartphone listening experience with hearing aids. The audiologist provides various accessories and technologies to help you enjoy clear, comfortable audio from TV, smartphones, and other devices without disturbing others.",
      benefits: [
        "Clear TV and smartphone audio through hearing aids",
        "Bluetooth connectivity for seamless streaming",
        "No disturbance to family members",
        "Multiple connectivity options",
        "Volume control independent of devices",
        "Compatible with all hearing aid types",
        "Easy setup and operation"
      ],
      process: [
        "Assessment of current hearing aid compatibility",
        "Selection of appropriate TV and smartphone listening solution",
        "Installation and setup of equipment",
        "Bluetooth pairing and configuration",
        "Testing and adjustment for optimal sound",
        "User training and instruction",
        "Follow-up support and troubleshooting"
      ],
      technologies: {
        bluetooth: "Direct Bluetooth streaming from TV and smartphones to hearing aids",
        infrared: "Infrared transmission systems for clear TV audio",
        fm: "FM systems for enhanced sound quality",
        loop: "Hearing loop systems for room-wide coverage",
        smartphone: "Smartphone app integration for hearing aid control"
      },
      duration: "Setup and fitting: 30-45 minutes, Training: 30-45 minutes",
      cost: "Various price ranges available, easy payment mode"
    },
    seo: {
      title: "TV Smartphone Bluetooth Solutions Mumbai | Hearing Aid Accessories",
      description: "TV and smartphone listening solutions for hearing aid users in Mumbai. Clear audio, Bluetooth streaming, and accessories for comfortable viewing and phone calls. Expert setup available.",
      keywords: "TV listening hearing aids Mumbai, smartphone hearing aids Mumbai, Bluetooth hearing aids, hearing aid TV accessories, hearing aid smartphone solutions"
    }
  },
  {
    id: 12,
    title: "Hearing Aids & Accessories in Kalyan",
    slug: "hearing-aids-&-accessories-in-kalyan",
    description: "Full range of hearing aids, batteries, and accessories available at our Kalyan clinic.",
    image: assets.service_11,
    category: "Products",
    detailedContent: {
      overview: "Complete hearing care solutions available at our Kalyan location, offering a full range of hearing aids, batteries, and accessories from leading manufacturers with expert fitting and support services.",
      benefits: [
        "Complete range of hearing aid brands",
        "Expert fitting and programming",
        "Comprehensive accessory selection",
        "Local service and support",
        "Competitive pricing",
        "Warranty and maintenance services"
      ],
      process: [
        "Hearing assessment and consultation",
        "Hearing aid selection and demonstration",
        "Professional fitting and programming",
        "Accessory selection and setup",
        "Trial period with adjustments",
        "Ongoing support and maintenance"
      ],
      products: {
        hearingAids: "All major brands including Siemens, Phonak, Oticon, and more",
        batteries: "High-quality batteries for all hearing aid models",
        accessories: "Cleaning kits, storage cases, and connectivity devices",
        repairs: "Professional repair and maintenance services"
      },
      duration: "Initial consultation: 30-45 minutes, Fitting: 30-45 minutes",
      cost: "Competitive local pricing, easy payment mode"
    },
    seo: {
      title: "Hearing Aids Kalyan | Hearing Care Center Kalyan",
      description: "Complete hearing aid solutions in Kalyan. Expert fitting, accessories, and support services. Leading brands available with professional care. Visit our clinic.",
      keywords: "hearing aids Kalyan, hearing care Kalyan, audiologist Kalyan, hearing aid center Kalyan, hearing solutions Kalyan"
    }
  },
  {
    id: 13,
    title: "PHONAK, UNITRON & AUDIO Service",
    slug: "phonak-unitron-audio-service",
    description: "Authorized services and fitting of Phonak, Unitron & Audio hearing aids with expert consultation and support.",
    image: assets.service_9,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for Phonak, Unitron & Audio hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. The audiologist ensures optimal performance and comfort.",
      benefits: [
        "Authorized dealer for multiple brands",
        "Complete product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Product demonstration from all brands",
        "Selection based on needs and budget",
        "Professional fitting and programming",
        "Trial period with adjustments",
        "Ongoing support and maintenance"
      ],
      technologies: {
        digital: "Advanced digital signal processing",
        wireless: "Bluetooth and wireless connectivity",
        rechargeable: "Rechargeable battery options",
        directional: "Directional microphone technology"
      },
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included"
    },
    seo: {
      title: "PHONAK UNITRON AUDIO Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for Phonak, Unitron & Audio hearing aids in Mumbai. Expert fitting, programming, and support for hearing instruments by a dedicated audiologist.",
      keywords: "Phonak hearing aids Mumbai, Unitron hearing aids Mumbai, Audio hearing aids Mumbai, hearing aid dealer Mumbai"
    }
  },
  {
    id: 14,
    title: "Expert Hearing Consultation",
    slug: "expert-hearing-consultation",
    description: "One-on-one sessions with hearing specialists to discuss concerns and find optimal hearing solutions.",
    image: assets.audiologist2,
    category: "Consultation",
    detailedContent: {
      overview: "Comprehensive hearing consultation services with a dedicated audiologist to address your hearing concerns, provide expert advice, and develop personalized solutions for your specific needs and lifestyle.",
      benefits: [
        "One-on-one expert consultation",
        "Comprehensive hearing assessment",
        "Personalized treatment recommendations",
        "Second opinion services",
        "Family education and support",
        "Follow-up care planning"
      ],
      process: [
        "Detailed case history discussion",
        "Comprehensive hearing evaluation",
        "Results interpretation and explanation",
        "Treatment options discussion",
        "Personalized recommendations",
        "Follow-up planning and scheduling"
      ],
      consultationTypes: {
        initial: "First-time hearing assessment and consultation",
        secondOpinion: "Second opinion on existing diagnosis or treatment",
        followUp: "Ongoing consultation and care management",
        family: "Family consultation and education sessions"
      },
      duration: "Comprehensive consultation: 30-45 minutes",
      cost: "Consultation fees vary, easy payment mode available"
    },
    seo: {
      title: "Hearing Consultation Mumbai | Expert Audiologist Consultation",
      description: "Expert hearing consultation in Mumbai. One-on-one sessions with experienced audiologists for personalized hearing care solutions. Book consultation today.",
      keywords: "hearing consultation Mumbai, audiologist consultation, hearing specialist Mumbai, hearing advice, hearing assessment"
    }
  },
  {
    id: 15,
    title: "Custom Ear Molds & Ear Plugs",
    slug: "custom-ear-molds-ear-plugs",
    description: "High-quality custom ear molds and plugs for hearing aids, swimmers, musicians, and noise protection tailored to your ear shape.",
    image: assets.ear_moulds,
    category: "Accessories",
    detailedContent: {
      overview: "Professional custom ear mold and ear plug services for various applications including hearing aids, swimming, music, and noise protection. The audiologist's precise fitting ensures comfort and optimal performance.",
      benefits: [
        "Perfect fit for maximum comfort",
        "Superior sound quality",
        "Durable and long-lasting",
        "Multiple material options",
        "Professional impression taking",
        "Quick turnaround time"
      ],
      process: [
        "Ear examination and measurement",
        "Professional ear impression taking",
        "Material selection and customization",
        "Manufacturing and quality control",
        "Fitting and adjustment",
        "Follow-up and maintenance"
      ],
      applications: {
        hearingAids: "Custom molds for hearing aid fitting and comfort",
        swimming: "Waterproof ear plugs for swimming and water sports",
        music: "Musician ear plugs for hearing protection",
        noise: "Industrial and occupational noise protection"
      },
      duration: "Impression taking: 30-45 minutes, Fitting: 30-45 minutes",
      cost: "Competitive pricing with various material options"
    },
    seo: {
      title: "Custom Ear Molds Mumbai | Ear Plugs & Hearing Aid Molds",
      description: "Custom ear molds and ear plugs in Mumbai. Professional fitting for hearing aids, swimming, music, and noise protection. Expert impression services available.",
      keywords: "custom ear molds Mumbai, ear plugs Mumbai, hearing aid molds, swimming ear plugs, musician ear plugs"
    }
  }
];

// Helper function to get service by slug
export const getServiceBySlug = (slug) => {
  return servicesData.find(service => service.slug === slug);
};

// Helper function to get services by category
export const getServicesByCategory = (category) => {
  return servicesData.filter(service => service.category === category);
};

// Helper function to get all categories
export const getAllCategories = () => {
  return [...new Set(servicesData.map(service => service.category))];
};
