
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, query, where, Timestamp, deleteDoc, updateDoc } from 'firebase/firestore';
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

function docToData<T>(docSnap: any): T | null {
    if (!docSnap.exists()) {
        console.log('No such document!');
        return null;
    }
    const data = docSnap.data();
    const result: { [key: string]: any } = { id: docSnap.id };
    for (const key in data) {
        if (data[key] && typeof data[key].toDate === 'function') {
            result[key] = data[key].toDate().toISOString();
        } else {
            result[key] = data[key];
        }
    }
    return result as T;
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

export async function getTicketsByStatus(status: string): Promise<Ticket[]> {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("status", "==", status));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by status:", error);
        return [];
    }
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);
    return docToData<Ticket>(ticketSnap);
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return null;
  }
}

export async function getTicketsByProject(projectName: string): Promise<Ticket[]> {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("project", "==", projectName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by project:", error);
        return [];
    }
}

export async function getTicketsByAssignee(assigneeName: string): Promise<Ticket[]> {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("assignee", "==", assigneeName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by assignee:", error);
        return [];
    }
}

export async function getTicketsByReporter(reporterName: string): Promise<Ticket[]> {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("reporter", "==", reporterName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by reporter:", error);
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

export async function getProjectsByStatus(status: string): Promise<Project[]> {
    try {
        const projectsCol = collection(db, 'projects');
        const q = query(projectsCol, where("status", "==", status));
        const projectSnapshot = await getDocs(q);
        return snapshotToData<Project>(projectSnapshot);
    } catch (error) {
        console.error("Error fetching projects by status:", error);
        return [];
    }
}

export async function getProjectById(id: string): Promise<Project | null> {
    try {
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);
        return docToData<Project>(projectSnap);
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return null;
    }
}

export async function getProjectsByManager(managerId: string): Promise<Project[]> {
    try {
        const projectsCol = collection(db, 'projects');
        const q = query(projectsCol, where("manager", "==", managerId));
        const projectSnapshot = await getDocs(q);
        return snapshotToData<Project>(projectSnapshot);
    } catch (error) {
        console.error("Error fetching projects by manager:", error);
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

export async function getUserById(id: string): Promise<User | null> {
    try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        return docToData<User>(userSnap);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
}

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id' | 'avatar'>>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, userData);
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}

export async function addTicket(ticketData: {
    title: string;
    description: string;
    reporter: string;
    tags: string[];
    priority: "Low" | "Medium" | "High" | "Urgent";
    assignee: string;
    project: string | null;
  }): Promise<string> {
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
