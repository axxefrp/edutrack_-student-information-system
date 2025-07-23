import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { UserRole } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';
// import { ThemeSelector } from '../Shared/ThemeToggle';

// Tab types for settings navigation
type SettingsTab = 'profile' | 'security' | 'preferences' | 'system';

const SettingsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!context || !context.currentUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  const { currentUser } = context;

  // Define available tabs based on user role
  const getAvailableTabs = (): { id: SettingsTab; label: string; icon: string }[] => {
    const baseTabs = [
      { id: 'profile' as SettingsTab, label: 'Profile', icon: '👤' },
      { id: 'security' as SettingsTab, label: 'Security', icon: '🔒' },
    ];

    if (currentUser.role === UserRole.ADMIN) {
      baseTabs.push({ id: 'system' as SettingsTab, label: 'System', icon: '⚙️' });
    } else {
      baseTabs.push({ id: 'preferences' as SettingsTab, label: 'Preferences', icon: '🎛️' });
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'system' && currentUser.role === UserRole.ADMIN && <SystemSettings />}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings: React.FC = () => {
  const context = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    grade: '',
    subjectIds: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!context || !context.currentUser) return null;

  const { currentUser, students, teachers, subjects, updateStudent, updateTeacher, addNotificationDirectly } = context;

  // Get role-specific profile data
  const getProfileData = () => {
    if (currentUser.role === UserRole.STUDENT && currentUser.studentId) {
      return students.find(s => s.id === currentUser.studentId);
    } else if (currentUser.role === UserRole.TEACHER && currentUser.teacherId) {
      return teachers.find(t => t.id === currentUser.teacherId);
    }
    return null;
  };

  const profileData = getProfileData();

  const openEditModal = () => {
    if (profileData) {
      setEditForm({
        name: profileData.name,
        email: currentUser.email,
        grade: currentUser.role === UserRole.STUDENT && 'grade' in profileData ? String(profileData.grade) : '',
        subjectIds: currentUser.role === UserRole.TEACHER && 'subjectIds' in profileData ? profileData.subjectIds : []
      });
    }
    setErrors({});
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', grade: '', subjectIds: [] });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (currentUser.role === UserRole.STUDENT && !editForm.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }

    if (currentUser.role === UserRole.TEACHER && subjects.length > 0 && editForm.subjectIds.length === 0) {
      newErrors.subjects = 'At least one subject must be selected when subjects are available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (currentUser.role === UserRole.STUDENT && currentUser.studentId) {
        const student = students.find(s => s.id === currentUser.studentId);
        if (student) {
          await updateStudent({
            ...student,
            name: editForm.name,
            grade: parseInt(editForm.grade)
          });
          addNotificationDirectly('Profile Updated', 'Your profile has been updated successfully.', 'success');
        }
      } else if (currentUser.role === UserRole.TEACHER && currentUser.teacherId) {
        const teacher = teachers.find(t => t.id === currentUser.teacherId);
        if (teacher) {
          await updateTeacher({
            ...teacher,
            name: editForm.name,
            subjectIds: editForm.subjectIds
          });
          addNotificationDirectly('Profile Updated', 'Your profile has been updated successfully.', 'success');
        }
      }
      closeEditModal();
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotificationDirectly('Update Failed', 'Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setEditForm(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
        
        {/* Basic User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {currentUser.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {currentUser.username}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {currentUser.role}
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {/* Teacher Subject Warning */}
        {currentUser.role === UserRole.TEACHER && currentUser.teacherId && (
          (() => {
            const teacher = teachers.find(t => t.id === currentUser.teacherId);
            return teacher && (!teacher.subjectIds || teacher.subjectIds.length === 0) && subjects.length > 0 ? (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <span className="text-yellow-600 mr-3 mt-0.5">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">🇱🇷 Subject Assignment Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      You haven't selected your teaching subjects yet. In the Liberian school system, teachers must specify which subjects they teach.
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      📖 Select Your Subjects
                    </button>
                  </div>
                </div>
              </div>
            ) : null;
          })()
        )}

        {profileData && (
          <div className="border-t pt-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              {currentUser.role === UserRole.STUDENT ? 'Student' : 'Teacher'} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {profileData.name}
                </div>
              </div>
              {currentUser.role === UserRole.STUDENT && 'grade' in profileData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    Grade {profileData.grade}
                  </div>
                </div>
              )}
              {currentUser.role === UserRole.STUDENT && 'points' in profileData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {profileData.points} points
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={openEditModal}
            variant="primary"
            disabled={isLoading}
          >
            Edit Profile
          </Button>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditing}
          onClose={closeEditModal}
          title="Edit Profile"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                id="edit-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                error={errors.name}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {editForm.email}
                <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
              </div>
            </div>

            {currentUser.role === UserRole.STUDENT && (
              <div>
                <label htmlFor="edit-grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <select
                  id="edit-grade"
                  value={editForm.grade}
                  onChange={(e) => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoading}
                >
                  <option value="">Select Grade</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
                {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
              </div>
            )}

            {currentUser.role === UserRole.TEACHER && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📖 Teaching Subjects
                  <span className="text-xs text-gray-500 ml-2">
                    ({editForm.subjectIds.length} selected)
                  </span>
                </label>
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-xs text-blue-800">
                    <strong>🇱🇷 Liberian School System:</strong> Select all subjects you teach across different classes.
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
                  {subjects.length > 0 ? subjects.map(subject => (
                    <label
                      key={subject.id}
                      className={`flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md border transition-colors cursor-pointer ${
                        editForm.subjectIds.includes(subject.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.subjectIds.includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                        disabled={isLoading}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                        {subject.description && (
                          <div className="text-xs text-gray-500 mt-1">{subject.description}</div>
                        )}
                      </div>
                      {editForm.subjectIds.includes(subject.id) && (
                        <span className="text-green-600 text-sm">✓</span>
                      )}
                    </label>
                  )) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">📚</div>
                      <p className="text-sm text-gray-500 font-medium">No subjects available</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Contact your administrator to add subjects
                      </p>
                    </div>
                  )}
                </div>
                {editForm.subjectIds.length > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700">
                      ✅ Selected subjects: {editForm.subjectIds.map(id => {
                        const subject = subjects.find(s => s.id === id);
                        return subject?.name;
                      }).filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {errors.subjects && <p className="mt-1 text-sm text-red-600">⚠️ {errors.subjects}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={closeEditModal}
                variant="ghost"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                variant="primary"
                loading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
  const context = useContext(AppContext);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!context) return null;
  const { addNotificationDirectly } = context;

  const openPasswordModal = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setIsChangingPassword(true);
  };

  const closePasswordModal = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      // Simulate password change process
      // In a real implementation, this would integrate with your authentication system
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // For demo purposes, we'll just validate the current password format
      if (passwordForm.currentPassword.length < 6) {
        throw new Error('Current password must be at least 6 characters');
      }

      addNotificationDirectly('Password Changed', 'Your password has been updated successfully.', 'success');
      closePasswordModal();
    } catch (error: any) {
      console.error('Error changing password:', error);

      if (error.code === 'auth/wrong-password') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.code === 'auth/weak-password') {
        setPasswordErrors({ newPassword: 'Password is too weak' });
      } else {
        addNotificationDirectly('Password Change Failed', 'Failed to change password. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
        <p className="text-gray-600 mb-6">Manage your account security and password settings.</p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">Password</h3>
          <p className="text-gray-600 mb-4">Keep your account secure by using a strong password.</p>

          <Button
            onClick={openPasswordModal}
            variant="primary"
          >
            Change Password
          </Button>
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={isChangingPassword}
          onClose={closePasswordModal}
          title="Change Password"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                error={passwordErrors.currentPassword}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter your new password"
                error={passwordErrors.newPassword}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                error={passwordErrors.confirmPassword}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={closePasswordModal}
                variant="ghost"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                variant="primary"
                loading={isLoading}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Preferences Settings Component
const PreferencesSettings: React.FC = () => {
  const context = useContext(AppContext);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en'
  });

  if (!context || !context.currentUser) return null;
  const { currentUser } = context;

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In a real implementation, this would save to the backend
    console.log('Preference updated:', key, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>
        <p className="text-gray-600 mb-6">Customize your application experience.</p>

        {/* Notification Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Receive push notifications in browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Preferences */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Theme switching coming soon</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled
              >
                <option value="en">English</option>
                <option value="es">Spanish (Coming Soon)</option>
                <option value="fr">French (Coming Soon)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Additional languages coming soon</p>
            </div>
          </div>
        </div>

        {/* Role-specific Preferences */}
        {currentUser.role === UserRole.TEACHER && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">Teacher Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-save Grades</label>
                  <p className="text-xs text-gray-500">Automatically save grades as you type</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer opacity-50">
                  <input type="checkbox" disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {currentUser.role === UserRole.STUDENT && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">Student Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Assignment Reminders</label>
                  <p className="text-xs text-gray-500">Get reminders for upcoming assignments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer opacity-50">
                  <input type="checkbox" disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// System Settings Component (Admin only)
const SystemSettings: React.FC = () => {
  const context = useContext(AppContext);
  const [systemSettings, setSystemSettings] = useState({
    schoolName: 'EduTrack School',
    academicYear: '2024-2025',
    allowSelfRegistration: true,
    requireEmailVerification: false,
    maxPointsPerDay: 100,
    gradeScale: 'A-F'
  });

  if (!context) return null;

  const handleSystemSettingChange = (key: string, value: boolean | string | number) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    // In a real implementation, this would save to the backend
    console.log('System setting updated:', key, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h2>
        <p className="text-gray-600 mb-6">Configure system-wide settings and preferences.</p>

        {/* School Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">School Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <Input
                type="text"
                value={systemSettings.schoolName}
                onChange={(e) => handleSystemSettingChange('schoolName', e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <Input
                type="text"
                value={systemSettings.academicYear}
                onChange={(e) => handleSystemSettingChange('academicYear', e.target.value)}
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">Registration Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Allow Self Registration</label>
                <p className="text-xs text-gray-500">Allow users to register new accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.allowSelfRegistration}
                  onChange={(e) => handleSystemSettingChange('allowSelfRegistration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                <p className="text-xs text-gray-500">Users must verify email before accessing system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={systemSettings.requireEmailVerification}
                  onChange={(e) => handleSystemSettingChange('requireEmailVerification', e.target.checked)}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Grading Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">Grading & Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Points Per Day</label>
              <Input
                type="number"
                value={systemSettings.maxPointsPerDay}
                onChange={(e) => handleSystemSettingChange('maxPointsPerDay', parseInt(e.target.value))}
                placeholder="100"
                min="1"
                max="1000"
              />
              <p className="mt-1 text-xs text-gray-500">Maximum points a student can earn per day</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Scale</label>
              <select
                value={systemSettings.gradeScale}
                onChange={(e) => handleSystemSettingChange('gradeScale', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="A-F">A-F Scale</option>
                <option value="1-10">1-10 Scale</option>
                <option value="percentage">Percentage (0-100)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => console.log('Save system settings:', systemSettings)}
            variant="primary"
          >
            Save System Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
