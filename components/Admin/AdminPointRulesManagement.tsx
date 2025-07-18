import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { PointRule, PointRuleCondition, PointRuleTrigger, UserRole } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortableRuleKey = 'name' | 'points' | 'createdAt';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableRuleKey;
  direction: SortDirection;
}

const AdminPointRulesManagement: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  
  // Form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleCondition, setRuleCondition] = useState<PointRuleCondition>('attendance_perfect_week');
  const [rulePoints, setRulePoints] = useState('10');
  const [ruleTrigger, setRuleTrigger] = useState<PointRuleTrigger>('teacher_suggestion');
  const [isActive, setIsActive] = useState(true);
  const [parameters, setParameters] = useState({
    minScore: '',
    daysEarly: '',
    improvementThreshold: '',
    subjectId: '',
    gradeLevel: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sorting and filtering
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [filterActive, setFilterActive] = useState<string>('all');

  if (!context || !context.currentUser || context.currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  const { pointRules, subjects, addPointRule, updatePointRule, deletePointRule } = context;

  // Condition options with descriptions
  const conditionOptions = [
    { value: 'attendance_perfect_week', label: 'Perfect Weekly Attendance', description: 'Student has perfect attendance for a full week' },
    { value: 'assignment_submitted_early', label: 'Early Assignment Submission', description: 'Student submits assignment before due date' },
    { value: 'assignment_high_score', label: 'High Assignment Score', description: 'Student achieves high score on assignment' },
    { value: 'participation_active', label: 'Active Participation', description: 'Student shows active participation in class' },
    { value: 'behavior_excellent', label: 'Excellent Behavior', description: 'Student demonstrates excellent behavior' },
    { value: 'improvement_significant', label: 'Significant Improvement', description: 'Student shows significant improvement in performance' }
  ];

  const openModal = (rule?: PointRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleName(rule.name);
      setRuleDescription(rule.description);
      setRuleCondition(rule.condition);
      setRulePoints(String(rule.points));
      setRuleTrigger(rule.trigger);
      setIsActive(rule.isActive);
      setParameters({
        minScore: rule.parameters?.minScore ? String(rule.parameters.minScore) : '',
        daysEarly: rule.parameters?.daysEarly ? String(rule.parameters.daysEarly) : '',
        improvementThreshold: rule.parameters?.improvementThreshold ? String(rule.parameters.improvementThreshold) : '',
        subjectId: rule.parameters?.subjectId || '',
        gradeLevel: rule.parameters?.gradeLevel ? String(rule.parameters.gradeLevel) : ''
      });
    } else {
      setEditingRule(null);
      setRuleName('');
      setRuleDescription('');
      setRuleCondition('attendance_perfect_week');
      setRulePoints('10');
      setRuleTrigger('teacher_suggestion');
      setIsActive(true);
      setParameters({
        minScore: '',
        daysEarly: '',
        improvementThreshold: '',
        subjectId: '',
        gradeLevel: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!ruleName.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (!ruleDescription.trim()) {
      newErrors.description = 'Rule description is required';
    }

    const points = parseInt(rulePoints);
    if (isNaN(points) || points < 1 || points > 100) {
      newErrors.points = 'Points must be between 1 and 100';
    }

    // Condition-specific validation
    if (ruleCondition === 'assignment_high_score' && parameters.minScore) {
      const minScore = parseInt(parameters.minScore);
      if (isNaN(minScore) || minScore < 0 || minScore > 100) {
        newErrors.minScore = 'Minimum score must be between 0 and 100';
      }
    }

    if (ruleCondition === 'assignment_submitted_early' && parameters.daysEarly) {
      const daysEarly = parseInt(parameters.daysEarly);
      if (isNaN(daysEarly) || daysEarly < 1 || daysEarly > 30) {
        newErrors.daysEarly = 'Days early must be between 1 and 30';
      }
    }

    if (ruleCondition === 'improvement_significant' && parameters.improvementThreshold) {
      const threshold = parseInt(parameters.improvementThreshold);
      if (isNaN(threshold) || threshold < 1 || threshold > 50) {
        newErrors.improvementThreshold = 'Improvement threshold must be between 1 and 50 points';
      }
    }

    if (parameters.gradeLevel) {
      const grade = parseInt(parameters.gradeLevel);
      if (isNaN(grade) || grade < 1 || grade > 12) {
        newErrors.gradeLevel = 'Grade level must be between 1 and 12';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const ruleData = {
        name: ruleName,
        description: ruleDescription,
        condition: ruleCondition,
        points: parseInt(rulePoints),
        trigger: ruleTrigger,
        isActive,
        createdBy: context.currentUser!.uid,
        parameters: {
          ...(parameters.minScore && { minScore: parseInt(parameters.minScore) }),
          ...(parameters.daysEarly && { daysEarly: parseInt(parameters.daysEarly) }),
          ...(parameters.improvementThreshold && { improvementThreshold: parseInt(parameters.improvementThreshold) }),
          ...(parameters.subjectId && { subjectId: parameters.subjectId }),
          ...(parameters.gradeLevel && { gradeLevel: parseInt(parameters.gradeLevel) })
        }
      };

      if (editingRule) {
        await updatePointRule({
          ...editingRule,
          ...ruleData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addPointRule(ruleData);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving point rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rule: PointRule) => {
    if (!confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) return;

    setDeletingRuleId(rule.id);
    try {
      await deletePointRule(rule.id);
    } catch (error) {
      console.error('Error deleting point rule:', error);
    } finally {
      setDeletingRuleId(null);
    }
  };

  const handleSort = (key: SortableRuleKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const sortedAndFilteredRules = useMemo(() => {
    let filtered = [...pointRules];

    // Apply filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(rule => 
        filterActive === 'active' ? rule.isActive : !rule.isActive
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [pointRules, sortConfig, filterActive]);

  const getSortIcon = (key: SortableRuleKey) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const getConditionLabel = (condition: PointRuleCondition) => {
    return conditionOptions.find(opt => opt.value === condition)?.label || condition;
  };

  const renderParameterInputs = () => {
    switch (ruleCondition) {
      case 'assignment_high_score':
        return (
          <div>
            <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Score (%)
            </label>
            <Input
              id="minScore"
              type="number"
              value={parameters.minScore}
              onChange={(e) => setParameters(prev => ({ ...prev, minScore: e.target.value }))}
              placeholder="85"
              min="0"
              max="100"
              error={errors.minScore}
              disabled={isSubmitting}
            />
          </div>
        );
      case 'assignment_submitted_early':
        return (
          <div>
            <label htmlFor="daysEarly" className="block text-sm font-medium text-gray-700 mb-1">
              Days Before Due Date
            </label>
            <Input
              id="daysEarly"
              type="number"
              value={parameters.daysEarly}
              onChange={(e) => setParameters(prev => ({ ...prev, daysEarly: e.target.value }))}
              placeholder="2"
              min="1"
              max="30"
              error={errors.daysEarly}
              disabled={isSubmitting}
            />
          </div>
        );
      case 'improvement_significant':
        return (
          <div>
            <label htmlFor="improvementThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Improvement Threshold (points)
            </label>
            <Input
              id="improvementThreshold"
              type="number"
              value={parameters.improvementThreshold}
              onChange={(e) => setParameters(prev => ({ ...prev, improvementThreshold: e.target.value }))}
              placeholder="10"
              min="1"
              max="50"
              error={errors.improvementThreshold}
              disabled={isSubmitting}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Point Rules Management</h1>
        <p className="text-gray-600">Create and manage automated point awarding rules for students.</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Rules</option>
            <option value="active">Active Rules</option>
            <option value="inactive">Inactive Rules</option>
          </select>
        </div>
        
        <Button onClick={() => openModal()} variant="primary">
          Add New Rule
        </Button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Rule Name {getSortIcon('name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points')}
              >
                Points {getSortIcon('points')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trigger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                    <div className="text-sm text-gray-500">{rule.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getConditionLabel(rule.condition)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rule.points} points
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.trigger === 'automatic' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rule.trigger === 'automatic' ? 'Automatic' : 'Suggestion'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rule.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    onClick={() => openModal(rule)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(rule)}
                    variant="danger"
                    size="sm"
                    loading={deletingRuleId === rule.id}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {sortedAndFilteredRules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {filterActive === 'all' 
                    ? "No point rules found. Create your first rule to get started."
                    : `No ${filterActive} rules found.`
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRule ? 'Edit Point Rule' : 'Add New Point Rule'}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name
            </label>
            <Input
              id="ruleName"
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Perfect Attendance Bonus"
              error={errors.name}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="ruleDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="ruleDescription"
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              placeholder="Describe when this rule should be applied..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="ruleCondition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              id="ruleCondition"
              value={ruleCondition}
              onChange={(e) => setRuleCondition(e.target.value as PointRuleCondition)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={isSubmitting}
            >
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {conditionOptions.find(opt => opt.value === ruleCondition)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rulePoints" className="block text-sm font-medium text-gray-700 mb-1">
                Points to Award
              </label>
              <Input
                id="rulePoints"
                type="number"
                value={rulePoints}
                onChange={(e) => setRulePoints(e.target.value)}
                placeholder="10"
                min="1"
                max="100"
                error={errors.points}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="ruleTrigger" className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type
              </label>
              <select
                id="ruleTrigger"
                value={ruleTrigger}
                onChange={(e) => setRuleTrigger(e.target.value as PointRuleTrigger)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
              >
                <option value="teacher_suggestion">Teacher Suggestion</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>

          {/* Condition-specific parameters */}
          {renderParameterInputs()}

          {/* Optional filters */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Optional Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="subjectFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <select
                  id="subjectFilter"
                  value={parameters.subjectId}
                  onChange={(e) => setParameters(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={isSubmitting}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level (Optional)
                </label>
                <select
                  id="gradeFilter"
                  value={parameters.gradeLevel}
                  onChange={(e) => setParameters(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={isSubmitting}
                >
                  <option value="">All Grades</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
                {errors.gradeLevel && <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Rule is active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={closeModal}
              variant="ghost"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              loading={isSubmitting}
            >
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPointRulesManagement;
