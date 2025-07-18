# 📤 Teacher Master Gradesheet - User Guide

## Overview

The **Teacher Master Gradesheet** is the official grade compilation and submission interface for teachers in the EduTrack Liberian Student Information System. This critical tool allows teachers to compile final grades, review calculated results, and submit them to administrators for official record-keeping and Ministry of Education compliance.

## 🎯 Key Features

### **1. Final Grade Compilation**
- **Comprehensive Grade Display**: All students in teacher's assigned classes organized by class, student name, and subject
- **Liberian Assessment Calculation**: Automatic final term grade calculation using official method (30% Continuous Assessment + 70% External Examination)
- **Three-Term Structure**: Complete grade summaries for each term according to Liberian academic calendar
- **WAEC Integration**: Final Liberian WAEC grades (A1-F9) with credit status indicators for each subject

### **2. Grade Submission Workflow**
- **Review and Verification**: Teachers can review and verify all calculated final grades before submission
- **Formal Submission Process**: Official submission that locks grades once submitted to prevent unauthorized changes
- **Audit Trail Compliance**: Submission timestamps and teacher authentication for complete audit trail
- **Submission Confirmations**: Generate submission confirmations and receipts for teacher records

### **3. Administrative Integration**
- **Direct Admin Submission**: Submit final grades directly to the Admin Master Gradesheet system
- **Seamless Integration**: Full integration with existing admin oversight and reporting functions
- **Proper Data Flow**: Maintain proper data flow between teacher submissions and administrative approval workflows
- **Bulk Submission**: Support bulk submission of multiple classes and subjects simultaneously

### **4. Liberian Educational Compliance**
- **Ministry Standards**: All submissions follow Ministry of Education standards and formatting requirements
- **WAEC Subject Identification**: Include WAEC subject identification and university admission eligibility calculations
- **Three-Term Structure**: Support Liberian academic structure with proper term-end grade finalization
- **Cultural Context**: Maintain authentic Liberian educational terminology and practices

## 📊 Interface Components

### **Navigation Access**
- **Teacher Sidebar**: `📤 Master Gradesheet` link
- **Teacher Dashboard**: Quick access button with red accent for importance
- **URL Path**: `/teacher/master-gradesheet`

### **Term Selection**
- **Academic Term Selector**: Choose from Term 1 (Sep-Dec), Term 2 (Jan-Apr), Term 3 (May-Jul)
- **Real-time Updates**: All data updates automatically when term is changed
- **Term-Specific Data**: All calculations and submissions are term-specific

## 📈 View Modes

### **1. Overview Mode** 📊
**Purpose**: High-level submission status for all assigned classes

**Features**:
- **Class Submission Cards**: Visual cards showing submission status for each class
- **Progress Indicators**: Color-coded progress bars showing submission completion
- **Key Metrics**: Students, subjects, grades submitted, grades approved
- **Quick Actions**: Direct access to view details and submit grades

**Class Card Information**:
- **Class Name**: Full class name and description
- **Student Count**: Number of enrolled students
- **Subject Count**: Number of subjects taught
- **Grades Submitted**: Number of final grades submitted to admin
- **Grades Approved**: Number of grades approved by administration
- **Submission Progress**: Visual progress bar with percentage completion
- **Last Submission Date**: Most recent submission timestamp

**Color Coding**:
- **Green Border**: Submission complete (all grades submitted)
- **Yellow Border**: Partial submission (some grades submitted)
- **Red Border**: No submission (no grades submitted)

### **2. Class Detail Mode** 📋
**Purpose**: Detailed view of final grades for a specific class

**Features**:
- **Student-by-Student Breakdown**: Individual student performance summaries
- **Complete Grade Tables**: All subjects with detailed grade information
- **Performance Statistics**: Student averages, credit passes, university eligibility
- **Submission Status**: Current status of each grade (Draft, Submitted, Approved, Rejected)

**Student Performance Cards**:
Each student card displays:
- **Student Information**: Name and identification
- **Performance Summary**: Average score with color coding
- **Academic Metrics**: Credit passes, WAEC subjects, university readiness
- **Subject Breakdown**: Complete table of all subjects and final grades

**Grade Table Columns**:
| Column | Information | Purpose |
|--------|-------------|---------|
| **Subject** | Subject name with core subject indicators | Subject identification |
| **CA (30%)** | Continuous Assessment average | Internal evaluation |
| **External (70%)** | External Examination average | Standardized assessment |
| **Final Score** | Calculated final percentage | Overall performance |
| **Liberian Grade** | WAEC scale grade (A1-F9) with credit status | Standards compliance |
| **WAEC** | University preparation subject indicator | Academic planning |
| **Status** | Submission status (Draft/Submitted/Approved/Rejected) | Workflow tracking |

### **3. Submission Review Mode** 📤
**Purpose**: Historical view of all submitted grades and their status

**Features**:
- **Submission History**: Complete record of all grade submissions
- **Status Tracking**: Current approval status for each submitted grade
- **Class Organization**: Grades organized by class for easy review
- **Audit Trail**: Submission dates and status changes

**Submission Table**:
- **Student Name**: Student identification
- **Subject**: Subject name with WAEC indicators
- **Final Score**: Submitted final percentage
- **Liberian Grade**: WAEC scale grade with credit status
- **Status**: Current approval status with color coding
- **Submitted Date**: When grade was submitted to administration

## 🔧 Grade Submission Process

### **Step 1: Grade Compilation**
1. **Select Academic Term**: Choose the term for grade submission
2. **Review Class Overview**: Check submission status for all classes
3. **Identify Incomplete Classes**: Focus on classes with incomplete submissions

### **Step 2: Grade Review**
1. **Access Class Details**: Click "View Details" for specific class
2. **Review Student Performance**: Check all student grades and calculations
3. **Verify Grade Accuracy**: Ensure all continuous assessments and external examinations are properly calculated
4. **Check University Eligibility**: Review credit passes and WAEC subject performance

### **Step 3: Submission Process**
1. **Initiate Submission**: Click "Submit Grades" for the target class
2. **Review Submission Modal**: Carefully review all grades to be submitted
3. **Verify Submission Summary**: Check class, term, total grades, students affected, and subjects
4. **Confirm Submission**: Click "Submit Final Grades" to complete the process

### **Step 4: Post-Submission**
1. **Receive Confirmation**: System provides submission confirmation
2. **Grade Locking**: Submitted grades are automatically locked from editing
3. **Admin Notification**: Administrators are notified of new submissions
4. **Status Tracking**: Monitor approval status in Submission Review mode

## 🎓 Liberian Educational Standards Integration

### **Final Grade Calculation**
Following official Liberian assessment method:
- **30% Continuous Assessment**: Average of all internal assessments
- **70% External Examination**: Average of all external examinations
- **Automatic Calculation**: System computes final scores using official formula
- **WAEC Grade Conversion**: Automatic conversion to A1-F9 scale

### **University Admission Requirements**
- **Credit Pass Tracking**: Monitor A1-C6 grades for university eligibility
- **Required Subjects**: Special attention to English and Mathematics requirements
- **WAEC Subject Identification**: Clear marking of university preparation subjects
- **Eligibility Indicators**: Real-time university readiness calculations

### **Ministry of Education Compliance**
- **Standard Formatting**: All submissions follow MoE formatting requirements
- **Audit Trail**: Complete record of all submissions and approvals
- **Data Integrity**: Locked grades prevent unauthorized modifications
- **Official Records**: Submitted grades become part of official student records

## ⚠️ Important Considerations

### **Grade Locking**
- **Permanent Submission**: Once submitted, grades cannot be modified without administrative approval
- **Review Carefully**: Ensure all grades are accurate before submission
- **Administrative Override**: Only administrators can unlock submitted grades
- **Audit Compliance**: All changes are tracked for audit purposes

### **Submission Requirements**
- **Complete Data**: All continuous assessments and external examinations must be recorded
- **Grade Verification**: System validates all calculations before submission
- **Term Completion**: Grades should only be submitted at term end
- **Class Coverage**: Submit grades for all students and subjects in the class

### **Administrative Workflow**
- **Admin Review**: Submitted grades require administrative approval
- **Status Updates**: Teachers receive notifications of approval/rejection
- **Rejection Handling**: Rejected grades can be corrected and resubmitted
- **Final Approval**: Approved grades become official student records

## 📞 Support and Resources

### **Technical Features**
- **Real-time Calculations**: Automatic grade computation using Liberian standards
- **Data Validation**: Comprehensive validation before submission
- **Error Prevention**: System prevents incomplete or invalid submissions
- **Audit Logging**: Complete tracking of all submission activities

### **Educational Compliance**
- **Ministry Standards**: Full alignment with Liberian educational requirements
- **WAEC Integration**: Complete support for university preparation tracking
- **Cultural Context**: Authentic Liberian educational terminology and practices
- **Professional Standards**: Meets international student information system standards

---

**Note**: The Teacher Master Gradesheet serves as the official bridge between classroom assessment and administrative record-keeping, ensuring that all final grades meet Liberian educational standards while maintaining complete audit compliance and data integrity.
