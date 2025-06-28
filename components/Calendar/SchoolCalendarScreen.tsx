
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { SchoolEvent, UserRole } from '../../types';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';

const SchoolCalendarScreen: React.FC = () => {
  const context = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return <div className="p-6 text-gray-700">Loading calendar data...</div>;
  }
  
  const { schoolEvents, currentUser, addSchoolEvent, addNotificationDirectly } = context;

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
  
  const relevantEvents = schoolEvents.filter(event => {
    if (!event.audience || event.audience === 'all') {
      return true;
    }
    if (Array.isArray(event.audience)) {
      return event.audience.includes(currentUser.role);
    }
    return false;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b gap-4">
        <h1 className="text-3xl font-bold text-gray-800">School Event Calendar</h1>
        {currentUser.role === UserRole.ADMIN && (
          <Button onClick={openAddEventModal} variant="primary">
            Add New Event
          </Button>
        )}
      </div>

      {relevantEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 17.25h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-xl text-gray-600">No upcoming school events found.</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for updates.</p>
        </div>
      )}

      {upcomingMonths.map(monthYear => (
        <div key={monthYear} className="mb-10">
          <h2 className="text-2xl font-semibold text-primary-700 mb-6 pb-2 border-b-2 border-primary-200">
            {monthYear}
          </h2>
          <div className="space-y-6">
            {eventsByMonth[monthYear].map(event => (
              <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-secondary-400">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-md font-medium text-secondary-600 mt-1 sm:mt-0">{formatDate(event.date)}</p>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                {event.audience && event.audience !== 'all' && Array.isArray(event.audience) && (
                    <p className="text-xs text-gray-400 mt-3">
                        Relevant for: {event.audience.map(r => r.charAt(0) + r.slice(1).toLowerCase()).join(', ')}
                    </p>
                )}
              </div>
            ))}
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