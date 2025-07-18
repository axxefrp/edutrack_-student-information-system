import React from 'react';
import { LIBERIAN_NATIONAL_HOLIDAYS, LIBERIAN_CULTURAL_EVENTS } from '../../utils/liberianCalendarSystem';

const LiberianCulturalShowcase: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 via-white to-blue-600 p-8 rounded-xl shadow-2xl border-4 border-red-600">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-red-700 mb-2">🇱🇷 Liberian Cultural Integration</h2>
        <p className="text-blue-700 text-lg font-medium">Authentic Educational Experience with National Pride</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* National Holidays */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600">
          <h3 className="text-2xl font-semibold text-red-700 mb-4 flex items-center">
            <span className="mr-2">🇱🇷</span>
            National Holidays ({LIBERIAN_NATIONAL_HOLIDAYS.length})
          </h3>
          <div className="space-y-4">
            {LIBERIAN_NATIONAL_HOLIDAYS.slice(0, 3).map(holiday => (
              <div key={holiday.id} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800 mb-2">{holiday.name}</h4>
                <p className="text-red-600 text-sm mb-2">{holiday.description}</p>
                <div className="text-xs text-red-500">
                  <strong>Cultural Significance:</strong> {holiday.culturalSignificance.substring(0, 100)}...
                </div>
              </div>
            ))}
            <div className="text-center">
              <span className="text-red-600 text-sm font-medium">
                + {LIBERIAN_NATIONAL_HOLIDAYS.length - 3} more national holidays with full cultural context
              </span>
            </div>
          </div>
        </div>

        {/* Cultural Events */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
          <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <span className="mr-2">🎭</span>
            Cultural Events ({LIBERIAN_CULTURAL_EVENTS.length})
          </h3>
          <div className="space-y-4">
            {LIBERIAN_CULTURAL_EVENTS.slice(0, 3).map(event => (
              <div key={event.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2">{event.name}</h4>
                <p className="text-blue-600 text-sm mb-2">{event.description}</p>
                <div className="text-xs text-blue-500">
                  <strong>Educational Value:</strong> {event.culturalSignificance.substring(0, 100)}...
                </div>
              </div>
            ))}
            <div className="text-center">
              <span className="text-blue-600 text-sm font-medium">
                + {LIBERIAN_CULTURAL_EVENTS.length - 3} more cultural events with educational activities
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          🎓 Educational Integration Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-700 mb-2">Curriculum Integration</h4>
            <p className="text-gray-600 text-sm">
              Each cultural event includes specific educational activities and learning objectives
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="font-semibold text-gray-700 mb-2">Community Engagement</h4>
            <p className="text-gray-600 text-sm">
              Events designed to strengthen school-community relationships and family involvement
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏛️</div>
            <h4 className="font-semibold text-gray-700 mb-2">Ministry Compliance</h4>
            <p className="text-gray-600 text-sm">
              Full alignment with Ministry of Education cultural integration requirements
            </p>
          </div>
        </div>
      </div>

      {/* Sample Educational Activities */}
      <div className="mt-8 bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
        <h3 className="text-xl font-semibold text-green-800 mb-4">
          🎯 Sample Educational Activities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Independence Day Activities:</h4>
            <ul className="text-green-600 text-sm space-y-1">
              <li>• Flag raising ceremonies with national anthem</li>
              <li>• Historical presentations on Liberian independence</li>
              <li>• Traditional Liberian storytelling sessions</li>
              <li>• Essay competitions on national identity</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-2">Cultural Heritage Activities:</h4>
            <ul className="text-green-600 text-sm space-y-1">
              <li>• Traditional craft workshops and demonstrations</li>
              <li>• Storytelling sessions with community elders</li>
              <li>• Cultural music and dance performances</li>
              <li>• Language preservation activities</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-400">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">
            🌟 Experience Authentic Liberian Education
          </h3>
          <p className="text-yellow-700 mb-4">
            The Enhanced Academic Calendar seamlessly integrates Liberian cultural heritage with modern educational excellence, 
            providing students with a comprehensive educational experience that honors their cultural identity while preparing them for future success.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
              🇱🇷 National Pride
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              🎭 Cultural Heritage
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              🎓 Academic Excellence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiberianCulturalShowcase;
