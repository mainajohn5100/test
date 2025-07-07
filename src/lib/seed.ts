import { db } from './firebase';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { users, projects, tickets } from './data';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  console.log('Starting to seed database...');

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
    // Explicitly create user data to avoid spreading any unwanted properties
    const userData = {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
    };
    batch.set(userRef, userData);
  });
  console.log(`- ${users.length} users queued for creation.`);

  // Seed Projects
  console.log('Seeding projects...');
  const projectsCollection = collection(db, 'projects');
  projects.forEach(project => {
    const projectRef = doc(projectsCollection, project.id);
    const projectData = {
        name: project.name,
        status: project.status,
        manager: project.manager,
        team: project.team,
        createdAt: Timestamp.fromDate(new Date(project.createdAt)),
        deadline: Timestamp.fromDate(new Date(project.deadline)),
    };
    batch.set(projectRef, projectData);
  });
  console.log(`- ${projects.length} projects queued for creation.`);

  // Seed Tickets
  console.log('Seeding tickets...');
  const ticketsCollection = collection(db, 'tickets');
  tickets.forEach(ticket => {
    const ticketRef = doc(ticketsCollection, ticket.id);
    const ticketData: { [key: string]: any } = {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignee: ticket.assignee,
        reporter: ticket.reporter,
        createdAt: Timestamp.fromDate(new Date(ticket.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(ticket.updatedAt)),
        tags: ticket.tags,
    };
    
    // Only add the project field if it exists on the source object
    if (ticket.project) {
      ticketData.project = ticket.project;
    }
    
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
