import { SchoolEvent } from '../types';

// Liberian National Holidays and Cultural Events
export interface LiberianHoliday {
  id: string;
  name: string;
  date: string; // MM-DD format for annual events
  description: string;
  culturalSignificance: string;
  educationalActivities: string[];
  isNationalHoliday: boolean;
  category: 'national' | 'cultural' | 'educational' | 'religious' | 'community';
}

export const LIBERIAN_NATIONAL_HOLIDAYS: LiberianHoliday[] = [
  {
    id: 'independence_day',
    name: 'Independence Day',
    date: '07-26',
    description: 'Celebrating Liberia\'s independence from the American Colonization Society in 1847, making Liberia the first African republic.',
    culturalSignificance: 'The most important national holiday, celebrating Liberian sovereignty, freedom, and national identity. A day of patriotic pride and cultural unity.',
    educationalActivities: [
      'Flag raising ceremonies with national anthem',
      'Historical presentations on Liberian independence',
      'Traditional Liberian storytelling sessions',
      'Cultural performances featuring Liberian music and dance',
      'Essay competitions on "What Independence Means to Me"',
      'Community service projects reflecting national unity'
    ],
    isNationalHoliday: true,
    category: 'national'
  },
  {
    id: 'thanksgiving_day',
    name: 'National Thanksgiving Day',
    date: '11-07',
    description: 'A uniquely Liberian holiday established in 1883, celebrating gratitude for the nation\'s blessings and acknowledging God\'s providence.',
    culturalSignificance: 'Reflects Liberian Christian heritage and community values of gratitude, family unity, and spiritual reflection.',
    educationalActivities: [
      'Gratitude reflection sessions and journaling',
      'Community thanksgiving services and prayers',
      'Traditional Liberian feast preparation and sharing',
      'Storytelling about Liberian blessings and achievements',
      'Service learning projects helping community members',
      'Cultural presentations on Liberian traditions of gratitude'
    ],
    isNationalHoliday: true,
    category: 'religious'
  },
  {
    id: 'armed_forces_day',
    name: 'Armed Forces Day',
    date: '02-11',
    description: 'Honoring the Armed Forces of Liberia and recognizing their service to the nation\'s security and peace.',
    culturalSignificance: 'Celebrates national defense, patriotism, and the role of military service in protecting Liberian sovereignty and democracy.',
    educationalActivities: [
      'Presentations on Liberian military history and peacekeeping',
      'Guest speakers from Armed Forces sharing service experiences',
      'Patriotic ceremonies and flag presentations',
      'Discussions on citizenship, duty, and national service',
      'Historical research projects on Liberian defense',
      'Community appreciation events for veterans and service members'
    ],
    isNationalHoliday: true,
    category: 'national'
  },
  {
    id: 'decoration_day',
    name: 'Decoration Day',
    date: '03-12',
    description: 'Memorial day honoring deceased national heroes, leaders, and all Liberians who contributed to the nation\'s development.',
    culturalSignificance: 'A solemn day of remembrance, honoring ancestors and national heroes while reflecting on their contributions to Liberian society.',
    educationalActivities: [
      'Memorial services and moments of silence',
      'Historical presentations on Liberian heroes and leaders',
      'Cemetery visits and grave decoration ceremonies',
      'Biographical research projects on national figures',
      'Reflection essays on legacy and contribution',
      'Community storytelling about local heroes and elders'
    ],
    isNationalHoliday: true,
    category: 'national'
  },
  {
    id: 'unification_day',
    name: 'National Unification Day',
    date: '05-14',
    description: 'Commemorating the unification of Liberia and celebrating the unity of all Liberian people regardless of ethnic or regional background.',
    culturalSignificance: 'Celebrates national unity, ethnic harmony, and the coming together of all Liberian tribes and communities as one nation.',
    educationalActivities: [
      'Unity celebrations featuring all ethnic groups',
      'Cultural exhibitions showcasing diverse Liberian traditions',
      'Inter-tribal friendship and cooperation activities',
      'Presentations on Liberian ethnic diversity and harmony',
      'Community unity projects and collaborative activities',
      'Traditional music and dance from various Liberian cultures'
    ],
    isNationalHoliday: true,
    category: 'national'
  },
  {
    id: 'good_friday',
    name: 'Good Friday',
    date: 'easter-2', // Special handling for Easter-based date
    description: 'Christian holy day commemorating the crucifixion of Jesus Christ, widely observed in Christian-majority Liberia.',
    culturalSignificance: 'Reflects Liberia\'s strong Christian heritage and provides opportunity for spiritual reflection and community worship.',
    educationalActivities: [
      'Religious reflection and prayer services',
      'Community worship and spiritual gatherings',
      'Discussions on faith, sacrifice, and service',
      'Charitable activities and community service',
      'Quiet reflection and meditation periods',
      'Interfaith dialogue and understanding activities'
    ],
    isNationalHoliday: true,
    category: 'religious'
  }
];

export const LIBERIAN_CULTURAL_EVENTS: LiberianHoliday[] = [
  {
    id: 'cultural_heritage_month',
    name: 'Liberian Cultural Heritage Month',
    date: '02-01', // February
    description: 'Month-long celebration of Liberian cultural traditions, arts, crafts, music, and ancestral wisdom.',
    culturalSignificance: 'Preserves and celebrates the rich cultural heritage of Liberia\'s diverse ethnic groups and traditional practices.',
    educationalActivities: [
      'Traditional craft workshops and demonstrations',
      'Storytelling sessions with community elders',
      'Cultural music and dance performances',
      'Traditional cooking and food culture exploration',
      'Art exhibitions featuring Liberian artists',
      'Language preservation activities for local dialects'
    ],
    isNationalHoliday: false,
    category: 'cultural'
  },
  {
    id: 'community_service_week',
    name: 'National Community Service Week',
    date: '03-01', // First week of March
    description: 'Week dedicated to community service, reflecting Liberian values of mutual support and collective responsibility.',
    culturalSignificance: 'Embodies traditional Liberian community values of helping neighbors and working together for common good.',
    educationalActivities: [
      'School and community cleanup projects',
      'Elder care and assistance programs',
      'Environmental conservation activities',
      'Literacy support for community members',
      'Health awareness and wellness programs',
      'Infrastructure improvement volunteer work'
    ],
    isNationalHoliday: false,
    category: 'community'
  },
  {
    id: 'traditional_storytelling_week',
    name: 'Traditional Storytelling Week',
    date: '04-15', // Mid-April
    description: 'Week celebrating Liberian oral traditions, folktales, and the wisdom passed down through generations.',
    culturalSignificance: 'Preserves oral traditions and ancestral wisdom while strengthening intergenerational connections.',
    educationalActivities: [
      'Elder storytelling sessions with moral lessons',
      'Student storytelling competitions',
      'Recording and preserving traditional tales',
      'Dramatic presentations of folktales',
      'Creative writing inspired by traditional stories',
      'Community storytelling circles and gatherings'
    ],
    isNationalHoliday: false,
    category: 'cultural'
  },
  {
    id: 'local_language_appreciation',
    name: 'Local Language Appreciation Day',
    date: '09-15',
    description: 'Celebrating Liberia\'s linguistic diversity and promoting the preservation of indigenous languages.',
    culturalSignificance: 'Honors the linguistic heritage of Liberia\'s 16 indigenous languages and promotes multilingual education.',
    educationalActivities: [
      'Presentations in various Liberian languages',
      'Language learning workshops and exchanges',
      'Cultural performances in indigenous languages',
      'Intergenerational language sharing sessions',
      'Documentation of local language expressions',
      'Multilingual poetry and literature appreciation'
    ],
    isNationalHoliday: false,
    category: 'cultural'
  },
  {
    id: 'harvest_celebration',
    name: 'Traditional Harvest Celebration',
    date: '11-15',
    description: 'Celebrating agricultural traditions and giving thanks for the harvest season.',
    culturalSignificance: 'Connects students to Liberia\'s agricultural heritage and traditional farming practices.',
    educationalActivities: [
      'Agricultural education and farming demonstrations',
      'Traditional food preparation and sharing',
      'Gratitude ceremonies for nature\'s bounty',
      'Environmental stewardship activities',
      'Traditional farming technique presentations',
      'Community garden projects and maintenance'
    ],
    isNationalHoliday: false,
    category: 'cultural'
  }
];

// Academic Term Structure for Liberian Schools
export interface LiberianAcademicTerm {
  termNumber: 1 | 2 | 3;
  name: string;
  startMonth: number;
  endMonth: number;
  description: string;
  keyActivities: string[];
}

export const LIBERIAN_ACADEMIC_TERMS: LiberianAcademicTerm[] = [
  {
    termNumber: 1,
    name: 'First Term',
    startMonth: 9, // September
    endMonth: 12, // December
    description: 'Academic year opening term with foundation building and first assessments',
    keyActivities: [
      'Academic year opening ceremonies',
      'Student orientation and class assignments',
      'First term curriculum introduction',
      'Mid-term examinations (October)',
      'Parent-teacher conferences',
      'First term final examinations (December)'
    ]
  },
  {
    termNumber: 2,
    name: 'Second Term',
    startMonth: 1, // January
    endMonth: 4, // April
    description: 'Continuation term with intensive learning and skill development',
    keyActivities: [
      'Second term curriculum advancement',
      'Skills development workshops',
      'Mid-term assessments (February)',
      'Cultural heritage celebrations',
      'Community service projects',
      'Second term final examinations (April)'
    ]
  },
  {
    termNumber: 3,
    name: 'Third Term',
    startMonth: 5, // May
    endMonth: 7, // July
    description: 'Final term with comprehensive assessments and graduation preparations',
    keyActivities: [
      'Final term intensive review',
      'Comprehensive examinations preparation',
      'Graduation ceremony preparations',
      'Final assessments and evaluations',
      'Academic year completion ceremonies',
      'Summer break preparation and planning'
    ]
  }
];

// Generate school events for a given year
export const generateLiberianSchoolEvents = (year: number): SchoolEvent[] => {
  const events: SchoolEvent[] = [];

  // Add national holidays
  LIBERIAN_NATIONAL_HOLIDAYS.forEach(holiday => {
    if (holiday.date === 'easter-2') {
      // Calculate Good Friday (Easter - 2 days)
      const easter = calculateEaster(year);
      const goodFriday = new Date(easter);
      goodFriday.setDate(easter.getDate() - 2);
      
      events.push({
        id: `${holiday.id}_${year}`,
        title: `🇱🇷 ${holiday.name}`,
        date: goodFriday.toISOString().split('T')[0],
        description: `${holiday.description}\n\n🎓 Educational Activities:\n${holiday.educationalActivities.map(activity => `• ${activity}`).join('\n')}\n\n🇱🇷 Cultural Significance: ${holiday.culturalSignificance}`,
        audience: 'all'
      });
    } else {
      events.push({
        id: `${holiday.id}_${year}`,
        title: `🇱🇷 ${holiday.name}`,
        date: `${year}-${holiday.date}`,
        description: `${holiday.description}\n\n🎓 Educational Activities:\n${holiday.educationalActivities.map(activity => `• ${activity}`).join('\n')}\n\n🇱🇷 Cultural Significance: ${holiday.culturalSignificance}`,
        audience: 'all'
      });
    }
  });

  // Add cultural events
  LIBERIAN_CULTURAL_EVENTS.forEach(event => {
    events.push({
      id: `${event.id}_${year}`,
      title: `🎭 ${event.name}`,
      date: `${year}-${event.date}`,
      description: `${event.description}\n\n🎓 Educational Activities:\n${event.educationalActivities.map(activity => `• ${activity}`).join('\n')}\n\n🇱🇷 Cultural Significance: ${event.culturalSignificance}`,
      audience: 'all'
    });
  });

  return events;
};

// Calculate Easter Sunday for a given year (Western Christianity)
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  return new Date(year, n - 1, p + 1);
};

// Get current academic term based on date
export const getCurrentAcademicTerm = (date: Date = new Date()): LiberianAcademicTerm => {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  if (month >= 9 || month <= 12) {
    return LIBERIAN_ACADEMIC_TERMS[0]; // First Term
  } else if (month >= 1 && month <= 4) {
    return LIBERIAN_ACADEMIC_TERMS[1]; // Second Term
  } else {
    return LIBERIAN_ACADEMIC_TERMS[2]; // Third Term
  }
};

// Check if a date falls within a specific term
export const isDateInTerm = (date: Date, term: LiberianAcademicTerm): boolean => {
  const month = date.getMonth() + 1;
  
  if (term.termNumber === 1) {
    return month >= 9 || month <= 12;
  } else if (term.termNumber === 2) {
    return month >= 1 && month <= 4;
  } else {
    return month >= 5 && month <= 7;
  }
};

// Get term-specific events
export const getTermEvents = (events: SchoolEvent[], term: LiberianAcademicTerm): SchoolEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return isDateInTerm(eventDate, term);
  });
};
