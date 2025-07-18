
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../App';
import { NAVIGATION_LINKS } from '../../constants';
import { UserRole } from '../../types';
import { SimpleThemeToggle } from '../Shared/SimpleThemeToggle';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

const getPageTitle = (pathname: string, userRole: UserRole | undefined): string => {
  if (!userRole) return "Dashboard Overview";

  const roleLinks = NAVIGATION_LINKS[userRole];
  let bestMatch = null;

  if (roleLinks) {
    // Attempt to find the most specific match
    for (const link of roleLinks) {
      if (link.path === pathname) {
        return link.label; // Exact match
      }
      // If pathname starts with link.path and it's not just the root '/' (unless pathname is also '/')
      // and it's a more specific match than previously found
      if (pathname.startsWith(link.path) && (link.path !== '/' || pathname === '/')) {
        if (!bestMatch || link.path.length > bestMatch.path.length) {
          bestMatch = link;
        }
      }
    }
    if (bestMatch) return bestMatch.label;
  }
  
  // Generic fallbacks if no specific match from navigation links
  if (pathname === '/') return "Dashboard Overview";
  if (pathname.includes("/messages")) return "Messages";
  if (pathname.includes("/calendar")) return "School Calendar";
  if (pathname.includes("/profile")) return "My Profile";
  if (pathname.includes("/schedule")) return "My Schedule";
  if (pathname.includes("/assignments")) return "My Assignments";
  if (pathname.includes("/resources")) return "Class Resources";
  if (pathname.includes("/points")) return "My Points";
  if (pathname.includes("/grades") && userRole === UserRole.STUDENT) return "My Grades";
   if (pathname.includes("/admin/reports")) return "Admin Reports";
  if (pathname.includes("/teacher/reports")) return "Teacher Reports";


  // Capitalize and clean up path for a generic title
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== userRole.toLowerCase());
  if (pathSegments.length > 0) {
    return pathSegments
      .map(segment => segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()))
      .join(' - ');
  }

  return "EduTrack SIS"; // Default title
};


const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  const context = useContext(AppContext);
  const location = useLocation();

  let unreadMessages = 0;
  if (context && context.currentUser && context.getUnreadMessagesCount) {
    unreadMessages = context.getUnreadMessagesCount();
  }
  
  const pageTitle = getPageTitle(location.pathname, context?.currentUser?.role);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{pageTitle}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <SimpleThemeToggle />
        <div className="text-right">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Online
                {unreadMessages > 0 &&
                    <span className="text-red-500 dark:text-red-400 font-semibold ml-1">
                        ({unreadMessages} new message{unreadMessages > 1 ? 's' : ''})
                    </span>
                }
            </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
