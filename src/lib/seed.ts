import { db } from './firebase';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { users, projects, tickets } from './data';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function seedDatabase() {
  console.log('Starting to seed database...');

  // Check for Firebase config to provide a helpful error message.
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('Firebase configuration is missing in your .env file. Please add it before seeding.');
    process.exit(1);
  }

  const batch = writeBatch(db);

  // Seed Users
  console.log('Seeding users...');
  const usersCollection = collection(db, 'users');
  users.forEach(user => {
    const userRef = doc(usersCollection, user.id);
    batch.set(userRef, user);
  });
  console.log(`- ${users.length} users queued for creation.`);

  // Seed Projects
  console.log('Seeding projects...');
  const projectsCollection = collection(db, 'projects');
  projects.forEach(project => {
    const projectRef = doc(projectsCollection, project.id);
    // Convert string dates to Firestore Timestamp objects
    const projectData = {
        ...project,
        createdAt: Timestamp.fromDate(new Date(project.createdAt)),
        deadline: Timestamp.fromDate(new Date(project.deadline))
    };
    batch.set(projectRef, projectData);
  });
  console.log(`- ${projects.length} projects queued for creation.`);

  // Seed Tickets
  console.log('Seeding tickets...');
  const ticketsCollection = collection(db, 'tickets');
  tickets.forEach(ticket => {
    const ticketRef = doc(ticketsCollection, ticket.id);
    // Convert string dates to Firestore Timestamp objects
    const ticketData = {
        ...ticket,
        createdAt: Timestamp.fromDate(new Date(ticket.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(ticket.updatedAt)),
    };
    batch.set(ticketRef, ticketData);
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
