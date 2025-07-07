
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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

export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      console.log('No such document!');
      return null;
    }

    const data = ticketSnap.data();
    const result: { [key: string]: any } = { id: ticketSnap.id };
    for (const key in data) {
      if (data[key] && typeof data[key].toDate === 'function') {
        result[key] = data[key].toDate().toISOString();
      } else {
        result[key] = data[key];
      }
    }
    return result as Ticket;
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return null;
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

export async function addTicket(ticketData: Partial<Ticket>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticketData,
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ticket:", error);
    throw new Error("Failed to create ticket.");
  }
}
