import { assets } from '../assets/assets';

// Comprehensive hearing aid brands and devices data
export const hearingAidBrands = [
  {
    id: 1,
    brandName: "Signia",
    brandSlug: "signia",
    description: "Leading German hearing aid manufacturer known for innovative technology and superior sound quality.",
    logo: assets.signia_logo,
    website: "https://www.signia.com",
    founded: "2016",
    headquarters: "Germany",
    devices: [
      {
        id: 1,
        name: "Signia Pure Charge&Go AX",
        slug: "signia-pure-charge-go-ax",
        model: "Pure Charge&Go AX",
        category: "Rechargeable",
        priceRange: "Premium",
        image: assets.signia_1,
        description: "Advanced rechargeable RIC hearing aid with AI-powered Augmented Focus technology and superior speech understanding in noisy environments.",
        features: [
          "AI-powered Augmented Focus technology",
          "Bluetooth 5.0 connectivity with hands-free calls",
          "Rechargeable lithium-ion battery (30+ hours)",
          "Tinnitus therapy with Notch Therapy",
          "Own Voice Processing (OVP) for natural sound",
          "Motion sensors with fall detection",
          "Signia app control and customization"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        howToUse: [
          "Insert hearing aid with the correct ear (marked L/R)",
          "Turn on by opening battery door or pressing power button",
          "Adjust volume using smartphone app or hearing aid controls",
          "Use Bluetooth to stream audio from phone, TV, or other devices",
          "Charge overnight using provided charging case"
        ],
        precautions: [
          "Keep away from water and moisture",
          "Avoid extreme temperatures",
          "Clean regularly with provided tools",
          "Don't expose to direct sunlight for extended periods",
          "Remove before showering or swimming"
        ],
        dosDonts: {
          dos: [
            "Do charge daily for optimal performance",
            "Do clean with dry cloth and brush",
            "Do store in charging case when not in use",
            "Do use smartphone app for adjustments"
          ],
          donts: [
            "Don't use in water or high humidity",
            "Don't drop or subject to impact",
            "Don't use sharp objects for cleaning",
            "Don't expose to extreme heat or cold"
          ]
        },
        maintenance: [
          "Daily cleaning with dry cloth",
          "Weekly deep cleaning with brush",
          "Monthly filter replacement",
          "Annual professional servicing"
        ],
        troubleshooting: [
          "No sound: Check battery level and volume",
          "Poor sound quality: Clean microphone ports",
          "Bluetooth issues: Reset pairing in app",
          "Charging problems: Clean charging contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.signia_logo },
          { name: "Champagne", hex: "#F7E7CE", image: assets.signia_logo },
          { name: "Black", hex: "#2C2C2C", image: assets.signia_logo },
          { name: "Brown", hex: "#8B4513", image: assets.signia_logo }
        ]
      },
      {
        id: 2,
        name: "Signia Silk X",
        slug: "signia-silk-x",
        model: "Silk X",
        category: "Invisible",
        priceRange: "Premium",
        image: assets.signia_2,
        description: "Completely-in-canal hearing aid that's virtually invisible when worn, featuring advanced sound processing.",
        features: [
          "Completely invisible design",
          "Advanced sound processing technology",
          "Natural sound quality",
          "Easy insertion and removal",
          "Custom molded for perfect fit",
          "Tinnitus relief with Notch Therapy",
          "Wax protection system"
        ],
        specifications: {
          batteryLife: "Up to 7 days",
          batteryType: "Size 10",
          waterResistance: "IP67",
          frequencyRange: "125 Hz - 8 kHz",
          gainRange: "Up to 50 dB"
        },
        howToUse: [
          "Gently insert into ear canal",
          "Twist slightly to secure fit",
          "Remove by pulling gently on removal string",
          "Replace battery when low battery signal sounds",
          "Clean daily with provided tools"
        ],
        precautions: [
          "Handle gently to avoid damage",
          "Keep away from pets and children",
          "Don't force insertion",
          "Avoid moisture and humidity"
        ],
        dosDonts: {
          dos: [
            "Do clean daily",
            "Do store in dry case",
            "Do replace battery promptly",
            "Do handle with clean hands"
          ],
          donts: [
            "Don't drop or crush",
            "Don't use in water",
            "Don't share with others",
            "Don't expose to extreme temperatures"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly battery replacement",
          "Monthly professional cleaning",
          "Annual servicing"
        ],
        troubleshooting: [
          "Won't fit: Check for earwax buildup",
          "No sound: Replace battery",
          "Whistling: Check fit and positioning",
          "Poor sound: Clean microphone"
        ],
        colors: [
          { name: "Skin Tone", hex: "#F4C2A1", image: assets.service_7 },
          { name: "Light Beige", hex: "#F5F5DC", image: assets.service_7 },
          { name: "Medium Beige", hex: "#D2B48C", image: assets.service_7 }
        ]
      },
      {
        id: 4,
        name: "Signia Insio",
        slug: "signia-insio",
        model: "Insio",
        category: "In-The-Canal",
        priceRange: "Mid-Range",
        image: assets.signia_4,
        description: "Custom-molded in-the-canal hearing aid for discreet and comfortable wear.",
        features: [
          "Custom molded fit",
          "Discreet design",
          "Natural sound quality",
          "Easy insertion",
          "Tinnitus relief",
          "Wax protection"
        ],
        specifications: {
          batteryLife: "Up to 10 days",
          batteryType: "Size 312",
          waterResistance: "IP67",
          frequencyRange: "125 Hz - 8 kHz",
          gainRange: "Up to 60 dB"
        },
        colors: [
          { name: "Skin Tone", hex: "#F4C2A1", image: assets.service_7 },
          { name: "Light Beige", hex: "#F5F5DC", image: assets.service_7 },
          { name: "Medium Beige", hex: "#D2B48C", image: assets.service_7 }
        ]
      },
      {
        id: 5,
        name: "Signia Motion",
        slug: "signia-motion",
        model: "Motion",
        category: "Behind-the-Ear",
        priceRange: "Mid-Range",
        image: assets.signia_5,
        description: "Reliable behind-the-ear hearing aid with advanced sound processing technology.",
        features: [
          "Advanced sound processing",
          "Bluetooth connectivity",
          "Rechargeable options",
          "Tinnitus relief",
          "Motion sensors",
          "Easy controls"
        ],
        specifications: {
          batteryLife: "Up to 20 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 70 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      }
    ]
  },
  {
    id: 2,
    brandName: "Phonak",
    brandSlug: "phonak",
    description: "Swiss hearing aid manufacturer specializing in innovative technology and connectivity solutions.",
    logo: assets.phonak_logo,
    website: "https://www.phonak.com",
    founded: "1947",
    headquarters: "Switzerland",
    devices: [
      {
        id: 3,
        name: "Phonak Audeo Paradise",
        slug: "phonak-audeo-paradise",
        model: "Audeo Paradise",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.phonak_1,
        description: "Premium behind-the-ear hearing aid with Phonak's latest Paradise technology for superior speech understanding and connectivity.",
        features: [
          "Automatic Speech Enhancement (ASE)",
          "Bluetooth 5.0 streaming with hands-free calls",
          "Rechargeable lithium-ion battery",
          "Motion sensors with fall detection",
          "Tinnitus relief with SoundRelax",
          "Roger connectivity for wireless accessories",
          "myPhonak app control"
        ],
        specifications: {
          batteryLife: "Up to 24 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 85 dB"
        },
        howToUse: [
          "Place behind ear with tube facing forward",
          "Insert earpiece into ear canal",
          "Adjust volume using controls or app",
          "Connect to smartphone for streaming",
          "Charge overnight for daily use"
        ],
        precautions: [
          "Avoid water exposure",
          "Handle with care",
          "Keep away from magnets",
          "Don't expose to extreme temperatures"
        ],
        dosDonts: {
          dos: [
            "Do charge regularly",
            "Do clean daily",
            "Do use app for adjustments",
            "Do store in case"
          ],
          donts: [
            "Don't use in water",
            "Don't drop",
            "Don't expose to heat",
            "Don't use harsh chemicals"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly deep cleaning",
          "Monthly filter changes",
          "Annual servicing"
        ],
        troubleshooting: [
          "No sound: Check battery and volume",
          "Poor quality: Clean microphones",
          "Bluetooth issues: Reset connection",
          "Charging problems: Clean contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      },
      {
        id: 8,
        name: "Phonak Virto Marvel",
        slug: "phonak-virto-marvel",
        model: "Virto Marvel",
        category: "Custom",
        priceRange: "Premium",
        image: assets.phonak_2,
        description: "Custom-molded hearing aid with advanced connectivity and AI-powered features.",
        features: [
          "Custom molded design",
          "AI-powered sound processing",
          "Bluetooth streaming",
          "Roger connectivity",
          "Tinnitus relief",
          "Motion sensors"
        ],
        specifications: {
          batteryLife: "Up to 8 days",
          batteryType: "Size 13",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 85 dB"
        },
        colors: [
          { name: "Skin Tone", hex: "#F4C2A1", image: assets.service_7 },
          { name: "Light Beige", hex: "#F5F5DC", image: assets.service_7 },
          { name: "Medium Beige", hex: "#D2B48C", image: assets.service_7 }
        ]
      },
      {
        id: 9,
        name: "Phonak Naída Marvel",
        slug: "phonak-naida-marvel",
        model: "Naída Marvel",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.phonak_3,
        description: "Powerful behind-the-ear hearing aid for severe to profound hearing loss.",
        features: [
          "High power amplification",
          "Bluetooth streaming",
          "Roger connectivity",
          "Tinnitus relief",
          "Motion sensors",
          "Rechargeable options"
        ],
        specifications: {
          batteryLife: "Up to 24 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 90 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      },
      {
        id: 10,
        name: "Phonak Sky Marvel",
        slug: "phonak-sky-marvel",
        model: "Sky Marvel",
        category: "Behind-the-Ear",
        priceRange: "Mid-Range",
        image: assets.phonak_4,
        description: "Pediatric-focused hearing aid with advanced features for children.",
        features: [
          "Child-friendly design",
          "Tamper-resistant battery door",
          "Bluetooth streaming",
          "Roger connectivity",
          "Tinnitus relief",
          "Easy controls"
        ],
        specifications: {
          batteryLife: "Up to 20 hours",
          batteryType: "Size 13",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Blue", hex: "#4169E1", image: assets.service_7 }
        ]
      }
    ]
  },
  {
    id: 3,
    brandName: "ReSound",
    brandSlug: "resound",
    description: "Danish hearing aid manufacturer known for natural sound quality and advanced connectivity.",
    logo: assets.resound_logo,
    website: "https://www.resound.com",
    founded: "1943",
    headquarters: "Denmark",
    devices: [
      {
        id: 4,
        name: "ReSound ONE",
        slug: "resound-one",
        model: "ONE",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.resound_1,
        description: "Revolutionary hearing aid with microphone in ear canal for the most natural sound experience.",
        features: [
          "Microphone in ear canal (M&RIE)",
          "Natural sound quality",
          "Bluetooth 5.0 streaming",
          "Rechargeable lithium-ion battery",
          "AI-powered adjustments",
          "Tinnitus relief with ReSound Relief"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        howToUse: [
          "Insert receiver into ear canal",
          "Place hearing aid behind ear",
          "Connect to smartphone app",
          "Adjust settings via app",
          "Charge overnight"
        ],
        precautions: [
          "Keep dry",
          "Handle gently",
          "Avoid extreme temperatures",
          "Don't expose to chemicals"
        ],
        dosDonts: {
          dos: [
            "Do charge daily",
            "Do clean regularly",
            "Do use app controls",
            "Do store safely"
          ],
          donts: [
            "Don't use in water",
            "Don't drop",
            "Don't expose to heat",
            "Don't use harsh cleaners"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly deep cleaning",
          "Monthly filter replacement",
          "Annual check-up"
        ],
        troubleshooting: [
          "No sound: Check battery",
          "Poor quality: Clean microphones",
          "Connection issues: Reset Bluetooth",
          "Charging issues: Clean contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Brown", hex: "#8B4513", image: assets.service_7 }
        ]
      },
      {
        id: 12,
        name: "ReSound LiNX Quattro",
        slug: "resound-linx-quattro",
        model: "LiNX Quattro",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.resound_2,
        description: "Premium hearing aid with advanced connectivity and natural sound processing.",
        features: [
          "Natural sound processing",
          "Bluetooth streaming",
          "Rechargeable battery",
          "Tinnitus relief",
          "Motion sensors",
          "AI-powered adjustments"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      },
      {
        id: 13,
        name: "ReSound Enzo",
        slug: "resound-enzo",
        model: "Enzo",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.resound_3,
        description: "Powerful hearing aid designed for severe to profound hearing loss.",
        features: [
          "High power amplification",
          "Bluetooth streaming",
          "Tinnitus relief",
          "Motion sensors",
          "Rechargeable options",
          "Easy controls"
        ],
        specifications: {
          batteryLife: "Up to 24 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 90 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Brown", hex: "#8B4513", image: assets.service_7 }
        ]
      },
      {
        id: 14,
        name: "ReSound Up Smart",
        slug: "resound-up-smart",
        model: "Up Smart",
        category: "Behind-the-Ear",
        priceRange: "Mid-Range",
        image: assets.resound_4,
        description: "Smart hearing aid with essential features for everyday use.",
        features: [
          "Smart sound processing",
          "Bluetooth connectivity",
          "Tinnitus relief",
          "Easy controls",
          "Comfortable fit",
          "Long battery life"
        ],
        specifications: {
          batteryLife: "Up to 20 hours",
          batteryType: "Size 13",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 75 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      }
    ]
  },
  {
    id: 4,
    brandName: "Oticon",
    brandSlug: "oticon",
    description: "Danish hearing aid manufacturer focused on brain-hearing technology and natural sound processing.",
    logo: assets.oticon_logo,
    website: "https://www.oticon.com",
    founded: "1904",
    headquarters: "Denmark",
    devices: [
      {
        id: 5,
        name: "Oticon More",
        slug: "oticon-more",
        model: "More",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.oticon_2,
        description: "AI-powered hearing aid with Deep Neural Network technology that learns and adapts to your listening preferences.",
        features: [
          "AI-powered sound processing",
          "Deep Neural Network technology",
          "Bluetooth 5.0 connectivity",
          "Rechargeable lithium-ion battery",
          "Tinnitus relief with Tinnitus SoundSupport",
          "Motion sensors with fall detection"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        howToUse: [
          "Place behind ear",
          "Insert earpiece into ear canal",
          "Connect to smartphone app",
          "Let AI learn your preferences",
          "Charge overnight"
        ],
        precautions: [
          "Keep dry",
          "Handle with care",
          "Avoid extreme temperatures",
          "Don't expose to magnets"
        ],
        dosDonts: {
          dos: [
            "Do charge regularly",
            "Do clean daily",
            "Do use app features",
            "Do store in case"
          ],
          donts: [
            "Don't use in water",
            "Don't drop",
            "Don't expose to heat",
            "Don't use chemicals"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly deep cleaning",
          "Monthly filter changes",
          "Annual servicing"
        ],
        troubleshooting: [
          "No sound: Check battery",
          "Poor quality: Clean microphones",
          "App issues: Restart app",
          "Charging problems: Clean contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Brown", hex: "#8B4513", image: assets.service_7 }
        ]
      },
      {
        id: 16,
        name: "Oticon Opn S",
        slug: "oticon-opn-s",
        model: "Opn S",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.oticon_3,
        description: "Advanced hearing aid with OpenSound Navigator for natural sound experience.",
        features: [
          "OpenSound Navigator",
          "Bluetooth streaming",
          "Rechargeable battery",
          "Tinnitus relief",
          "Motion sensors",
          "AI-powered adjustments"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      },
      {
        id: 17,
        name: "Oticon Ruby",
        slug: "oticon-ruby",
        model: "Ruby",
        category: "Behind-the-Ear",
        priceRange: "Mid-Range",
        image: assets.oticon_4,
        description: "Reliable hearing aid with essential features for everyday use.",
        features: [
          "Reliable performance",
          "Bluetooth connectivity",
          "Tinnitus relief",
          "Easy controls",
          "Comfortable fit",
          "Long battery life"
        ],
        specifications: {
          batteryLife: "Up to 20 hours",
          batteryType: "Size 13",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 75 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Brown", hex: "#8B4513", image: assets.service_7 }
        ]
      },
      {
        id: 18,
        name: "Oticon Xceed",
        slug: "oticon-xceed",
        model: "Xceed",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.oticon_2,
        description: "Powerful hearing aid designed for severe to profound hearing loss.",
        features: [
          "High power amplification",
          "Bluetooth streaming",
          "Tinnitus relief",
          "Motion sensors",
          "Rechargeable options",
          "Easy controls"
        ],
        specifications: {
          batteryLife: "Up to 24 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 90 dB"
        },
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      }
    ]
  },
  {
    id: 5,
    brandName: "Unitron",
    brandSlug: "unitron",
    description: "Canadian hearing aid manufacturer known for reliable technology and user-friendly designs.",
    logo: assets.unitron_logo,
    website: "https://www.unitron.com",
    founded: "1964",
    headquarters: "Canada",
    devices: [
      {
        id: 6,
        name: "Unitron Moxi Fit",
        slug: "unitron-moxi-fit",
        model: "Moxi Fit",
        category: "Behind-the-Ear",
        priceRange: "Mid-Range",
        image: assets.unitron_logo,
        description: "Comfortable behind-the-ear hearing aid with advanced sound processing and reliable performance.",
        features: [
          "Advanced sound processing",
          "Bluetooth 5.0 connectivity",
          "Rechargeable lithium-ion battery",
          "Tinnitus relief with SoundRelax",
          "Easy controls",
          "Comfortable fit"
        ],
        specifications: {
          batteryLife: "Up to 24 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 75 dB"
        },
        howToUse: [
          "Place behind ear",
          "Insert earpiece into ear canal",
          "Connect to smartphone",
          "Adjust via app or controls",
          "Charge overnight"
        ],
        precautions: [
          "Keep dry",
          "Handle gently",
          "Avoid extreme temperatures",
          "Don't expose to chemicals"
        ],
        dosDonts: {
          dos: [
            "Do charge daily",
            "Do clean regularly",
            "Do use app features",
            "Do store safely"
          ],
          donts: [
            "Don't use in water",
            "Don't drop",
            "Don't expose to heat",
            "Don't use harsh cleaners"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly deep cleaning",
          "Monthly filter replacement",
          "Annual check-up"
        ],
        troubleshooting: [
          "No sound: Check battery",
          "Poor quality: Clean microphones",
          "Connection issues: Reset Bluetooth",
          "Charging issues: Clean contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_9 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_9 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_9 },
          { name: "Brown", hex: "#8B4513", image: assets.service_9 }
        ]
      }
    ]
  },
  {
    id: 6,
    brandName: "Widex",
    brandSlug: "widex",
    description: "Danish hearing aid manufacturer specializing in natural sound and advanced technology.",
    logo: assets.widex_logo,
    website: "https://www.widex.com",
    founded: "1956",
    headquarters: "Denmark",
    devices: [
      {
        id: 7,
        name: "Widex MOMENT",
        slug: "widex-moment",
        model: "MOMENT",
        category: "Behind-the-Ear",
        priceRange: "Premium",
        image: assets.widex_logo,
        description: "Premium hearing aid with PureSound technology for the most natural sound quality and speech understanding.",
        features: [
          "PureSound technology",
          "Bluetooth 5.0 streaming",
          "Rechargeable lithium-ion battery",
          "Tinnitus relief with Zen therapy",
          "AI-powered adjustments",
          "Natural sound processing"
        ],
        specifications: {
          batteryLife: "Up to 30 hours",
          chargingTime: "3 hours",
          waterResistance: "IP68",
          bluetooth: "Bluetooth 5.0",
          frequencyRange: "125 Hz - 20 kHz",
          gainRange: "Up to 80 dB"
        },
        howToUse: [
          "Place behind ear",
          "Insert earpiece into ear canal",
          "Connect to smartphone app",
          "Adjust settings via app",
          "Charge overnight"
        ],
        precautions: [
          "Keep dry",
          "Handle with care",
          "Avoid extreme temperatures",
          "Don't expose to magnets"
        ],
        dosDonts: {
          dos: [
            "Do charge regularly",
            "Do clean daily",
            "Do use app controls",
            "Do store in case"
          ],
          donts: [
            "Don't use in water",
            "Don't drop",
            "Don't expose to heat",
            "Don't use chemicals"
          ]
        },
        maintenance: [
          "Daily cleaning",
          "Weekly deep cleaning",
          "Monthly filter changes",
          "Annual servicing"
        ],
        troubleshooting: [
          "No sound: Check battery",
          "Poor quality: Clean microphones",
          "App issues: Restart app",
          "Charging problems: Clean contacts"
        ],
        colors: [
          { name: "Titanium", hex: "#C0C0C0", image: assets.service_7 },
          { name: "Champagne", hex: "#F7E7CE", image: assets.service_7 },
          { name: "Black", hex: "#2C2C2C", image: assets.service_7 },
          { name: "Brown", hex: "#8B4513", image: assets.service_7 }
        ]
      }
    ]
  }
];

// Helper function to get brand by slug
export const getBrandBySlug = (slug) => {
  return hearingAidBrands.find(brand => brand.brandSlug === slug);
};

// Helper function to get device by slug
export const getDeviceBySlug = (slug) => {
  for (const brand of hearingAidBrands) {
    const device = brand.devices.find(device => device.slug === slug);
    if (device) return { ...device, brand: brand.brandName };
  }
  return null;
};

// Helper function to get all devices
export const getAllDevices = () => {
  const devices = [];
  hearingAidBrands.forEach(brand => {
    brand.devices.forEach(device => {
      devices.push({ ...device, brand: brand.brandName, brandSlug: brand.brandSlug });
    });
  });
  return devices;
};

// Helper function to get devices by category
export const getDevicesByCategory = (category) => {
  return getAllDevices().filter(device => device.category === category);
};

// Helper function to get devices by price range
export const getDevicesByPriceRange = (priceRange) => {
  return getAllDevices().filter(device => device.priceRange === priceRange);
};
