import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { SchoolEvent, UserRole } from '../../types';
import { 
  LIBERIAN_ACADEMIC_TERMS,
  getCurrentAcademicTerm,
  LiberianAcademicTerm,
  generateLiberianSchoolEvents,
  LIBERIAN_NATIONAL_HOLIDAYS,
  LIBERIAN_CULTURAL_EVENTS
} from '../../utils/liberianCalendarSystem';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';

const LiberianAcademicPlannerScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState<LiberianAcademicTerm>(getCurrentAcademicTerm());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new academic event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventType, setNewEventType] = useState<'academic' | 'cultural' | 'administrative'>('academic');

  if (!context || !context.currentUser) {
    return <div className="p-6 text-gray-700">Loading Academic Planner...</div>;
  }

  const { schoolEvents, currentUser, addSchoolEvent, addNotificationDirectly } = context;

  // Generate comprehensive academic calendar
  const academicCalendar = useMemo(() => {
    const liberianEvents = generateLiberianSchoolEvents(selectedYear);
    const schoolAcademicEvents = schoolEvents.filter(event => 
      new Date(event.date).getFullYear() === selectedYear
    );
    
    return [...liberianEvents, ...schoolAcademicEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [selectedYear, schoolEvents]);

  // Calculate term statistics
  const termStatistics = useMemo(() => {
    return LIBERIAN_ACADEMIC_TERMS.map(term => {
      const termEvents = academicCalendar.filter(event => {
        const eventDate = new Date(event.date);
        const month = eventDate.getMonth() + 1;
        
        if (term.termNumber === 1) {
          return month >= 9 || month <= 12;
        } else if (term.termNumber === 2) {
          return month >= 1 && month <= 4;
        } else {
          return month >= 5 && month <= 7;
        }
      });

      const nationalHolidays = termEvents.filter(e => e.title.includes('🇱🇷')).length;
      const culturalEvents = termEvents.filter(e => e.title.includes('🎭')).length;
      const academicEvents = termEvents.filter(e => !e.title.includes('🇱🇷') && !e.title.includes('🎭')).length;

      return {
        term,
        totalEvents: termEvents.length,
        nationalHolidays,
        culturalEvents,
        academicEvents,
        events: termEvents
      };
    });
  }, [academicCalendar]);

  const handleAddAcademicEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate || !newEventDescription.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const eventPrefix = newEventType === 'cultural' ? '🎭' : newEventType === 'academic' ? '🎓' : '📋';
      
      addSchoolEvent({
        title: `${eventPrefix} ${newEventTitle}`,
        date: newEventDate,
        description: newEventDescription,
        audience: 'all'
      });

      setIsSubmitting(false);
      addNotificationDirectly('Academic Event Added', `"${newEventTitle}" has been added to the academic calendar.`, 'success');
      setIsEventModalOpen(false);
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setNewEventTitle('');
    setNewEventDate(new Date().toISOString().split('T')[0]);
    setNewEventDescription('');
    setNewEventType('academic');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-white to-blue-600 text-gray-800 p-6 rounded-lg mb-6 border-2 border-red-600">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-700">🇱🇷 Liberian Academic Calendar Planner</h1>
            <p className="text-blue-700 mt-1 font-medium">Comprehensive academic year planning with cultural integration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                  <option key={year} value={year}>{year}/{year + 1}</option>
                ))}
              </select>
            </div>
            {currentUser.role === UserRole.ADMIN && (
              <Button onClick={() => setIsEventModalOpen(true)} variant="primary">
                Add Academic Event
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Term Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {termStatistics.map(stat => (
          <div 
            key={stat.term.termNumber}
            className={`bg-white p-6 rounded-xl shadow-lg border-l-4 cursor-pointer transition-all hover:shadow-xl ${
              selectedTerm.termNumber === stat.term.termNumber 
                ? 'border-red-600 bg-red-50' 
                : 'border-gray-300'
            }`}
            onClick={() => setSelectedTerm(stat.term)}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {stat.term.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{stat.term.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stat.nationalHolidays}</p>
                <p className="text-gray-500">National Holidays</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stat.culturalEvents}</p>
                <p className="text-gray-500">Cultural Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stat.academicEvents}</p>
                <p className="text-gray-500">Academic Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stat.totalEvents}</p>
                <p className="text-gray-500">Total Events</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Key Activities:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {stat.term.keyActivities.slice(0, 3).map((activity, index) => (
                  <li key={index}>• {activity}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Term Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-semibold text-red-700 mb-4 flex items-center">
          <span className="mr-2">📅</span>
          {selectedTerm.name} - Detailed Calendar
        </h3>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-800 mb-2">Term Overview</h4>
          <p className="text-blue-700 text-sm mb-3">{selectedTerm.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Duration</h5>
              <p className="text-blue-700 text-sm">
                {selectedTerm.startMonth <= 7 ? 'May - July' : 
                 selectedTerm.startMonth <= 4 ? 'January - April' : 
                 'September - December'}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Key Focus</h5>
              <p className="text-blue-700 text-sm">
                {selectedTerm.termNumber === 1 ? 'Foundation Building & Assessment' :
                 selectedTerm.termNumber === 2 ? 'Skill Development & Cultural Integration' :
                 'Comprehensive Assessment & Graduation Preparation'}
              </p>
            </div>
          </div>
        </div>

        {/* Term Events */}
        <div className="space-y-4">
          {termStatistics.find(s => s.term.termNumber === selectedTerm.termNumber)?.events.map(event => {
            const isNationalHoliday = event.title.includes('🇱🇷');
            const isCulturalEvent = event.title.includes('🎭');
            const isAcademicEvent = event.title.includes('🎓');
            
            return (
              <div 
                key={event.id}
                className={`p-4 rounded-lg border-l-4 ${
                  isNationalHoliday ? 'bg-red-50 border-red-400' :
                  isCulturalEvent ? 'bg-blue-50 border-blue-400' :
                  isAcademicEvent ? 'bg-green-50 border-green-400' :
                  'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${
                    isNationalHoliday ? 'text-red-700' :
                    isCulturalEvent ? 'text-blue-700' :
                    isAcademicEvent ? 'text-green-700' :
                    'text-gray-700'
                  }`}>
                    {event.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isNationalHoliday ? 'bg-red-100 text-red-800' :
                    isCulturalEvent ? 'bg-blue-100 text-blue-800' :
                    isAcademicEvent ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className={`text-sm ${
                  isNationalHoliday ? 'text-red-600' :
                  isCulturalEvent ? 'text-blue-600' :
                  isAcademicEvent ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {event.description.split('\n\n')[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cultural Integration Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
          <span className="mr-2">🎭</span>
          Cultural Integration Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-700 mb-3">🇱🇷 National Holidays ({LIBERIAN_NATIONAL_HOLIDAYS.length})</h4>
            <div className="space-y-2">
              {LIBERIAN_NATIONAL_HOLIDAYS.map(holiday => (
                <div key={holiday.id} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <h5 className="font-medium text-red-800">{holiday.name}</h5>
                  <p className="text-red-600 text-sm">{holiday.date} - {holiday.description.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">🎭 Cultural Events ({LIBERIAN_CULTURAL_EVENTS.length})</h4>
            <div className="space-y-2">
              {LIBERIAN_CULTURAL_EVENTS.map(event => (
                <div key={event.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h5 className="font-medium text-blue-800">{event.name}</h5>
                  <p className="text-blue-600 text-sm">{event.date} - {event.description.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Academic Event Modal */}
      {isEventModalOpen && (
        <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Add Academic Event">
          <form onSubmit={handleAddAcademicEvent} className="space-y-4">
            <Input
              label="Event Title"
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g., Mid-Term Examinations"
              required
              disabled={isSubmitting}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as 'academic' | 'cultural' | 'administrative')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                disabled={isSubmitting}
              >
                <option value="academic">🎓 Academic Event</option>
                <option value="cultural">🎭 Cultural Event</option>
                <option value="administrative">📋 Administrative Event</option>
              </select>
            </div>

            <Input
              label="Event Date"
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                rows={4}
                placeholder="Detailed description of the academic event..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                type="button" 
                onClick={() => setIsEventModalOpen(false)} 
                variant="ghost" 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Add Academic Event
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LiberianAcademicPlannerScreen;
