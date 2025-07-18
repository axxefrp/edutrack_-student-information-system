import { 
  PointRule, 
  PointRuleSuggestion, 
  Student, 
  Grade, 
  PointTransaction,
  SchoolClass
} from '../types';

export interface RuleEvaluationContext {
  student: Student;
  grades: Grade[];
  pointTransactions: PointTransaction[];
  classes: SchoolClass[];
  teacherId: string;
}

/**
 * Evaluates point rules and generates suggestions for a specific student
 */
export class PointRuleEngine {
  private rules: PointRule[];

  constructor(rules: PointRule[]) {
    this.rules = rules.filter(rule => rule.isActive);
  }

  /**
   * Generate point suggestions for a student based on active rules
   */
  generateSuggestions(context: RuleEvaluationContext): PointRuleSuggestion[] {
    const suggestions: PointRuleSuggestion[] = [];

    for (const rule of this.rules) {
      // Skip if rule has grade level restriction and student doesn't match
      if (rule.parameters?.gradeLevel && rule.parameters.gradeLevel !== context.student.grade) {
        continue;
      }

      const evaluation = this.evaluateRule(rule, context);
      if (evaluation.shouldSuggest) {
        suggestions.push({
          id: `suggestion_${rule.id}_${context.student.id}_${Date.now()}`,
          ruleId: rule.id,
          studentId: context.student.id,
          teacherId: context.teacherId,
          reason: evaluation.reason,
          suggestedPoints: rule.points,
          isApplied: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    return suggestions;
  }

  /**
   * Evaluate a specific rule against student context
   */
  private evaluateRule(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    switch (rule.condition) {
      case 'attendance_perfect_week':
        return this.evaluateAttendancePerfectWeek(rule, context);
      
      case 'assignment_submitted_early':
        return this.evaluateAssignmentSubmittedEarly(rule, context);
      
      case 'assignment_high_score':
        return this.evaluateAssignmentHighScore(rule, context);
      
      case 'participation_active':
        return this.evaluateParticipationActive(rule, context);
      
      case 'behavior_excellent':
        return this.evaluateBehaviorExcellent(rule, context);
      
      case 'improvement_significant':
        return this.evaluateImprovementSignificant(rule, context);
      
      default:
        return { shouldSuggest: false, reason: 'Unknown rule condition' };
    }
  }

  /**
   * Check if student has perfect attendance for the past week
   */
  private evaluateAttendancePerfectWeek(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentAttendance = context.student.attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneWeekAgo;
    });

    // Check if there are at least 5 attendance records (school days) and all are 'present'
    const hasEnoughRecords = recentAttendance.length >= 5;
    const allPresent = recentAttendance.every(record => record.status === 'present');

    if (hasEnoughRecords && allPresent) {
      return {
        shouldSuggest: true,
        reason: `${context.student.name} has maintained perfect attendance for the past week (${recentAttendance.length} days)`
      };
    }

    return { shouldSuggest: false, reason: 'Perfect attendance criteria not met' };
  }

  /**
   * Check if student submitted assignment early
   */
  private evaluateAssignmentSubmittedEarly(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    const daysEarly = rule.parameters?.daysEarly || 1;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find recent assignments that were submitted early
    const earlySubmissions = context.grades.filter(grade => {
      if (!grade.dueDate || !grade.submissionDate) return false;
      
      const dueDate = new Date(grade.dueDate);
      const submissionDate = new Date(grade.submissionDate);
      const daysDifference = Math.floor((dueDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if submitted within the last day and was early by required days
      const submittedRecently = submissionDate >= oneDayAgo;
      const submittedEarly = daysDifference >= daysEarly;
      
      // Apply subject filter if specified
      if (rule.parameters?.subjectId) {
        const studentClass = context.classes.find(cls => 
          cls.studentIds.includes(context.student.id) && 
          cls.subjectIds.includes(rule.parameters!.subjectId!)
        );
        if (!studentClass) return false;
      }

      return submittedRecently && submittedEarly;
    });

    if (earlySubmissions.length > 0) {
      const assignment = earlySubmissions[0];
      return {
        shouldSuggest: true,
        reason: `${context.student.name} submitted "${assignment.subjectOrAssignmentName}" ${daysEarly} days early`
      };
    }

    return { shouldSuggest: false, reason: 'No early submissions found' };
  }

  /**
   * Check if student achieved high score on assignment
   */
  private evaluateAssignmentHighScore(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    const minScore = rule.parameters?.minScore || 85;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find recent high-scoring assignments
    const highScores = context.grades.filter(grade => {
      if (!grade.dateAssigned) return false;
      
      const assignedDate = new Date(grade.dateAssigned);
      const isRecent = assignedDate >= oneDayAgo;
      
      // Parse score (handle both numeric and letter grades)
      let numericScore = 0;
      if (typeof grade.score === 'string') {
        const parsed = parseFloat(grade.score);
        if (!isNaN(parsed)) {
          numericScore = parsed;
        } else {
          // Handle letter grades (basic conversion)
          const letterGrades: Record<string, number> = {
            'A+': 97, 'A': 93, 'A-': 90,
            'B+': 87, 'B': 83, 'B-': 80,
            'C+': 77, 'C': 73, 'C-': 70,
            'D+': 67, 'D': 63, 'D-': 60,
            'F': 50
          };
          numericScore = letterGrades[grade.score] || 0;
        }
      }

      const isHighScore = numericScore >= minScore;

      // Apply subject filter if specified
      if (rule.parameters?.subjectId) {
        const studentClass = context.classes.find(cls => 
          cls.studentIds.includes(context.student.id) && 
          cls.subjectIds.includes(rule.parameters!.subjectId!)
        );
        if (!studentClass) return false;
      }

      return isRecent && isHighScore;
    });

    if (highScores.length > 0) {
      const assignment = highScores[0];
      return {
        shouldSuggest: true,
        reason: `${context.student.name} scored ${assignment.score} on "${assignment.subjectOrAssignmentName}" (above ${minScore}% threshold)`
      };
    }

    return { shouldSuggest: false, reason: 'No high scores found' };
  }

  /**
   * Check for active participation (placeholder - would need more data in real system)
   */
  private evaluateParticipationActive(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    // In a real system, this would check participation metrics
    // For now, we'll use a simple heuristic based on recent activity
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentGrades = context.grades.filter(grade => {
      if (!grade.dateAssigned) return false;
      return new Date(grade.dateAssigned) >= oneWeekAgo;
    });

    const recentPoints = context.pointTransactions.filter(transaction => {
      return new Date(transaction.date) >= oneWeekAgo;
    });

    // Heuristic: Active participation if student has multiple recent grades and point transactions
    if (recentGrades.length >= 2 && recentPoints.length >= 1) {
      return {
        shouldSuggest: true,
        reason: `${context.student.name} has shown active participation with ${recentGrades.length} recent assignments and ${recentPoints.length} point transactions`
      };
    }

    return { shouldSuggest: false, reason: 'Insufficient recent activity for participation assessment' };
  }

  /**
   * Check for excellent behavior (placeholder - would need behavior tracking)
   */
  private evaluateBehaviorExcellent(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    // In a real system, this would check behavior incident reports, positive behavior notes, etc.
    // For now, we'll use attendance and point history as proxies
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentAttendance = context.student.attendance.filter(record => {
      return new Date(record.date) >= oneWeekAgo;
    });

    const recentPositivePoints = context.pointTransactions.filter(transaction => {
      return new Date(transaction.date) >= oneWeekAgo && transaction.points > 0;
    });

    // Heuristic: Excellent behavior if good attendance and positive points
    const goodAttendance = recentAttendance.length >= 3 && 
      recentAttendance.filter(r => r.status === 'present').length / recentAttendance.length >= 0.8;
    
    const hasPositivePoints = recentPositivePoints.length >= 1;

    if (goodAttendance && hasPositivePoints) {
      return {
        shouldSuggest: true,
        reason: `${context.student.name} has demonstrated excellent behavior with good attendance and positive point history`
      };
    }

    return { shouldSuggest: false, reason: 'Behavior criteria not met' };
  }

  /**
   * Check for significant improvement in performance
   */
  private evaluateImprovementSignificant(rule: PointRule, context: RuleEvaluationContext): { shouldSuggest: boolean; reason: string } {
    const improvementThreshold = rule.parameters?.improvementThreshold || 10;
    
    // Compare recent grades to older grades
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const olderGrades = context.grades.filter(grade => {
      if (!grade.dateAssigned) return false;
      const date = new Date(grade.dateAssigned);
      return date < oneWeekAgo && date >= twoWeeksAgo;
    });

    const recentGrades = context.grades.filter(grade => {
      if (!grade.dateAssigned) return false;
      return new Date(grade.dateAssigned) >= oneWeekAgo;
    });

    if (olderGrades.length === 0 || recentGrades.length === 0) {
      return { shouldSuggest: false, reason: 'Insufficient grade history for improvement assessment' };
    }

    // Calculate average scores
    const getNumericScore = (score: string): number => {
      const parsed = parseFloat(score);
      if (!isNaN(parsed)) return parsed;
      
      const letterGrades: Record<string, number> = {
        'A+': 97, 'A': 93, 'A-': 90,
        'B+': 87, 'B': 83, 'B-': 80,
        'C+': 77, 'C': 73, 'C-': 70,
        'D+': 67, 'D': 63, 'D-': 60,
        'F': 50
      };
      return letterGrades[score] || 0;
    };

    const olderAverage = olderGrades.reduce((sum, grade) => sum + getNumericScore(grade.score), 0) / olderGrades.length;
    const recentAverage = recentGrades.reduce((sum, grade) => sum + getNumericScore(grade.score), 0) / recentGrades.length;

    const improvement = recentAverage - olderAverage;

    if (improvement >= improvementThreshold) {
      return {
        shouldSuggest: true,
        reason: `${context.student.name} has improved by ${improvement.toFixed(1)} points (from ${olderAverage.toFixed(1)}% to ${recentAverage.toFixed(1)}%)`
      };
    }

    return { shouldSuggest: false, reason: `Improvement of ${improvement.toFixed(1)} points is below threshold of ${improvementThreshold}` };
  }
}

/**
 * Utility function to create rule engine instance
 */
export const createRuleEngine = (rules: PointRule[]): PointRuleEngine => {
  return new PointRuleEngine(rules);
};

/**
 * Utility function to evaluate rules for multiple students
 */
export const evaluateRulesForStudents = (
  rules: PointRule[],
  students: Student[],
  grades: Grade[],
  pointTransactions: PointTransaction[],
  classes: SchoolClass[],
  teacherId: string
): PointRuleSuggestion[] => {
  const engine = createRuleEngine(rules);
  const allSuggestions: PointRuleSuggestion[] = [];

  for (const student of students) {
    const studentGrades = grades.filter(grade => grade.studentId === student.id);
    const studentPoints = pointTransactions.filter(transaction => transaction.studentId === student.id);
    
    const context: RuleEvaluationContext = {
      student,
      grades: studentGrades,
      pointTransactions: studentPoints,
      classes,
      teacherId
    };

    const suggestions = engine.generateSuggestions(context);
    allSuggestions.push(...suggestions);
  }

  return allSuggestions;
};
