
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { projects, tickets, users } from './data';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function seedDatabase() {
  console.log('Starting to seed database...');

  // Manually construct the Firebase config object after loading .env
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  // A more robust validation check for the seed script
  const missingConfigKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value || typeof value !== 'string' || value.trim() === '')
    .map(([key]) => key);

  if (missingConfigKeys.length > 0) {
    console.error('ERROR: Firebase configuration is missing or incomplete in your .env file.');
    console.error('The seed script requires these values to be set:');
    console.error(missingConfigKeys.join(', '));
    console.error('Please check your .env file and try again.');
    process.exit(1);
  }

  // Initialize Firebase app and Firestore within the script to ensure credentials are loaded
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const batch = writeBatch(db);

  // Seed Users
  console.log('Seeding users...');
  const usersCollection = collection(db, 'users');
  users.forEach(user => {
    const userRef = doc(usersCollection, user.id);
    const { id, ...userData } = user;
    batch.set(userRef, {
      ...userData,
      activityIsPublic: user.activityIsPublic ?? false,
    });
  });
  console.log(`- ${users.length} users queued for creation.`);


  // Seed Projects
  console.log('Seeding projects...');
  const projectsCollection = collection(db, 'projects');
  projects.forEach(project => {
    const projectRef = doc(projectsCollection, project.id);
    batch.set(projectRef, {
        name: project.name,
        description: project.description,
        status: project.status,
        manager: project.manager,
        team: project.team,
        createdAt: Timestamp.fromDate(new Date(project.createdAt)),
        deadline: Timestamp.fromDate(new Date(project.deadline)),
        creatorId: project.creatorId,
        ticketsEnabled: project.ticketsEnabled ?? true,
    });
  });
  console.log(`- ${projects.length} projects queued for creation.`);

  // Seed Tickets
  console.log('Seeding tickets...');
  const ticketsCollection = collection(db, 'tickets');
  tickets.forEach(ticket => {
    const ticketRef = doc(ticketsCollection, ticket.id);
    batch.set(ticketRef, {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignee: ticket.assignee,
        reporter: ticket.reporter,
        reporterEmail: ticket.reporterEmail || null,
        createdAt: Timestamp.fromDate(new Date(ticket.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(ticket.updatedAt)),
        tags: ticket.tags,
        project: ticket.project,
    });
  });
  console.log(`- ${tickets.length} tickets queued for creation.`);

  try {
    await batch.commit();
    console.log('\n✅ Database seeded successfully!');
    console.log('You can now view your data in the app and in the Firebase console.');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
  }
}

seedDatabase();
