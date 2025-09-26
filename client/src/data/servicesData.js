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
      preparation: [
        "Arrive with clean, dry ears (avoid cotton buds)",
        "Bring previous test reports and current medications",
        "Avoid loud noise exposure for 12–24 hours before the test",
        "Inform the clinician about ear pain, discharge, or dizziness"
      ],
      whatToExpect: [
        "You will wear headphones and listen for beeps at different pitches and volumes",
        "You will press a button or raise a hand whenever you hear a sound",
        "A small vibrator may be placed behind the ear for bone conduction testing",
        "No pain; the test is safe and comfortable for all ages"
      ],
      indications: [
        "Difficulty hearing conversations or TV",
        "Ringing in ears (tinnitus)",
        "Ear fullness, infections, or dizziness",
        "Baseline hearing assessment for job/health checks"
      ],
      contraindications: [
        "Active ear discharge or severe pain (test may be postponed)",
        "Recent ear surgery without medical clearance"
      ],
      dosDonts: {
        dos: [
          "Do relax and focus on the faintest sounds",
          "Do inform if you feel discomfort or need a pause",
          "Do share relevant medical and noise exposure history"
        ],
        donts: [
          "Don’t guess responses; respond only when you hear a sound",
          "Don’t wear earphones just before the test",
          "Don’t postpone recommended follow‑up tests"
        ]
      },
      aftercare: [
        "Review results with the audiologist and ask questions",
        "Follow recommended next steps (hearing aids, medical referral, protection)",
        "Protect your hearing in noisy environments"
      ],
      risks: [
        "No medical risks. Rare temporary ear fatigue after noise exposure before testing"
      ],
      results: "You will receive an audiogram showing your hearing thresholds across frequencies with a clear explanation and next‑step guidance.",
      faqs: [
        { q: "Is PTA painful?", a: "No. It is non‑invasive and comfortable." },
        { q: "Can children do PTA?", a: "Yes. We use age‑appropriate methods." },
        { q: "How long does it take?", a: "About 30–45 minutes including counseling." }
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
    id: 16,
    title: "Impedance Audiometry (Tympanometry & Acoustic Reflex)",
    slug: "impedance-audiometry-tympanometry",
    description: "Middle ear assessment using tympanometry and acoustic reflex to evaluate eardrum and ossicle function.",
    image: assets.impedance_audiometry,
    category: "Diagnostics",
    detailedContent: {
      overview: "Impedance audiometry evaluates the health of your middle ear by measuring eardrum mobility (tympanometry) and the stapedial reflex (acoustic reflex). It helps diagnose fluid in the middle ear, eardrum perforation, Eustachian tube dysfunction, and ossicular issues.",
      benefits: [
        "Quick, objective middle ear evaluation",
        "Detects fluid, negative pressure, and perforations",
        "Assesses auditory nerve and brainstem pathways via reflexes",
        "Useful for children and adults"
      ],
      process: [
        "Brief ear examination",
        "Soft probe tip gently placed in ear canal",
        "Air pressure changes to move the eardrum",
        "Measurements of tympanogram and acoustic reflex thresholds",
        "Immediate result explanation"
      ],
      preparation: [
        "Keep ears clean and dry",
        "Inform if you have recent ear pain, discharge, or surgery",
        "Children can be comforted on the parent's lap"
      ],
      indications: [
        "Ear fullness or blocked sensation",
        "Recurrent ear infections",
        "Suspected eardrum perforation or fluid",
        "Hearing fluctuation and dizziness"
      ],
      contraindications: [
        "Severe ear pain or active discharge",
        "Recent ear surgery without clearance",
        "Known eardrum perforation (test may be modified)"
      ],
      dosDonts: {
        dos: ["Do stay still during pressure changes", "Do inform if you feel discomfort"],
        donts: ["Don’t remove the probe while testing", "Don’t panic—pressure changes are mild"]
      },
      aftercare: ["Resume normal activities immediately", "Follow up if medical treatment is advised"],
      risks: ["Minimal. Brief pressure sensation only"],
      results: "You will see a tympanogram type (A, As, Ad, B, C) with interpretation and next steps.",
      faqs: [
        { q: "Is it painful?", a: "No, you may only feel gentle pressure." },
        { q: "Is it safe for kids?", a: "Yes, it’s commonly done in children." }
      ],
      duration: "5–10 minutes",
      cost: "Affordable with easy payment mode"
    },
    seo: {
      title: "Impedance Audiometry Mumbai | Tympanometry & Acoustic Reflex Test",
      description: "Impedance audiometry in Mumbai. Tympanometry and acoustic reflex testing for middle ear evaluation. Quick, objective, and child‑friendly.",
      keywords: "impedance audiometry Mumbai, tympanometry test, acoustic reflex, middle ear test"
    }
  },
  {
    id: 17,
    title: "Otoacoustic Emissions (OAE) Test",
    slug: "otoacoustic-emissions-oae",
    description: "Objective inner ear (cochlear hair cell) function test for newborns, children, and adults.",
    image: assets.oae,
    category: "Diagnostics",
    detailedContent: {
      overview: "OAE testing measures tiny sounds produced by healthy outer hair cells in the cochlea. It is a fast, non‑invasive screening and diagnostic tool used for newborn hearing screening, pediatric testing, and ototoxic monitoring.",
      benefits: [
        "Objective, no active response needed",
        "Ideal for newborns and young children",
        "Detects early inner ear damage",
        "Useful for workplace and drug monitoring"
      ],
      process: [
        "A soft ear tip is placed in the ear canal",
        "Soft clicks or tones are played",
        "A sensitive microphone records cochlear responses",
        "Results displayed immediately"
      ],
      preparation: [
        "Ensure the ear canal is free from wax",
        "Keep the room and patient quiet and relaxed",
        "Infants may be tested while asleep"
      ],
      indications: [
        "Newborn and infant hearing screening",
        "Pediatric hearing evaluation",
        "Monitoring ototoxic medications or noise exposure",
        "Differentiating cochlear vs neural hearing issues"
      ],
      contraindications: ["Active ear infection or significant ear wax until treated"],
      dosDonts: {
        dos: ["Do keep still and quiet during the test"],
        donts: ["Don’t speak or move the jaw excessively during recording"]
      },
      aftercare: ["No restrictions; normal activity can resume"],
      risks: ["None. It is non‑invasive and safe"],
      results: "Reported as Pass/Refer with frequency‑specific data when needed.",
      faqs: [
        { q: "Is OAE a hearing test?", a: "Yes, it objectively screens cochlear function." },
        { q: "Will it work if there is wax?", a: "Significant wax may block responses; cleaning may be needed." }
      ],
      duration: "5–10 minutes",
      cost: "Budget‑friendly with easy payment options"
    },
    seo: {
      title: "OAE Test Mumbai | Newborn Hearing Screening & Cochlear Check",
      description: "OAE test in Mumbai for newborns, children, and adults. Fast, objective cochlear function assessment. Safe and non‑invasive.",
      keywords: "OAE test Mumbai, newborn hearing screening, cochlear function, pediatric hearing test"
    }
  },
  {
    id: 18,
    title: "Speech Training & Aural Rehabilitation",
    slug: "speech-training-aural-rehabilitation",
    description: "Personalized speech training, listening therapy, and communication strategies for all ages.",
    image: assets.service_4,
    category: "Speech Therapy",
    detailedContent: {
      overview: "Speech training focuses on improving clarity, articulation, fluency, voice quality, and listening skills. We combine evidence‑based speech therapy with aural rehabilitation for hearing aid and cochlear implant users.",
      benefits: [
        "Improved speech clarity and pronunciation",
        "Enhanced listening and lip‑reading skills",
        "Confidence in conversations and public speaking",
        "Better academic and workplace performance"
      ],
      process: [
        "Initial assessment and goal setting",
        "Customized therapy plan (articulation, fluency, voice, language)",
        "Home practice toolkit and progress tracking",
        "Periodic reviews with measurable outcomes"
      ],
      preparation: ["Bring prior reports and list of goals", "Be well‑rested and hydrated"],
      indications: [
        "Articulation errors, stammering, or voice issues",
        "Delayed speech/language in children",
        "Post‑hearing aid or cochlear implant rehabilitation"
      ],
      dosDonts: {
        dos: ["Do practice daily for 10–15 minutes", "Do maintain session regularity"],
        donts: ["Don’t skip home exercises", "Don’t compare progress with others"]
      },
      aftercare: ["Follow maintenance plans and periodic check‑ins"],
      risks: ["None"],
      results: "Gradual, measurable improvement in speech intelligibility and communication.",
      faqs: [
        { q: "How many sessions are needed?", a: "Varies by goals; many see progress within weeks." },
        { q: "Do parents need to attend?", a: "For children, parent participation accelerates progress." }
      ],
      duration: "30–45 minutes per session",
      cost: "Package and per‑session options available"
    },
    seo: {
      title: "Speech Training Mumbai | Aural Rehabilitation & Communication Therapy",
      description: "Speech training and aural rehabilitation in Mumbai. Improve clarity, fluency, and listening skills with goal‑based therapy.",
      keywords: "speech training Mumbai, aural rehabilitation, articulation therapy, fluency therapy"
    }
  },
  {
    id: 19,
    title: "BERA/ABR Test (Brainstem Evoked Response Audiometry)",
    slug: "bera-abr-test",
    description: "Objective hearing pathway test measuring brainstem responses to sound for infants and adults.",
    image: assets.bera,
    category: "Diagnostics",
    detailedContent: {
      overview: "BERA/ABR records electrical activity from the auditory nerve to the brainstem in response to sound. It helps estimate hearing sensitivity in infants, confirm neural integrity, and differentiate sensory vs neural hearing loss.",
      benefits: [
        "Objective estimate of hearing thresholds",
        "Useful for infants and difficult‑to‑test patients",
        "Assesses auditory nerve/brainstem pathway integrity",
        "Helps diagnose retrocochlear disorders"
      ],
      process: [
        "Skin is cleaned and small electrodes placed on the head/ears",
        "Clicks or tone bursts presented through earphones",
        "Patient rests quietly or sleeps (infants can be naturally asleep)",
        "Responses recorded and analyzed by the audiologist"
      ],
      preparation: [
        "Wash hair; avoid oils or gels on test day",
        "Infants: schedule during natural sleep; feed before the test",
        "Adults: stay relaxed; avoid caffeine if advised"
      ],
      indications: [
        "Newborn/infant hearing assessment",
        "Suspected auditory neuropathy or neural pathway issues",
        "Unreliable behavioral test results",
        "Pre‑ and post‑surgical/ototoxic monitoring"
      ],
      contraindications: ["Open scalp wounds or active skin infections at electrode sites"],
      dosDonts: {
        dos: ["Do arrive on time and stay relaxed", "Do keep the child sleepy and comfortable"],
        donts: ["Don’t apply hair products on the day", "Don’t allow the child to be overtired"]
      },
      aftercare: ["Resume normal activities; remove electrode gel if any"],
      risks: ["None. Non‑invasive and safe"],
      results: "Waveform analysis provides estimated thresholds and neural integrity information with a clear report.",
      faqs: [
        { q: "Does BERA require sedation?", a: "Usually no. Natural sleep often suffices; rare cases may need medical sedation under supervision." },
        { q: "Is it painful?", a: "No. Only surface electrodes are used." }
      ],
      duration: "45–90 minutes depending on cooperation",
      cost: "Priced per protocol; easy payment mode"
    },
    seo: {
      title: "BERA ABR Test Mumbai | Infant Hearing & Auditory Pathway Assessment",
      description: "BERA/ABR test in Mumbai. Objective assessment of hearing thresholds and auditory nerve/brainstem function for infants and adults.",
      keywords: "BERA test Mumbai, ABR hearing test, infant hearing test, auditory neuropathy"
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
      preparation: [
        "Bring previous hearing test reports if available",
        "Consider situations you struggle to hear in (work, home, outdoors)",
        "Clean and dry ears before the visit"
      ],
      whatToExpect: [
        "Discussion of goals and listening environments",
        "Selection and demo of suitable devices",
        "Initial programming with real‑ear verification",
        "Guidance on care, use, and follow‑ups"
      ],
      technologies: {
        digital: "Advanced digital signal processing for natural sound quality",
        wireless: "Bluetooth connectivity and smartphone integration",
        rechargeable: "Convenient rechargeable options for daily use",
        directional: "Directional microphones for better speech understanding"
      },
      duration: "Initial fitting: 30-45 minutes, Follow-up adjustments: 30-45 minutes",
      cost: "Programming included with hearing aid purchase, easy payment mode available",
      faqs: [
        { q: "How long does a fitting take?", a: "About 30–45 minutes for the first session." },
        { q: "Will I need follow‑ups?", a: "Yes, 1–2 follow‑ups optimize comfort and clarity." },
        { q: "Do you do real‑ear measurement?", a: "Yes, to verify amplification at the eardrum." },
        { q: "Can devices pair with my phone?", a: "Most modern aids support Bluetooth streaming and control." },
        { q: "Is there a trial period?", a: "We provide adjustments and support during the trial period." }
      ]
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
      cost: "Affordable pricing with easy payment mode",
      preparation: [
        "Set a realistic budget range",
        "List daily listening needs (phone, TV, meetings)",
        "Bring previous audiogram if available"
      ],
      whatToExpect: [
        "Overview of brands and levels",
        "Hands‑on demo and feature comparison",
        "Transparent pricing and warranty details"
      ],
      faqs: [
        { q: "Which brand is best?", a: "Best depends on your audiogram, lifestyle, and budget." },
        { q: "Do you offer EMI?", a: "Yes, flexible payment options are available." },
        { q: "Is there warranty?", a: "Manufacturer warranty with our local support is included." },
        { q: "Can I upgrade later?", a: "Yes, we’ll advise the most cost‑effective path." },
        { q: "Are basic models good enough?", a: "For quiet lifestyles, basics may be sufficient; we’ll guide you." }
      ]
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
      cost: "Premium pricing with long-term savings",
      preparation: [
        "Bring your daily routine to plan charging habits",
        "Clear a safe charging spot at home"
      ],
      whatToExpect: [
        "Demo of charger and battery care",
        "Setup of reminders and status checks via app"
      ],
      faqs: [
        { q: "How long does a charge last?", a: "Typically a full day, depending on streaming and settings." },
        { q: "Can I travel with the charger?", a: "Yes, compact chargers and power banks are available." },
        { q: "Are batteries replaceable?", a: "Service centers can replace lithium cells when needed." },
        { q: "Is water resistance included?", a: "Many models are IP‑rated; we’ll advise suitable options." },
        { q: "Does fast charging work?", a: "Some models support quick top‑ups for short use." }
      ]
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
      cost: "Competitive pricing with bulk discounts",
      preparation: [
        "Note your hearing aid brand/model and current battery size",
        "Store batteries in a cool, dry place"
      ],
      whatToExpect: [
        "Size verification and performance tips",
        "Disposal guidance for used cells"
      ],
      faqs: [
        { q: "How long do batteries last?", a: "3–10 days depending on size and streaming use." },
        { q: "Should I remove tabs early?", a: "Peel zinc‑air tabs only when ready to use." },
        { q: "Are rechargeable better?", a: "Great for convenience; we’ll advise if suitable for you." },
        { q: "Do you sell in bulk?", a: "Yes, with discounted pricing." },
        { q: "How to dispose?", a: "Use battery recycling; avoid household trash where prohibited." }
      ]
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
      cost: "Competitive repair pricing with warranty",
      preparation: [
        "Bring devices, chargers, and cases",
        "Note specific issues, error messages, or times of failure"
      ],
      whatToExpect: [
        "Initial diagnosis and quote",
        "Temporary loaners may be available during repair"
      ],
      faqs: [
        { q: "How long will repairs take?", a: "Minor fixes same day; complex repairs 10–15 days." },
        { q: "Is there a warranty on repairs?", a: "Yes, we provide limited repair warranties." },
        { q: "Do you service all brands?", a: "Yes, most major brands are supported." },
        { q: "Can moisture damage be fixed?", a: "Often yes; we also advise preventive care." },
        { q: "Do you clean earmolds?", a: "Yes, with sanitization and tubing replacement if needed." }
      ]
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
      preparation: [
        "Bring prior reports and school/doctor notes if available",
        "List specific goals (clarity, fluency, voice, language)",
        "Ensure the client is rested and hydrated"
      ],
      whatToExpect: [
        "Baseline assessment and goal setting",
        "Targeted exercises with clinician modeling",
        "Home practice with feedback and progress tracking"
      ],
      duration: "Sessions typically last 30-45 minutes, with frequency based on individual needs",
      cost: "Competitive pricing with easy payment mode",
      faqs: [
        { q: "How many sessions will we need?", a: "Depends on goals and consistency; we review progress regularly." },
        { q: "Do you give home practice?", a: "Yes, brief daily practice accelerates results." },
        { q: "Can parents join sessions?", a: "Yes, especially for children; parent training improves outcomes." },
        { q: "Do you help with stammering?", a: "Yes, using evidence‑based fluency techniques." },
        { q: "Is tele‑therapy available?", a: "Yes, remote sessions can be arranged." }
      ]
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
      preparation: [
        "Schedule around nap times; bring familiar toys/snacks",
        "Explain the visit simply to reduce anxiety"
      ],
      whatToExpect: [
        "Gentle, age‑appropriate tests (BOA, OAE, ABR as needed)",
        "Parent involvement during assessments",
        "Clear guidance on next steps and school support"
      ],
      duration: "Initial assessment: 30-45 minutes, Follow-up sessions: 30-45 minutes",
      cost: "Easy payment mode available",
      faqs: [
        { q: "Can my child be tested while asleep?", a: "Yes, infants often undergo OAE/ABR during natural sleep." },
        { q: "Is it painful?", a: "No, tests are non‑invasive and child‑friendly." },
        { q: "Do you provide reports for school?", a: "Yes, we provide clear reports and recommendations." },
        { q: "How often should we retest?", a: "As advised; typically 6–12 months for ongoing concerns." },
        { q: "Do you fit pediatric hearing aids?", a: "Yes, with parent training and follow‑ups." }
      ]
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
      preparation: [
        "Note triggers, time of day, and impact on sleep/stress",
        "Bring medication list and any previous hearing tests"
      ],
      whatToExpect: [
        "Detailed case history and hearing evaluation",
        "Education on tinnitus mechanisms",
        "Personalized sound therapy and counseling plan"
      ],
      duration: "Initial evaluation: 30-45 minutes, Follow-up sessions: 30-45 minutes",
      cost: "Easy payment mode available for all services",
      faqs: [
        { q: "Can tinnitus be cured?", a: "Cures are rare, but symptoms can be significantly reduced." },
        { q: "Do hearing aids help?", a: "Yes, many patients experience relief with amplification and masking." },
        { q: "Will it get worse?", a: "Managing stress and hearing health helps prevent worsening." },
        { q: "Does caffeine affect tinnitus?", a: "In some; we tailor lifestyle guidance individually." },
        { q: "How long before I notice improvement?", a: "Often within weeks with consistent use of strategies." }
      ]
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
      preparation: [
        "Bring list of medications and existing reports",
        "Come with a family member if possible for support"
      ],
      whatToExpect: [
        "Clear, unhurried communication and large‑print materials",
        "Comfortable facilities with accessibility support",
        "Device demonstrations and home care guidance"
      ],
      duration: "Extended appointments: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Senior discounts available, easy payment mode",
      faqs: [
        { q: "Are home visits available?", a: "Yes, on request within serviceable areas." },
        { q: "Do you provide caregiver training?", a: "Yes, we train family on device care and communication." },
        { q: "Can you help with TV and phone hearing?", a: "Yes, via accessories and setup support." },
        { q: "Is financing available?", a: "Yes, with senior‑friendly payment options." },
        { q: "How often should seniors test hearing?", a: "Annually, or sooner with sudden changes." }
      ]
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
      preparation: [
        "Bring your phone and current hearing aids",
        "Know your TV model for compatibility checks"
      ],
      whatToExpect: [
        "Hands‑on demo of streaming options",
        "Pairing, tuning, and user training",
        "Tips to minimize latency and interference"
      ],
      duration: "Setup and fitting: 30-45 minutes, Training: 30-45 minutes",
      cost: "Various price ranges available, easy payment mode",
      faqs: [
        { q: "Will this disturb others at home?", a: "No, you can stream privately to your hearing aids." },
        { q: "Does it work with all TVs?", a: "Most do; adapters are available for older TVs." },
        { q: "Can I take calls through my aids?", a: "Yes, on supported Bluetooth models." },
        { q: "Is there audio delay?", a: "We select solutions with minimal latency and tune settings." },
        { q: "Can I control volume independently?", a: "Yes, via app or accessory remote." }
      ]
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
      preparation: [
        "Bring recent audiogram if available",
        "List preferred brands or features"
      ],
      whatToExpect: [
        "Showroom demos and comparisons",
        "Local after‑sales service and quick support"
      ],
      duration: "Initial consultation: 30-45 minutes, Fitting: 30-45 minutes",
      cost: "Competitive local pricing, easy payment mode",
      faqs: [
        { q: "Do you stock all models?", a: "We maintain popular models and can order others swiftly." },
        { q: "Is walk‑in allowed?", a: "Appointments preferred; walk‑ins accommodated subject to slots." },
        { q: "Do you provide on‑site service?", a: "Yes, local support and quick turnarounds are available." },
        { q: "Can I try before buying?", a: "Yes, demos and trial periods help ensure the right choice." },
        { q: "Are accessories compatible across brands?", a: "Many are; we ensure proper compatibility and setup." }
      ]
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "Brand comparisons and feature matching",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "Which brand suits me best?", a: "We profile your needs to recommend the right line." },
        { q: "Do you provide manufacturer updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is service center support available?", a: "We coordinate warranty and service with manufacturers." },
        { q: "Are accessories cross‑brand compatible?", a: "Some are; we ensure the right pairing." },
        { q: "Can I switch brands later?", a: "Yes, we manage data transfer and retuning." }
      ]
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
      preparation: [
        "List your symptoms and hearing challenges",
        "Bring medical history and previous reports"
      ],
      whatToExpect: [
        "Objective tests as needed",
        "Clear explanation of findings and options",
        "Personalized plan with timelines and costs"
      ],
      duration: "Comprehensive consultation: 30-45 minutes",
      cost: "Consultation fees vary, easy payment mode available",
      faqs: [
        { q: "Do I need a referral?", a: "No, you can book directly." },
        { q: "Will I get a report?", a: "Yes, with recommendations and next steps." },
        { q: "Are family members welcome?", a: "Yes, their input helps tailor solutions." },
        { q: "How soon can treatment start?", a: "Often immediately after evaluation." },
        { q: "Is tele‑consultation available?", a: "Yes, for follow‑ups and guidance." }
      ]
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
      preparation: [
        "Avoid ear cleaning with buds; let us assess first",
        "Share usage purpose (music, swim, sleep, noise) to choose material"
      ],
      whatToExpect: [
        "Comfortable ear impression using soft material",
        "Color, vent, and filter options",
        "Fitting and fine adjustments on delivery"
      ],
      duration: "Impression taking: 30-45 minutes, Fitting: 30-45 minutes",
      cost: "Competitive pricing with various material options",
      faqs: [
        { q: "How long do custom molds last?", a: "Typically 2–5 years depending on use and care." },
        { q: "Are they waterproof?", a: "Swimming plugs are; hearing molds have vents as needed." },
        { q: "Can I pick colors?", a: "Yes, multiple color and finish choices are available." },
        { q: "Do musicians get flat filters?", a: "Yes, with selectable attenuation levels." },
        { q: "What if my ear shape changes?", a: "We can remake molds with updated impressions." }
      ]
    },
    seo: {
      title: "Custom Ear Molds Mumbai | Ear Plugs & Hearing Aid Molds",
      description: "Custom ear molds and ear plugs in Mumbai. Professional fitting for hearing aids, swimming, music, and noise protection. Expert impression services available.",
      keywords: "custom ear molds Mumbai, ear plugs Mumbai, hearing aid molds, swimming ear plugs, musician ear plugs"
    }
  },
  {
    id: 14,
    title: "SIGNIA Hearing Aids Service",
    slug: "signia-hearing-aids-service",
    description: "Authorized services and fitting of Signia hearing aids with expert consultation and support.",
    image: assets.signia_logo,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for Signia hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. Signia offers innovative technology with superior sound quality and advanced features.",
      benefits: [
        "Authorized Signia dealer",
        "Complete Signia product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Signia product demonstration",
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "Signia technology demonstration",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "What makes Signia hearing aids special?", a: "Signia offers innovative technology with superior sound quality and advanced features." },
        { q: "Do you provide Signia updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is Signia service center support available?", a: "We coordinate warranty and service with Signia manufacturers." },
        { q: "Are Signia accessories compatible?", a: "Yes, we ensure proper accessory pairing for optimal performance." },
        { q: "Can I upgrade my Signia hearing aids?", a: "Yes, we manage upgrades and retuning for better performance." }
      ]
    },
    seo: {
      title: "SIGNIA Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for Signia hearing aids in Mumbai. Expert fitting, programming, and support for Signia hearing instruments by a dedicated audiologist.",
      keywords: "Signia hearing aids Mumbai, Signia hearing aids dealer Mumbai, Signia hearing aids service Mumbai"
    }
  },
  {
    id: 15,
    title: "RESOUND GN CUSTOM Hearing Aids Service",
    slug: "resound-gn-custom-hearing-aids-service",
    description: "Authorized services and fitting of ReSound GN Custom hearing aids with expert consultation and support.",
    image: assets.resound_logo,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for ReSound GN Custom hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. ReSound offers innovative technology with natural sound quality.",
      benefits: [
        "Authorized ReSound GN Custom dealer",
        "Complete ReSound product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "ReSound product demonstration",
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "ReSound technology demonstration",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "What makes ReSound hearing aids special?", a: "ReSound offers innovative technology with natural sound quality and advanced features." },
        { q: "Do you provide ReSound updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is ReSound service center support available?", a: "We coordinate warranty and service with ReSound manufacturers." },
        { q: "Are ReSound accessories compatible?", a: "Yes, we ensure proper accessory pairing for optimal performance." },
        { q: "Can I upgrade my ReSound hearing aids?", a: "Yes, we manage upgrades and retuning for better performance." }
      ]
    },
    seo: {
      title: "RESOUND GN CUSTOM Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for ReSound GN Custom hearing aids in Mumbai. Expert fitting, programming, and support for ReSound hearing instruments by a dedicated audiologist.",
      keywords: "ReSound hearing aids Mumbai, ReSound GN Custom hearing aids Mumbai, ReSound hearing aids dealer Mumbai"
    }
  },
  {
    id: 16,
    title: "OTICON Hearing Aids Service",
    slug: "oticon-hearing-aids-service",
    description: "Authorized services and fitting of Oticon hearing aids with expert consultation and support.",
    image: assets.oticon_logo,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for Oticon hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. Oticon offers innovative technology with superior sound quality and advanced features.",
      benefits: [
        "Authorized Oticon dealer",
        "Complete Oticon product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Oticon product demonstration",
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "Oticon technology demonstration",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "What makes Oticon hearing aids special?", a: "Oticon offers innovative technology with superior sound quality and advanced features." },
        { q: "Do you provide Oticon updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is Oticon service center support available?", a: "We coordinate warranty and service with Oticon manufacturers." },
        { q: "Are Oticon accessories compatible?", a: "Yes, we ensure proper accessory pairing for optimal performance." },
        { q: "Can I upgrade my Oticon hearing aids?", a: "Yes, we manage upgrades and retuning for better performance." }
      ]
    },
    seo: {
      title: "OTICON Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for Oticon hearing aids in Mumbai. Expert fitting, programming, and support for Oticon hearing instruments by a dedicated audiologist.",
      keywords: "Oticon hearing aids Mumbai, Oticon hearing aids dealer Mumbai, Oticon hearing aids service Mumbai"
    }
  },
  {
    id: 17,
    title: "WIDEX Hearing Aids Service",
    slug: "widex-hearing-aids-service",
    description: "Authorized services and fitting of Widex hearing aids with expert consultation and support.",
    image: assets.widex_logo,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for Widex hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. Widex offers innovative technology with superior sound quality and advanced features.",
      benefits: [
        "Authorized Widex dealer",
        "Complete Widex product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Widex product demonstration",
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "Widex technology demonstration",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "What makes Widex hearing aids special?", a: "Widex offers innovative technology with superior sound quality and advanced features." },
        { q: "Do you provide Widex updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is Widex service center support available?", a: "We coordinate warranty and service with Widex manufacturers." },
        { q: "Are Widex accessories compatible?", a: "Yes, we ensure proper accessory pairing for optimal performance." },
        { q: "Can I upgrade my Widex hearing aids?", a: "Yes, we manage upgrades and retuning for better performance." }
      ]
    },
    seo: {
      title: "WIDEX Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for Widex hearing aids in Mumbai. Expert fitting, programming, and support for Widex hearing instruments by a dedicated audiologist.",
      keywords: "Widex hearing aids Mumbai, Widex hearing aids dealer Mumbai, Widex hearing aids service Mumbai"
    }
  },
  {
    id: 18,
    title: "UNITRON Hearing Aids Service",
    slug: "unitron-hearing-aids-service",
    description: "Authorized services and fitting of Unitron hearing aids with expert consultation and support.",
    image: assets.unitron_logo,
    category: "Brands",
    detailedContent: {
      overview: "Authorized dealer for Unitron hearing aids providing expert fitting, programming, and support for the complete range of hearing instruments. Unitron offers innovative technology with superior sound quality and advanced features.",
      benefits: [
        "Authorized Unitron dealer",
        "Complete Unitron product range",
        "Expert fitting and programming",
        "Manufacturer warranty support",
        "Software updates and maintenance",
        "Accessory compatibility"
      ],
      process: [
        "Hearing assessment and candidacy evaluation",
        "Unitron product demonstration",
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
      preparation: [
        "Share your priorities (clarity, comfort, connectivity)",
        "Bring your phone for app setup"
      ],
      whatToExpect: [
        "Unitron technology demonstration",
        "Professional fitting with verification",
        "Warranty registration and updates"
      ],
      duration: "Initial fitting: 30-45 minutes, Follow-up: 30-45 minutes",
      cost: "Competitive pricing with expert fitting included",
      faqs: [
        { q: "What makes Unitron hearing aids special?", a: "Unitron offers innovative technology with superior sound quality and advanced features." },
        { q: "Do you provide Unitron updates?", a: "Yes, firmware and software updates are supported." },
        { q: "Is Unitron service center support available?", a: "We coordinate warranty and service with Unitron manufacturers." },
        { q: "Are Unitron accessories compatible?", a: "Yes, we ensure proper accessory pairing for optimal performance." },
        { q: "Can I upgrade my Unitron hearing aids?", a: "Yes, we manage upgrades and retuning for better performance." }
      ]
    },
    seo: {
      title: "UNITRON Hearing Aids Mumbai | Authorized Dealer",
      description: "Authorized dealer for Unitron hearing aids in Mumbai. Expert fitting, programming, and support for Unitron hearing instruments by a dedicated audiologist.",
      keywords: "Unitron hearing aids Mumbai, Unitron hearing aids dealer Mumbai, Unitron hearing aids service Mumbai"
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
