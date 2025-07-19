import React from 'react';
import { LIBERIAN_NATIONAL_HOLIDAYS, LIBERIAN_CULTURAL_EVENTS } from '../../utils/liberianCalendarSystem';
import {
  LiberianHeader,
  LiberianCard,
  LiberianButton,
  LiberianMetricCard,
  WAECGradeBadge,
  MoEIndicator,
  LiberianStatus,
  LiberianProgressBar,
  LiberianAlert
} from '../Shared/LiberianDesignSystem';

const LiberianCulturalShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Liberian Cultural Header */}
      <LiberianHeader
        title="🇱🇷 Liberian Cultural Design System"
        subtitle="Authentic Educational Experience with National Pride and Cultural Heritage"
      >
        <MoEIndicator text="Culturally Authentic" status="compliant" />
      </LiberianHeader>

      {/* Design System Components Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <LiberianMetricCard
          title="National Holidays"
          value={LIBERIAN_NATIONAL_HOLIDAYS.length}
          color="red"
          icon="🇱🇷"
          subtitle="Official government holidays with cultural context"
        />
        <LiberianMetricCard
          title="Cultural Events"
          value={LIBERIAN_CULTURAL_EVENTS.length}
          color="blue"
          icon="🎭"
          subtitle="Traditional celebrations and heritage activities"
        />
        <LiberianMetricCard
          title="Educational Activities"
          value={LIBERIAN_NATIONAL_HOLIDAYS.reduce((sum, h) => sum + h.educationalActivities.length, 0)}
          color="green"
          icon="🎓"
          subtitle="Curriculum-integrated learning opportunities"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* National Holidays */}
        <LiberianCard type="national-holiday">
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
        </LiberianCard>

        {/* Cultural Events */}
        <LiberianCard type="cultural-event">
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
        </LiberianCard>
      </div>

      {/* WAEC Grade Badges Showcase */}
      <LiberianCard type="academic-event">
        <h3 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
          <span className="mr-2">🎓</span>
          WAEC Grade System Integration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <WAECGradeBadge grade="A1" showDescription />
          <WAECGradeBadge grade="B2" showDescription />
          <WAECGradeBadge grade="C4" showDescription />
          <WAECGradeBadge grade="F9" showDescription />
        </div>
        <p className="text-green-600 text-sm">
          Authentic Liberian WAEC grading system with credit/pass/fail classifications and university eligibility tracking.
        </p>
      </LiberianCard>

      {/* Status Indicators Showcase */}
      <LiberianCard>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Performance Status Indicators
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <LiberianStatus status="excellent" text="Excellent Performance" />
          <LiberianStatus status="good" text="Good Progress" />
          <LiberianStatus status="needs-improvement" text="Needs Improvement" />
          <LiberianStatus status="critical" text="Critical Attention" />
        </div>
        <p className="text-gray-600 text-sm">
          Color-coded status indicators using Liberian flag colors for immediate visual recognition.
        </p>
      </LiberianCard>

      {/* Progress Bars Showcase */}
      <LiberianCard>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Academic Progress Tracking
        </h3>
        <div className="space-y-4">
          <LiberianProgressBar value={85} label="Term 1 Completion" color="red" />
          <LiberianProgressBar value={92} label="Cultural Integration" color="blue" />
          <LiberianProgressBar value={78} label="Ministry Compliance" color="green" />
          <LiberianProgressBar value={95} label="Student Engagement" color="yellow" />
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Progress tracking with Liberian cultural color scheme for academic and cultural milestones.
        </p>
      </LiberianCard>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LiberianAlert type="success" title="Cultural Integration Success">
          Your school has successfully integrated all Liberian national holidays and cultural events into the academic calendar.
        </LiberianAlert>
        <LiberianAlert type="info" title="Ministry of Education Compliance">
          All reporting systems are fully compliant with Liberian Ministry of Education standards and requirements.
        </LiberianAlert>
      </div>

      {/* Key Features */}
      <LiberianCard>
        <h3 className="text-2xl font-semibold text-red-700 mb-4 text-center flex items-center justify-center">
          <span className="mr-2">🎓</span>
          Educational Integration Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-semibold text-blue-700 mb-2">Curriculum Integration</h4>
            <p className="text-gray-600 text-sm">
              Each cultural event includes specific educational activities and learning objectives
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="font-semibold text-blue-700 mb-2">Community Engagement</h4>
            <p className="text-gray-600 text-sm">
              Events designed to strengthen school-community relationships and family involvement
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏛️</div>
            <h4 className="font-semibold text-blue-700 mb-2">Ministry Compliance</h4>
            <p className="text-gray-600 text-sm">
              Full alignment with Ministry of Education cultural integration requirements
            </p>
          </div>
        </div>
      </LiberianCard>

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

      {/* Buttons Showcase */}
      <LiberianCard>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔘</span>
          Liberian Cultural Buttons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LiberianButton variant="primary">🇱🇷 Primary Action</LiberianButton>
          <LiberianButton variant="secondary">🎭 Secondary Action</LiberianButton>
          <LiberianButton variant="cultural">🎓 Cultural Action</LiberianButton>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Buttons styled with Liberian flag colors and cultural context for authentic user interactions.
        </p>
      </LiberianCard>

      {/* Call to Action */}
      <LiberianAlert type="success" title="🌟 Experience Authentic Liberian Education">
        <p className="mb-4">
          The Liberian Cultural Design System seamlessly integrates national heritage with modern educational excellence,
          providing students with a comprehensive educational experience that honors their cultural identity while preparing them for future success.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
            🇱🇷 National Pride
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            🎭 Cultural Heritage
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            🎓 Academic Excellence
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
            🏛️ Ministry Compliance
          </span>
        </div>
      </LiberianAlert>
    </div>
  );
};

export default LiberianCulturalShowcase;
