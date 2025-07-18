import { LiberianGradeScale, LiberianGradeInfo } from '../types';

/**
 * Official Liberian Grading System based on WAEC standards
 * Used in Liberian schools for assessment and university admission
 */
export const LIBERIAN_GRADE_SCALE: Record<LiberianGradeScale, LiberianGradeInfo> = {
  'A1': {
    grade: 'A1',
    description: 'Excellent',
    percentage: '80-100%',
    points: 1,
    isCredit: true
  },
  'A2': {
    grade: 'A2',
    description: 'Very Good',
    percentage: '75-79%',
    points: 2,
    isCredit: true
  },
  'A3': {
    grade: 'A3',
    description: 'Good',
    percentage: '70-74%',
    points: 3,
    isCredit: true
  },
  'B2': {
    grade: 'B2',
    description: 'Good',
    percentage: '65-69%',
    points: 4,
    isCredit: true
  },
  'B3': {
    grade: 'B3',
    description: 'Good',
    percentage: '60-64%',
    points: 5,
    isCredit: true
  },
  'C4': {
    grade: 'C4',
    description: 'Credit',
    percentage: '55-59%',
    points: 6,
    isCredit: true
  },
  'C5': {
    grade: 'C5',
    description: 'Credit',
    percentage: '50-54%',
    points: 7,
    isCredit: true
  },
  'C6': {
    grade: 'C6',
    description: 'Credit',
    percentage: '45-49%',
    points: 8,
    isCredit: true
  },
  'D7': {
    grade: 'D7',
    description: 'Pass',
    percentage: '40-44%',
    points: 9,
    isCredit: false
  },
  'E8': {
    grade: 'E8',
    description: 'Pass',
    percentage: '35-39%',
    points: 10,
    isCredit: false
  },
  'F9': {
    grade: 'F9',
    description: 'Fail',
    percentage: '0-34%',
    points: 11,
    isCredit: false
  }
};

/**
 * Convert percentage score to Liberian grade scale
 */
export function percentageToLiberianGrade(percentage: number): LiberianGradeScale {
  if (percentage >= 80) return 'A1';
  if (percentage >= 75) return 'A2';
  if (percentage >= 70) return 'A3';
  if (percentage >= 65) return 'B2';
  if (percentage >= 60) return 'B3';
  if (percentage >= 55) return 'C4';
  if (percentage >= 50) return 'C5';
  if (percentage >= 45) return 'C6';
  if (percentage >= 40) return 'D7';
  if (percentage >= 35) return 'E8';
  return 'F9';
}

/**
 * Calculate final grade using Liberian assessment method
 * 30% Continuous Assessment + 70% External Examination
 */
export function calculateLiberianFinalGrade(
  continuousAssessment: number,
  externalExamination: number
): { finalScore: number; liberianGrade: LiberianGradeScale; gradeInfo: LiberianGradeInfo } {
  const finalScore = Math.round((continuousAssessment * 0.3) + (externalExamination * 0.7));
  const liberianGrade = percentageToLiberianGrade(finalScore);
  const gradeInfo = LIBERIAN_GRADE_SCALE[liberianGrade];
  
  return { finalScore, liberianGrade, gradeInfo };
}

/**
 * Check if grades meet university admission requirements
 * Minimum: 5 credit passes (A1-C6) including English and Mathematics
 */
export function checkUniversityEligibility(grades: { subject: string; grade: LiberianGradeScale }[]): {
  isEligible: boolean;
  creditPasses: number;
  hasEnglishCredit: boolean;
  hasMathCredit: boolean;
  missingRequirements: string[];
} {
  const creditGrades = grades.filter(g => LIBERIAN_GRADE_SCALE[g.grade].isCredit);
  const englishGrade = grades.find(g => g.subject.toLowerCase().includes('english') || g.subject.toLowerCase().includes('language arts'));
  const mathGrade = grades.find(g => g.subject.toLowerCase().includes('math'));
  
  const hasEnglishCredit = englishGrade ? LIBERIAN_GRADE_SCALE[englishGrade.grade].isCredit : false;
  const hasMathCredit = mathGrade ? LIBERIAN_GRADE_SCALE[mathGrade.grade].isCredit : false;
  
  const missingRequirements: string[] = [];
  
  if (creditGrades.length < 5) {
    missingRequirements.push(`Need ${5 - creditGrades.length} more credit passes`);
  }
  
  if (!hasEnglishCredit) {
    missingRequirements.push('Credit pass in English/Language Arts required');
  }
  
  if (!hasMathCredit) {
    missingRequirements.push('Credit pass in Mathematics required');
  }
  
  const isEligible = creditGrades.length >= 5 && hasEnglishCredit && hasMathCredit;
  
  return {
    isEligible,
    creditPasses: creditGrades.length,
    hasEnglishCredit,
    hasMathCredit,
    missingRequirements
  };
}

/**
 * Calculate aggregate score for university admission
 * Lower aggregate scores are better (best possible is 6 points for 6 A1 grades)
 */
export function calculateAggregateScore(grades: LiberianGradeScale[]): number {
  const bestSixGrades = grades
    .map(grade => LIBERIAN_GRADE_SCALE[grade].points)
    .sort((a, b) => a - b)
    .slice(0, 6);
  
  return bestSixGrades.reduce((sum, points) => sum + points, 0);
}

/**
 * Get division classification based on aggregate score
 * Used for WAEC certificate classification
 */
export function getDivisionClassification(aggregateScore: number, hasEnglishMathCredit: boolean): {
  division: 'Division I' | 'Division II' | 'Division III' | 'No Division';
  description: string;
} {
  if (!hasEnglishMathCredit) {
    return {
      division: 'No Division',
      description: 'Must pass English and Mathematics with credit'
    };
  }
  
  if (aggregateScore <= 24) {
    return {
      division: 'Division I',
      description: 'Excellent performance - eligible for competitive university programs'
    };
  }
  
  if (aggregateScore <= 36) {
    return {
      division: 'Division II',
      description: 'Good performance - eligible for most university programs'
    };
  }
  
  if (aggregateScore <= 48) {
    return {
      division: 'Division III',
      description: 'Satisfactory performance - eligible for university admission'
    };
  }
  
  return {
    division: 'No Division',
    description: 'Does not meet minimum requirements for division classification'
  };
}

/**
 * Liberian academic terms and their typical date ranges
 */
export const LIBERIAN_ACADEMIC_TERMS = {
  1: {
    name: 'First Term',
    startMonth: 'September',
    endMonth: 'December',
    description: 'First term of the academic year'
  },
  2: {
    name: 'Second Term',
    startMonth: 'January',
    endMonth: 'April',
    description: 'Second term of the academic year'
  },
  3: {
    name: 'Third Term',
    startMonth: 'May',
    endMonth: 'July',
    description: 'Final term of the academic year'
  }
};

/**
 * Core subjects required by Liberian Ministry of Education
 */
export const LIBERIAN_CORE_SUBJECTS = [
  'Language Arts (English)',
  'Mathematics',
  'General Science',
  'Social Studies'
];

/**
 * WAEC subjects commonly taken in Liberian schools
 */
export const WAEC_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Geography',
  'History',
  'Literature',
  'Economics',
  'Government',
  'French',
  'Agricultural Science'
];
