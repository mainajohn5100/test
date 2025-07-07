import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Ticket, Project, User } from './data';

// A helper function to convert Firestore snapshots to our data types.
// It handles the conversion of Timestamps to string dates.
function snapshotToData<T>(snapshot: any): T[] {
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const result: { [key: string]: any } = { id: doc.id };
    for (const key in data) {
      if (data[key] && typeof data[key].toDate === 'function') { // Check if it's a Firestore Timestamp
        result[key] = data[key].toDate().toISOString();
      } else {
        result[key] = data[key];
      }
    }
    return result as T;
  });
}

export async function getTickets(): Promise<Ticket[]> {
  try {
    const ticketsCol = collection(db, 'tickets');
    const ticketSnapshot = await getDocs(ticketsCol);
    return snapshotToData<Ticket>(ticketSnapshot);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsCol = collection(db, 'projects');
    const projectSnapshot = await getDocs(projectsCol);
    return snapshotToData<Project>(projectSnapshot);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return snapshotToData<User>(userSnapshot);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
