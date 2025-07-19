// scripts/setup-firestore-schema.ts



import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin with environment variables
// For production, use Firebase service account key via environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "edutrack-sis",
  });
}

const db = getFirestore();

async function setupCollections() {
  // USERS
  await db.collection("users").doc("admin1").set({
    uid: "admin1",
    email: "admin@example.com",
    role: "ADMIN",
    username: "adminuser",
  }, { merge: true });

  // STUDENTS
  await db.collection("students").doc("student1").set({
    id: "student1",
    name: "Jane Doe",
    grade: "Grade 6",
    points: 120,
    parentId: "parent1",
    attendance: [
      { date: "2025-06-01", status: "Present" },
      { date: "2025-06-02", status: "Absent" }
    ]
  }, { merge: true });

  // TEACHERS
  await db.collection("teachers").doc("teacher1").set({
    id: "teacher1",
    userId: "teacheruser1",
    name: "Mr. Smith",
    subject: "Mathematics"
  }, { merge: true });

  // CLASSES
  await db.collection("classes").doc("class1").set({
    id: "class1",
    name: "6A",
    teacherId: "teacher1",
    studentIds: ["student1"],
    subjectId: "subject1",
    description: "Grade 6 - Section A"
  }, { merge: true });

  // GRADES
  await db.collection("grades").doc("grade1").set({
    id: "grade1",
    studentId: "student1",
    classId: "class1",
    subjectOrAssignmentName: "Math Test 1",
    score: 85,
    maxScore: 100,
    dateAssigned: "2025-06-01",
    teacherComments: "Good job!",
    dueDate: "2025-06-05",
    status: "Graded",
    submissionDate: "2025-06-04"
  }, { merge: true });

  // SUBJECTS
  await db.collection("subjects").doc("subject1").set({
    id: "subject1",
    name: "Mathematics",
    description: "Core math curriculum"
  }, { merge: true });

  // MESSAGES
  await db.collection("messages").doc("message1").set({
    id: "message1",
    senderId: "teacher1",
    recipientId: "student1",
    content: "Welcome to class!",
    timestamp: FieldValue.serverTimestamp(),
    read: false
  }, { merge: true });

  // EVENTS
  await db.collection("events").doc("event1").set({
    id: "event1",
    title: "First Day of School",
    description: "Welcome back to school!",
    date: "2025-09-01",
    audience: ["STUDENT", "TEACHER", "PARENT"]
  }, { merge: true });

  // RESOURCES
  await db.collection("resources").doc("resource1").set({
    id: "resource1",
    classId: "class1",
    title: "Math Syllabus",
    fileUrl: "https://example.com/syllabus.pdf",
    category: "Syllabus",
    uploadedBy: "teacher1",
    uploadedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log("Firestore schema setup and initial data seeded successfully.");
}

setupCollections().catch((err) => {
  console.error("Error setting up Firestore schema:", err);
  process.exit(1);
});

// --- Additional Example Documents and Schema Completeness ---
// Add more seed data and cover all possible fields for each collection
async function addMoreExamples() {
  // USERS: Add a teacher and student user
  await db.collection("users").doc("teacheruser1").set({
    uid: "teacheruser1",
    email: "teacher1@example.com",
    role: "TEACHER",
    teacherId: "teacher1",
    username: "teachermike"
  }, { merge: true });
  await db.collection("users").doc("studentuser1").set({
    uid: "studentuser1",
    email: "student1@example.com",
    role: "STUDENT",
    studentId: "student1",
    username: "janedoe"
  }, { merge: true });

  // STUDENTS: Add a student with full attendance array
  await db.collection("students").doc("student2").set({
    id: "student2",
    name: "John Smith",
    grade: "Grade 7",
    points: 95,
    parentId: "parent2",
    attendance: [
      { date: "2025-06-01", status: "Present" },
      { date: "2025-06-02", status: "Present" },
      { date: "2025-06-03", status: "Absent" }
    ]
  }, { merge: true });

  // TEACHERS: Add a teacher with a different subject
  await db.collection("teachers").doc("teacher2").set({
    id: "teacher2",
    userId: "teacheruser2",
    name: "Ms. Johnson",
    subject: "English"
  }, { merge: true });

  // CLASSES: Add a class with multiple students
  await db.collection("classes").doc("class2").set({
    id: "class2",
    name: "7B",
    teacherId: "teacher2",
    studentIds: ["student1", "student2"],
    subjectId: "subject2",
    description: "Grade 7 - Section B"
  }, { merge: true });

  // GRADES: Add a grade with status 'Pending'
  await db.collection("grades").doc("grade2").set({
    id: "grade2",
    studentId: "student2",
    classId: "class2",
    subjectOrAssignmentName: "English Essay",
    score: null,
    maxScore: 50,
    dateAssigned: "2025-06-10",
    teacherComments: "Submit by next week.",
    dueDate: "2025-06-17",
    status: "Pending",
    submissionDate: null
  }, { merge: true });

  // SUBJECTS: Add another subject
  await db.collection("subjects").doc("subject2").set({
    id: "subject2",
    name: "English",
    description: "Core English curriculum"
  }, { merge: true });

  // MESSAGES: Add a message marked as read
  await db.collection("messages").doc("message2").set({
    id: "message2",
    senderId: "student1",
    recipientId: "teacher1",
    content: "Thank you!",
    timestamp: FieldValue.serverTimestamp(),
    read: true
  }, { merge: true });

  // EVENTS: Add an event for teachers only
  await db.collection("events").doc("event2").set({
    id: "event2",
    title: "Teacher Workshop",
    description: "Professional development for teachers.",
    date: "2025-10-15",
    audience: ["TEACHER"]
  }, { merge: true });

  // RESOURCES: Add a resource uploaded by a different teacher
  await db.collection("resources").doc("resource2").set({
    id: "resource2",
    classId: "class2",
    title: "English Reading List",
    fileUrl: "https://example.com/readinglist.pdf",
    category: "Reading",
    uploadedBy: "teacher2",
    uploadedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log("Additional example documents seeded.");
}

addMoreExamples().catch((err) => {
  console.error("Error seeding additional example documents:", err);
  process.exit(1);
});