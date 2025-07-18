# EduTrack SIS - Project To-Do List

This document tracks the implementation progress of the EduTrack Student Information System.

## I. Completed Tasks (Frontend with Mock Data)

### A. Core Application Structure
- **[DONE]** Initial project setup (`index.html`, `index.tsx`, `metadata.json`).
- **[DONE]** Core TypeScript types defined (`types.ts`: User, Student, Teacher, PointTransaction, Grade, SchoolClass, UserRole, AppContextType).
- **[DONE]** Global constants and initial mock data established (`constants.ts`).
- **[DONE]** Main application component (`App.tsx`) with:
    - React Router (`HashRouter`) for navigation.
    - AppContext for global state management.
    - Mock data-driven functions for core operations.
- **[DONE]** Basic responsive design foundation with Tailwind CSS.

### B. Authentication
- **[DONE]** Login Screen (`components/Auth/LoginScreen.tsx`):
    - UI for username, password (mock), and role selection.
    - Mock login logic interacting with `AppContext`.
    - UI error display for login failures.
- **[DONE]** User Registration (`components/Auth/RegisterScreen.tsx`): (R1)
    - UI for user registration (Admin, Teacher, Student, Parent) with role-specific fields.
    - Logic to add new users and associated profiles (student, teacher) to `AppContext` state.

### C. Layout
- **[DONE]** Main Layout (`components/Layout/MainLayout.tsx`).
- **[DONE]** Sidebar (`components/Layout/Sidebar.tsx`).
- **[DONE]** Header (`components/Layout/Header.tsx`).

### D. Dashboards
- **[DONE]** Main Dashboard Screen (`components/Dashboard/DashboardScreen.tsx`).
- **[DONE]** Admin Dashboard Content (`components/Dashboard/AdminDashboardContent.tsx`).
- **[DONE]** Teacher Dashboard Content (`components/Dashboard/TeacherDashboardContent.tsx`).
- **[DONE]** Student Dashboard Content (`components/Dashboard/StudentDashboardContent.tsx`).
- **[DONE]** Parent Dashboard Content (`components/Dashboard/ParentDashboardContent.tsx`).
- **[IN PROGRESS]** Enhanced Dashboards & Analytics (R7):
    - **[DONE]** Admin: Student Distribution by Grade Chart (Bar Chart).
    - **[DONE]** Teacher: Points Leaderboard (Top N Students).
    - **[DONE]** Student: My Points Over Time Chart (Line Chart).
    - **[DONE]** Student Dashboard: Add "Recent Assignment Scores" chart.
    - **[DONE]** Admin Dashboard: Add "Class Sizes Overview" chart.
    - **[DONE]** Admin Dashboard: Add mock "Student Performance Trend" chart.
    - **[DONE]** Admin: Create Centralized Leaderboard page (Rank, Name, Grade, Points), sortable.
    - **[DONE]** Student Dashboard: Add 'Upcoming Assignments' count card.
    - **[DONE]** Student Dashboard: Add 'Next Scheduled Class' mock card.
    - **[DONE]** Student: Create Leaderboard page (Rank, Name, Points), sortable.
    - **[DONE]** Teacher Dashboard: Add 'Class Average Points' chart.
    - **[DONE]** Admin Dashboard: Add 'Overall Student Point Distribution' chart.
    - **[DONE]** Teacher Dashboard: Add "Assignments Awaiting Grading" card.
    - **[IN PROGRESS]** Add more charts to relevant dashboards (e.g., student performance trends, point distribution across more views for Teacher/Admin).
    - **[DONE]** Consider a more centralized leaderboard page accessible by relevant roles. (Admin and Student leaderboards implemented)


### E. Admin Features
- **[DONE]** Student Management (`components/Admin/AdminStudentManagement.tsx`):
    - Table display, Add, Edit.
    - Enhanced empty state for no students.
- **[DONE]** Teacher Management (`components/Admin/AdminTeacherManagement.tsx`): (R2)
    - Replaced `PlaceholderContent`.
    - UI to list, add, edit teacher profiles.
    - Enhanced empty state for no teachers.
- **[DONE]** Class Management (`components/Admin/AdminClassManagement.tsx`): (PRD Key Feature)
    - Replaced `PlaceholderContent`.
    - UI to create, view, edit classes.
    - UI to assign teachers and students to classes.
    - Enhanced empty state for no classes.
- **[DONE]** Deletion Capabilities:
    - Added delete functionality to `AdminStudentManagement` (including related grades/points/parent links).
    - Added delete functionality to `AdminTeacherManagement` (including unassigning from classes).
    - Added delete functionality to `AdminClassManagement` (including related grades).
- **[DONE]** Admin - Parent Management (R2, Implied):
    - UI for Admins to view parent accounts and their links to students.
    - Implemented deletion of parent accounts, unlinking from students.
    - Enhanced empty state for no parent accounts.


### F. Teacher Features
- **[DONE]** Point System (`components/Teacher/TeacherPointSystem.tsx`).
- **[DONE]** Attendance Tracking (`components/Teacher/TeacherAttendance.tsx`).
- **[DONE]** My Classes (`components/Teacher/TeacherMyClassesScreen.tsx`):
    - Replaced `PlaceholderContent`.
    - UI to view assigned classes and list of students in each class.
- **[DONE]** Gradebook (`components/Teacher/TeacherGradebookScreen.tsx`): (R3)
    - Replaced `PlaceholderContent`.
    - UI for teachers to select a class, view students.
    - UI to add, edit, delete grades for students within the selected class.
    - Enhanced empty state for no assigned classes.

### G. Student/Parent Features
- **[DONE]** Student Profile Page (`components/Student/StudentProfilePage.tsx`):
    - Tabbed interface for Profile, Points History, Grades (dynamic), Attendance.
- **[DONE]** Student/Parent Dashboard Links:
    - **[DONE]** Implement functionality for "Contact Teacher" (Parent Dashboard) - links to Messaging.
    - **[DONE]** Student Dashboard: Added 'View My Attendance' quick link to profile attendance tab.
- **[DONE]** Student Class Schedule View (R10 - New Requirement):
    - **[DONE]** Create `components/Student/StudentScheduleScreen.tsx`.
    - **[DONE]** Add link to Student Sidebar ("My Schedule").
    - **[DONE]** UI to display a weekly timetable view of their assigned classes (mock times/days).
    - **[DONE]** Show teacher name for each class in the schedule.
- **[DONE]** Student Assignment Overview (R11 - New Requirement):
    - **[DONE]** Modify `Grade` type to include `dueDate` and `status`.
    - **[DONE]** Update `MOCK_GRADES_INITIAL` with new fields and example upcoming assignments.
    - **[DONE]** Create `components/Student/StudentAssignmentsScreen.tsx`.
    - **[DONE]** Add "My Assignments" link to Student Sidebar with `ClipboardDocumentListIcon`.
    - **[DONE]** Implement routing for `/student/assignments`.
    - **[DONE]** UI to list assignments categorized by Upcoming, Pending/Submitted, and Graded.
    - **[DONE]** Display relevant details: Name, Class, Due Date, Status, Score, Comments.
    - **[DONE]** Implement empty states for each assignment category.
    - **[DONE]** Add "Submit Assignment" button for students on `StudentAssignmentsScreen`.

### H. Shared Components
- **[DONE]** Button (`components/Shared/Button.tsx`).
- **[DONE]** Input (`components/Shared/Input.tsx`).
- **[DONE]** Modal (`components/Shared/Modal.tsx`).
- **[DONE]** Placeholder Content (`components/Shared/PlaceholderContent.tsx`).
- **[DONE]** Toast Notification System (`components/Shared/Toast.tsx`, `components/Shared/ToastContainer.tsx`).

### I. Messaging & Notifications
- **[DONE]** Basic Messaging System (Phase 1):
    - `Message` type, `AppContext` integration (state, `sendMessage`, `markMessageAsRead`).
    - `MessagingScreen.tsx` with Inbox, Read Message, and Compose Message views (mock data).
- **[DONE]** Messaging/Notifications Enhancements:
    - **[DONE]** Unread message count badge in Sidebar/Header.
    - **[DONE]** New message toast notification for current user.
    - **[DONE]** Context function for direct toast notifications.

### J. Academic & School Management
- **[DONE]** School Event Calendar (R8 - New Requirement):
    - **[DONE]** Create `components/Calendar/SchoolCalendarScreen.tsx`.
    - **[DONE]** Add link to Sidebar for relevant roles (Admin, Teacher, Student, Parent).
    - **[DONE]** UI for displaying school-wide events (e.g., holidays, exam periods, parent-teacher meetings) using mock data, grouped by month and filtered by audience.
    - **[DONE]** Admin Feature: UI for Admin to add new mock events to the calendar via modal.
- **[DONE]** Mock Reporting System (R9 - New Requirement):
    - **[DONE]** Create `components/Reporting/AdminReportsScreen.tsx` and `components/Reporting/TeacherReportsScreen.tsx`.
    - **[DONE]** Add links to Sidebar for Admin and Teacher roles.
    - **[DONE]** Admin: UI to select and view mock reports - Implemented "Student Attendance Summary" display.
    - **[DONE]** Teacher: UI to select and view mock reports - Implemented "Class Grade Sheet" display (with class selection).
    - **[DONE]** Admin: Implemented "Overall Grade Distribution" chart report.
    - **[DONE]** Admin: Implemented "Teacher Load Report" table display.
    - **[DONE]** Teacher: Implemented "Student Progress Snippet" report display.
- **[DONE]** Curriculum Management (Liberian Context):
    - **[DONE]** Define `Subject` type and integrate into `AppContext`.
    - **[DONE]** Create mock subjects data representing a Liberian curriculum.
    - **[DONE]** Admin: Implement UI for Subject CRUD operations (`AdminSubjectManagement.tsx`).
    - **[DONE]** Admin: Integrate Subject selection into Class Management.
    - **[DONE]** Update mock class data to link to specific subjects.
- **[DONE]** Class Resource Sharing (R12 - New Requirement):
    - **[DONE]** Define `DocumentResource` type and integrate into `AppContext`.
    - **[DONE]** Implement `addDocumentResource` (using FileReader) and `deleteDocumentResource`.
    - **[DONE]** Teacher UI (`TeacherClassResources.tsx`): Select class, list resources, upload new (modal with file input, title, category), delete.
    - **[DONE]** Student UI (`StudentClassResources.tsx`): Select class, list resources, view/download (opens base64 data URL).
    - **[DONE]** Add Sidebar links for Teacher and Student ("Class Resources") with new `FolderArrowDownIcon`.
    - **[DONE]** Implement routing for resource screens.

### K. UI/UX Enhancements (Initial Pass)
- **[DONE]** Form Validation: Add more comprehensive client-side validation for all input forms.
    - **[DONE]** Enhanced validation for RegisterScreen.
    - **[DONE]** Add/Edit Student modal (`AdminStudentManagement.tsx`).
    - **[DONE]** Add/Edit Teacher modal (`AdminTeacherManagement.tsx`).
    - **[DONE]** Add/Edit Class modal (`AdminClassManagement.tsx`).
    - **[DONE]** Award Points modal (`TeacherPointSystem.tsx`).
    - **[DONE]** Add/Edit Grade modal (`TeacherGradebookScreen.tsx`).
    - **[DONE]** Compose Message form (`MessagingScreen.tsx`).
    - **[DONE]** Add Event modal (`SchoolCalendarScreen.tsx`).
    - **[DONE]** Resource Upload modal (`TeacherClassResources.tsx`).
- **[DONE]** Consistent Empty States: Ensure all tables/lists have user-friendly messages when there's no data.
    - **[DONE]** Enhanced empty state in TeacherGradebookScreen for no assigned classes.
    - **[DONE]** Enhanced empty state in AdminStudentManagement table for no students.
    - **[DONE]** Enhanced empty state in AdminTeacherManagement table for no teachers.
    - **[DONE]** Enhanced empty state in AdminClassManagement table for no classes.
    - **[DONE]** Enhanced empty state in AdminParentManagement table for no parent accounts.
    - **[DONE]** Enhanced empty state in SchoolCalendarScreen.
    - **[DONE]** Enhanced empty states in Admin and Teacher Reports screens.
    - **[DONE]** Enhanced empty states in Student Schedule and Assignment screens.
    - **[DONE]** Enhanced empty states in Class Resource screens.
- **[DONE]** Loading States: Implement visual loading indicators for actions that simulate data fetching/processing.
    - **[DONE]** Add loading state to "Add/Edit" modal submit buttons in management screens and other primary actions (Student, Teacher, Class, Points, Attendance, Grades, Messaging, Events, Resources).
    - **[DONE]** Add loading state to "Delete" buttons in management screens (Student, Teacher, Class, Gradebook, Subjects, Resources).
- **[IN PROGRESS]** Advanced Table Features:
    - **[DONE]** Client-side sorting for `AdminStudentManagement` (Name, Grade, Points).
    - **[DONE]** Client-side sorting for `AdminTeacherManagement` (Name, Subject).
    - **[DONE]** Client-side sorting for `AdminClassManagement` (Name, Subject, Teacher, Student Count).
    - **[DONE]** Client-side sorting for `AdminSubjectManagement` (Name, Linked Classes count).
    - **[DONE]** Client-side sorting for `AdminParentManagement` (Parent Username, Student Name, Student Grade).
    - **[DONE]** Client-side sorting for Student Profile grades table.
    - **[DONE]** Client-side sorting for `TeacherMyClassesScreen` student list.
    - **[DONE]** Client-side sorting for `TeacherClassResourcesScreen` resource list.
    - **[DONE]** Client-side sorting for `TeacherGradebookScreen` student list (within selected class).
    - **[DONE]** Client-side sorting for `AdminLeaderboardScreen` (Name, Grade, Points).
    - **[DONE]** Client-side sorting for `StudentLeaderboardScreen` (Name, Points).
    - **[DONE]** Client-side filtering for `AdminStudentManagement` (by Grade).
    - **[DONE]** Client-side filtering for `StudentAssignmentsScreen` (by class).
    - **[DONE]** Client-side filtering for `AdminTeacherManagement` (by Primary Specialization).
    - **[DONE]** Client-side filtering for `AdminClassManagement` (by Teacher, by Subject).
    - **[DONE]** Implemented enhanced search and filtering for AdminStudentManagement with text search, grade filtering, points range filtering, and clear filters functionality with results summary.
- **[DONE]** Navigation & Context:
    - **[DONE]** Update Header to dynamically show the current page title instead of "Dashboard Overview".
- **[IN PROGRESS]** Bulk Actions:
    - **[DONE]** Teacher/Attendance: Add "Mark all as Present" button.
    - **[DONE]** Admin/Class Management: Improved student assignment to allow selecting multiple students and adding them to a class in one action, from the class edit modal. (Firestore-backed, UI and logic complete)
- **[DONE]** Profile Enhancements:
    - **[DONE]** Admin/Edit Teacher Modal: Display list of assigned classes (name, subject).
    - **[DONE]** Admin/Edit Student Modal: Display list of enrolled classes (name, subject, teacher).
    - **[DONE]** Admin viewing Teacher profile: Implemented dedicated Teacher Profile View page with comprehensive information including assigned classes, student counts, performance metrics, recent activity, and detailed statistics.
    - **[DONE]** Admin viewing Student profile: Implemented dedicated Student Profile View page with comprehensive information including enrolled classes, grades, attendance, points history, and academic performance metrics.
    - **[DONE]** Added "View Profile" buttons to Admin Teacher and Student Management screens with proper routing to profile pages.


## II. Pending Features (Frontend - Mock Data Phase)

### B. Academic & School Management
- **[DONE]** Customizable Point Rules (R6):
    - **[DONE]** Admin interface for creating, editing, and managing point rules (`AdminPointRulesManagement.tsx`).
    - **[DONE]** Rule engine logic for evaluating conditions and generating suggestions (`utils/pointRuleEngine.ts`).
    - **[DONE]** Integration with teacher point system to show rule-based suggestions (`TeacherPointSystem.tsx`).
    - **[DONE]** Firebase integration for storing point rules and suggestions in Firestore.
    - **[DONE]** Support for multiple rule conditions: attendance, assignment scores, early submission, participation, behavior, and improvement.
    - **[DONE]** Rule parameters and filters (subject-specific, grade-specific, score thresholds, etc.).
    - **[DONE]** Teacher UI for applying or dismissing point suggestions.

## III. Pending UI/UX Enhancements (Frontend - Mock Data Phase)

- **[DONE]** Visual Polish:
    - **[DONE]** Enhanced color contrast and accessibility compliance (WCAG AA standards).
    - **[DONE]** Standardized typography hierarchy with improved font sizes and line heights.
    - **[DONE]** Comprehensive icon standardization with consistent sizing and styling.
    - **[DONE]** Enhanced design system with CSS custom properties and utility classes.
    - **[DONE]** Improved component consistency (buttons, inputs, modals, tables, cards).
    - **[DONE]** Enhanced focus states and accessibility features.
    - **[DONE]** Responsive design improvements and mobile optimization.
    - **[DONE]** Professional status badges, loading states, and interactive elements.


## IV. Backend & Integration Phase

This section tracks the migration from mock data to a real Firebase backend.

- **[DONE]** Firebase Project Setup
    - Firebase SDKs added to `index.html`.
    - `firebase-config.ts` created and configured with environment variables.
- **[DONE]** Authentication (Firebase Authentication)
    - Mock login/registration replaced with Firebase Authentication (email/password).
    - User sessions managed via `onAuthStateChanged` and user profile fetched from Firestore.
    - **[NOTE]** Role-based access control (RBAC) with custom claims and Security Rules is planned, but custom claims require Cloud Functions (not available on Spark/free plan).
- **[IN PROGRESS]** Database (Cloud Firestore)
    - `users` collection implemented for user profiles.
    - Firestore listeners set up for real-time data fetching.
    - **[IN PROGRESS]** Define and document schema/collections for all data types (Students, Teachers, Classes, Grades, Subjects, Messages, Events, Resources, etc.).
        - **Complete Firestore Collections & Example Document Structure:**
            - `users` (user profiles)
              - Fields: `uid`, `email`, `role` (ADMIN, TEACHER, STUDENT, PARENT), `studentId?`, `teacherId?`, `username`, etc.
            - `students` (student records)
              - Fields: `id`, `name`, `grade`, `points`, `parentId?`, `attendance`: [{date, status}]
            - `teachers` (teacher records)
              - Fields: `id`, `userId`, `name`, `subject`
            - `classes` (school classes)
              - Fields: `id`, `name`, `teacherId`, `studentIds` (array), `subjectId`, `description?`
            - `grades` (student grades)
              - Fields: `id`, `studentId`, `classId`, `subjectOrAssignmentName`, `score`, `maxScore?`, `dateAssigned`, `teacherComments?`, `dueDate?`, `status?`, `submissionDate?`
            - `subjects` (school subjects)
              - Fields: `id`, `name`, `description?`
            - `messages` (user messages)
              - Fields: `id`, `senderId`, `recipientId`, `content`, `timestamp`, `read`
            - `events` (school events)
              - Fields: `id`, `title`, `description`, `date`, `audience` (array)
            - `resources` (class resources)
              - Fields: `id`, `classId`, `title`, `fileUrl`, `category`, `uploadedBy`, `uploadedAt`

        - **What we are doing now:**
            - [x] Finalizing and documenting the Firestore schema/collections above.
            - [x] Creating these collections in Firestore (with a script, including parents, attendance, assignments, logs, settings, etc.).
            - [x] Migrating CRUD operations in the app to use Firestore instead of mock data.
            - [x] Testing data access and updating security rules as needed (manual verification complete; security rules pending).
    - **[DONE]** Set up Firestore Security Rules for robust data access control. (firestore.rules file created and ready for deployment)
- **[TODO]** API Layer (Firebase SDK / Cloud Functions)
    - **[NOTE]** Cloud Functions are not available on the Firebase Spark (free) plan. All admin-only user creation must be done manually in the Firebase Console, or via insecure client-side code (not recommended).
    - **[TODO]** When upgrading to Blaze plan, implement Cloud Functions for secure admin-only user creation and complex logic.
    - **[TODO]** Replace all remaining mock data functions in `AppContext` with Firebase SDK calls.
- **[TODO]** Storage (Cloud Storage for Firebase)
    - **[DONE]** Implemented file uploads for `DocumentResource` using the Firebase Storage SDK. (App and UI now use Storage for resource files)
    - **[TODO]** Manage security with Cloud Storage Security Rules.

**Current Limitation:**
> On the Firebase Spark (free) plan, Cloud Functions are not available. Admin-only user creation and other backend logic requiring Cloud Functions must be done manually or deferred until upgrading to the Blaze plan. All other Firebase Authentication and Firestore features are fully supported.


## V. Pending Tasks (Non-Functional Requirements)
- **[TODO]** Comprehensive Accessibility Review (WCAG AA compliance).
- **[TODO]** Performance Optimization (identify and address bottlenecks after backend integration).
- **[TODO]** Cross-browser/Cross-device Testing (manual and automated).
- **[TODO]** Unit/Integration Testing.
- **[TODO]** Documentation.
- **[TODO]** Error Handling & Resilience.
- **[TODO]** Security Review.
---
*Self-correction: Moved UI/UX parent tasks to a new "Completed" sub-section K for clarity instead of just marking them DONE in the pending section.*
*Self-correction: Restructured pending frontend tasks into "Pending Features" and "Pending UI/UX Enhancements" for better organization.*
*Self-correction: Moved "School Event Calendar" to completed section J, as major parts are now done.*
*Self-correction: Marked Admin & Teacher Report display tasks as DONE under J. Mock Reporting System.*
*Self-correction: Marked Student Class Schedule view as DONE.*
*Self-correction: Marked Student Assignment Overview and its sub-tasks as DONE/IN PROGRESS.*
*Self-correction: Marked Class Resource Sharing as DONE.*
*Self-correction: Updated Backend section to reflect the start of Firebase integration.*