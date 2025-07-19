
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolEvent, UserRole } from '../../types';
import {
  generateLiberianSchoolEvents,
  getCurrentAcademicTerm,
  getTermEvents,
  LIBERIAN_ACADEMIC_TERMS,
  LiberianAcademicTerm
} from '../../utils/liberianCalendarSystem';
import {
  LiberianHeader,
  LiberianCard,
  LiberianButton,
  LiberianTabs,
  LiberianEmptyState,
  LiberianLoading
} from '../Shared/LiberianDesignSystem';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';

const SchoolCalendarScreen: React.FC = () => {
  const context = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<LiberianAcademicTerm | 'all'>(getCurrentAcademicTerm());
  const [viewMode, setViewMode] = useState<'calendar' | 'cultural' | 'academic'>('calendar');

  // Form state for new event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventIsAudienceAll, setNewEventIsAudienceAll] = useState(true);
  const [newEventSelectedRoles, setNewEventSelectedRoles] = useState<UserRole[]>([]);

  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');


  if (!context || !context.currentUser) {
    return <LiberianLoading text="Loading Liberian academic calendar..." />;
  }

  const { schoolEvents, currentUser, addSchoolEvent, addNotificationDirectly } = context;

  // Generate Liberian cultural events for current and next year
  const liberianEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      ...generateLiberianSchoolEvents(currentYear),
      ...generateLiberianSchoolEvents(currentYear + 1)
    ];
  }, []);

  // Combine school events with Liberian cultural events
  const allEvents = useMemo(() => {
    return [...schoolEvents, ...liberianEvents];
  }, [schoolEvents, liberianEvents]);

  // Get current academic term info
  const currentTerm = getCurrentAcademicTerm();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', 
    });
  };

  const getMonthYear = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
  };
  
  // Filter events based on user role and selected term
  const relevantEvents = useMemo(() => {
    let filtered = allEvents.filter(event => {
      if (!event.audience || event.audience === 'all') {
        return true;
      }
      if (Array.isArray(event.audience)) {
        return event.audience.includes(currentUser.role);
      }
      return false;
    });

    // Filter by selected term if not 'all'
    if (selectedTerm !== 'all') {
      filtered = getTermEvents(filtered, selectedTerm);
    }

    return filtered.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, currentUser.role, selectedTerm]);


  const eventsByMonth: Record<string, SchoolEvent[]> = relevantEvents.reduce((acc, event) => {
    const monthYear = getMonthYear(event.date);
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {} as Record<string, SchoolEvent[]>);

  const upcomingMonths = Object.keys(eventsByMonth).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

  const resetFormAndErrors = () => {
    setNewEventTitle('');
    setNewEventDate(new Date().toISOString().split('T')[0]);
    setNewEventDescription('');
    setNewEventIsAudienceAll(true);
    setNewEventSelectedRoles([]);
    setTitleError('');
    setDateError('');
    setDescriptionError('');
  };

  const openAddEventModal = () => {
    resetFormAndErrors();
    setIsModalOpen(true);
  };

  const closeAddEventModal = () => {
    setIsModalOpen(false);
    resetFormAndErrors();
  };

  const validateEventForm = (): boolean => {
    let isValid = true;
    setTitleError('');
    setDateError('');
    setDescriptionError('');

    if (!newEventTitle.trim()) {
      setTitleError('Event title is required.');
      isValid = false;
    }
    if (!newEventDate) {
      setDateError('Event date is required.');
      isValid = false;
    }
    if (!newEventDescription.trim()) {
      setDescriptionError('Event description is required.');
      isValid = false;
    }
    if (!newEventIsAudienceAll && newEventSelectedRoles.length === 0) {
        // Simple alert for now, could be an error message below checkboxes
        alert("Please select an audience or choose 'All Users'.");
        isValid = false;
    }
    return isValid;
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEventForm()) {
      return;
    }
    setIsSubmitting(true);

    const audienceForEvent: UserRole[] | 'all' = newEventIsAudienceAll ? 'all' : newEventSelectedRoles;

    setTimeout(() => {
      addSchoolEvent({
        title: newEventTitle,
        date: newEventDate,
        description: newEventDescription,
        audience: audienceForEvent,
      });
      setIsSubmitting(false);
      addNotificationDirectly('Event Added', `"${newEventTitle}" has been added to the calendar.`, 'success');
      closeAddEventModal();
    }, 1000); // Simulate API call
  };

  const handleAudienceRoleChange = (role: UserRole) => {
    setNewEventSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
    if (newEventIsAudienceAll) setNewEventIsAudienceAll(false); // Uncheck "All" if a specific role is changed
  };

  const handleAudienceAllChange = (isChecked: boolean) => {
    setNewEventIsAudienceAll(isChecked);
    if (isChecked) {
      setNewEventSelectedRoles([]); // Clear specific roles if "All" is checked
    }
  };


  return (
    <div className="container mx-auto p-4">
      {/* Liberian Cultural Header */}
      <LiberianHeader
        title="🇱🇷 Liberian School Calendar"
        subtitle={`Current Term: ${currentTerm.name} (${currentTerm.startMonth <= 7 ? 'May-July' : currentTerm.startMonth <= 4 ? 'January-April' : 'September-December'})`}
      >
        {currentUser.role === UserRole.ADMIN && (
          <LiberianButton onClick={openAddEventModal} variant="primary">
            Add School Event
          </LiberianButton>
        )}
      </LiberianHeader>

      {/* Navigation and Filters */}
      <LiberianTabs
        tabs={[
          { key: 'calendar', label: 'All Events', icon: '📅' },
          { key: 'cultural', label: 'Cultural Events', icon: '🎭' },
          { key: 'academic', label: 'Academic Calendar', icon: '🎓' }
        ]}
        activeTab={viewMode}
        onTabChange={(tab) => setViewMode(tab as any)}
      />

      <div className="bg-white rounded-lg shadow mb-6">

        {/* Term Filter */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Academic Term:</span>
            <select
              value={selectedTerm === 'all' ? 'all' : selectedTerm.termNumber}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setSelectedTerm('all');
                } else {
                  const termNum = parseInt(e.target.value) as 1 | 2 | 3;
                  setSelectedTerm(LIBERIAN_ACADEMIC_TERMS.find(t => t.termNumber === termNum)!);
                }
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Terms</option>
              {LIBERIAN_ACADEMIC_TERMS.map(term => (
                <option key={term.termNumber} value={term.termNumber}>
                  {term.name} ({term.startMonth <= 7 ? 'May-Jul' : term.startMonth <= 4 ? 'Jan-Apr' : 'Sep-Dec'})
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {relevantEvents.length} events
          </div>
        </div>
      </div>

      {/* Events Display */}
      {relevantEvents.length === 0 && (
        <LiberianEmptyState
          title="No Events Found"
          description="No events found for the selected term. Try selecting a different term or check back later for updates."
          icon="📅"
        />
      )}

      {upcomingMonths.map(monthYear => (
        <div key={monthYear} className="mb-10">
          <h2 className="text-2xl font-semibold text-red-700 mb-6 pb-2 border-b-2 border-red-200 flex items-center">
            <span className="mr-2">📅</span>
            {monthYear}
          </h2>
          <div className="space-y-6">
            {eventsByMonth[monthYear].map(event => {
              const isLiberianEvent = event.title.includes('🇱🇷') || event.title.includes('🎭');
              const isCulturalEvent = event.title.includes('🎭');
              const isNationalHoliday = event.title.includes('🇱🇷');

              return (
                <LiberianCard
                  key={event.id}
                  type={
                    isNationalHoliday ? 'national-holiday' :
                    isCulturalEvent ? 'cultural-event' :
                    'academic-event'
                  }
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                    <h3 className={`text-xl font-semibold ${
                      isNationalHoliday ? 'text-red-700' :
                      isCulturalEvent ? 'text-blue-700' :
                      'text-gray-800'
                    }`}>
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      <p className={`text-md font-medium ${
                        isNationalHoliday ? 'text-red-600' :
                        isCulturalEvent ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {formatDate(event.date)}
                      </p>
                      {isLiberianEvent && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isNationalHoliday ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isNationalHoliday ? 'National Holiday' : 'Cultural Event'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {event.description.split('\n\n').map((section, index) => (
                      <div key={index} className="mb-3">
                        {section.includes('🎓 Educational Activities:') ? (
                          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-semibold text-green-800 mb-2">🎓 Educational Activities</h4>
                            <div className="text-green-700 text-sm">
                              {section.replace('🎓 Educational Activities:', '').trim()}
                            </div>
                          </div>
                        ) : section.includes('🇱🇷 Cultural Significance:') ? (
                          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-semibold text-blue-800 mb-2">🇱🇷 Cultural Significance</h4>
                            <div className="text-blue-700 text-sm">
                              {section.replace('🇱🇷 Cultural Significance:', '').trim()}
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{section}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {event.audience && event.audience !== 'all' && Array.isArray(event.audience) && (
                    <p className="text-xs text-gray-400 mt-3">
                      Relevant for: {event.audience.map(r => r.charAt(0) + r.slice(1).toLowerCase()).join(', ')}
                    </p>
                  )}
                </LiberianCard>
              );
            })}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeAddEventModal} title="Add New School Event">
          <form onSubmit={handleAddEventSubmit} className="space-y-4">
            <Input
              label="Event Title"
              type="text"
              value={newEventTitle}
              onChange={(e) => { setNewEventTitle(e.target.value); if(titleError) setTitleError(''); }}
              placeholder="e.g., Annual Sports Day"
              required
              disabled={isSubmitting}
              error={titleError}
            />
            <Input
              label="Event Date"
              type="date"
              value={newEventDate}
              onChange={(e) => { setNewEventDate(e.target.value); if(dateError) setDateError(''); }}
              required
              disabled={isSubmitting}
              error={dateError}
            />
            <div>
              <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="event-description"
                value={newEventDescription}
                onChange={(e) => { setNewEventDescription(e.target.value); if(descriptionError) setDescriptionError(''); }}
                rows={4}
                placeholder="Detailed information about the event..."
                className={`mt-1 block w-full px-3 py-2 border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                required
                disabled={isSubmitting}
              />
              {descriptionError && <p className="mt-1 text-xs text-red-600">{descriptionError}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventIsAudienceAll}
                    onChange={(e) => handleAudienceAllChange(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700">All Users</span>
                </label>
                <div className={`grid grid-cols-2 gap-2 pl-6 ${newEventIsAudienceAll ? 'opacity-50' : ''}`}>
                  {Object.values(UserRole).map(role => (
                    <label key={role} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={role}
                        checked={newEventSelectedRoles.includes(role)}
                        onChange={() => handleAudienceRoleChange(role)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={isSubmitting || newEventIsAudienceAll}
                      />
                      <span className="text-sm text-gray-700">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <Button type="button" onClick={closeAddEventModal} variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                Add Event
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SchoolCalendarScreen;