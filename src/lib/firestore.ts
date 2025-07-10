

import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, query, where, Timestamp, deleteDoc, updateDoc, DocumentData, QuerySnapshot, DocumentSnapshot, writeBatch, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Ticket, Project, User, Notification } from './data';
import { cache } from 'react';

// Helper to process raw document data, converting Timestamps
function processDocData(data: DocumentData) {
    const processedData: { [key: string]: any } = {};
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            processedData[key] = data[key].toDate().toISOString();
        } else {
            processedData[key] = data[key];
        }
    }
    return processedData;
}

// A helper function to convert Firestore snapshots to our data types.
// It ensures the document ID is always used as the object's 'id'.
function snapshotToData<T>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const processedData = processDocData(data);
    return {
      ...processedData,
      id: doc.id,
    } as T;
  });
}

function docToData<T>(docSnap: DocumentSnapshot): T | null {
    if (!docSnap.exists()) {
        console.log('No such document!');
        return null;
    }
    const data = docSnap.data();
    const processedData = processDocData(data);
    return {
      ...processedData,
      id: docSnap.id,
    } as T;
}

export const getTickets = cache(async (user: User): Promise<Ticket[]> => {
  try {
    const ticketsCol = collection(db, 'tickets');
    let ticketQuery;

    if (user.role === 'Customer') {
        ticketQuery = query(ticketsCol, where("reporter", "==", user.name));
    } else if (user.role === 'Agent') {
        ticketQuery = query(ticketsCol, where("assignee", "==", user.name));
    } else { // Admin
        ticketQuery = query(ticketsCol);
    }
    
    const ticketSnapshot = await getDocs(ticketQuery);
    return snapshotToData<Ticket>(ticketSnapshot);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
});

export const getTicketsByStatus = cache(async (status: string, user: User): Promise<Ticket[]> => {
  try {
    const ticketsCol = collection(db, 'tickets');
    const statusQuery = status !== 'all' ? [where("status", "==", status)] : [];
    
    let roleQuery = [];
    if (user.role === 'Customer') {
        roleQuery.push(where("reporter", "==", user.name));
    } else if (user.role === 'Agent') {
        roleQuery.push(where("assignee", "==", user.name));
    }
    
    const q = query(ticketsCol, ...statusQuery, ...roleQuery);
    const ticketSnapshot = await getDocs(q);
    return snapshotToData<Ticket>(ticketSnapshot);
  } catch (error) {
    console.error(`Error fetching tickets with status "${status}":`, error);
    return [];
  }
});

export const getTicketById = cache(async (id: string): Promise<Ticket | null> => {
  try {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);
    return docToData<Ticket>(ticketSnap);
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return null;
  }
});

export const getTicketsByProject = cache(async (projectName: string): Promise<Ticket[]> => {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("project", "==", projectName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by project:", error);
        return [];
    }
});

export const getTicketsByAssignee = cache(async (assigneeName: string): Promise<Ticket[]> => {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("assignee", "==", assigneeName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by assignee:", error);
        return [];
    }
});

export const getTicketsByReporter = cache(async (reporterName: string): Promise<Ticket[]> => {
    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("reporter", "==", reporterName));
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching tickets by reporter:", error);
        return [];
    }
});


export const getProjects = cache(async (user: User): Promise<Project[]> => {
  if (!user || user.role === 'Customer') return [];
  try {
    const projectsCol = collection(db, 'projects');
    
    const queries: Promise<QuerySnapshot<DocumentData, DocumentData>>[] = [];

    // All roles can see projects they manage or are on the team for.
    const managerQuery = query(projectsCol, where("manager", "==", user.id));
    const teamMemberQuery = query(projectsCol, where("team", "array-contains", user.id));
    queries.push(getDocs(managerQuery), getDocs(teamMemberQuery));
    
    // Admins can also see projects they created.
    if (user.role === 'Admin') {
        const creatorQuery = query(projectsCol, where("creatorId", "==", user.id));
        queries.push(getDocs(creatorQuery));
    }

    const snapshots = await Promise.all(queries);

    const projectsMap = new Map<string, Project>();
    snapshots.forEach(snapshot => {
        snapshotToData<Project>(snapshot).forEach(p => projectsMap.set(p.id, p));
    });
    
    return Array.from(projectsMap.values());

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
});

export const getProjectsByStatus = cache(async (status: string, user: User): Promise<Project[]> => {
    if (!user || user.role === 'Customer') return [];

    try {
        const projectsCol = collection(db, 'projects');
        const statusFilter = status !== 'all' ? [where("status", "==", status)] : [];

        const queries: Promise<QuerySnapshot<DocumentData, DocumentData>>[] = [];

        // Base queries for all roles
        const managerQuery = query(projectsCol, where("manager", "==", user.id), ...statusFilter);
        const teamMemberQuery = query(projectsCol, where("team", "array-contains", user.id), ...statusFilter);
        queries.push(getDocs(managerQuery), getDocs(teamMemberQuery));

        // Additional query for Admins
        if (user.role === 'Admin') {
            const creatorQuery = query(projectsCol, where("creatorId", "==", user.id), ...statusFilter);
            queries.push(getDocs(creatorQuery));
        }

        const snapshots = await Promise.all(queries);

        const projectsMap = new Map<string, Project>();
        snapshots.forEach(snapshot => {
            snapshotToData<Project>(snapshot).forEach(p => projectsMap.set(p.id, p));
        });
        
        return Array.from(projectsMap.values());

    } catch (error) {
        console.error(`Error fetching projects with status "${status}":`, error);
        return [];
    }
});

export const getProjectById = cache(async (id: string): Promise<Project | null> => {
    try {
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);
        return docToData<Project>(projectSnap);
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return null;
    }
});

export const getProjectsByManager = cache(async (managerId: string): Promise<Project[]> => {
    try {
        const projectsCol = collection(db, 'projects');
        const q = query(projectsCol, where("manager", "==", managerId));
        const projectSnapshot = await getDocs(q);
        return snapshotToData<Project>(projectSnapshot);
    } catch (error) {
        console.error("Error fetching projects by manager:", error);
        return [];
    }
});

export const getUsers = cache(async (): Promise<User[]> => {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return snapshotToData<User>(userSnapshot);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
});

export const getUserById = cache(async (id: string): Promise<User | null> => {
    try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        return docToData<User>(userSnap);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
});

export const getUserByName = cache(async (name: string): Promise<User | null> => {
    if (name === 'Unassigned') return null;
    try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("name", "==", name), limit(1));
        const userSnapshot = await getDocs(q);
        if (userSnapshot.empty) {
            return null;
        }
        return docToData<User>(userSnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching user by name:", error);
        return null;
    }
});

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        const cleanData = Object.fromEntries(Object.entries(userData).filter(([, value]) => value !== undefined));
        if (Object.keys(cleanData).length > 0) {
            await updateDoc(userRef, cleanData);
        }
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}

export async function addTicket(ticketData: {
    title: string;
    description: string;
    reporter: string;
    reporterEmail?: string;
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

export async function addProject(projectData: {
    name: string;
    description: string;
    manager: string; // User ID
    team: string[]; // User IDs
    deadline: Date;
    creatorId: string;
}): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            status: 'New',
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding project:", error);
        throw new Error("Failed to create project.");
    }
}

export async function updateTicket(ticketId: string, data: Partial<Omit<Ticket, 'id'>>): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error("Failed to update ticket.");
  }
}

export async function updateProject(projectId: string, data: Partial<Omit<Project, 'id'>>): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, data);
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project.");
  }
}

export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error("Failed to delete ticket.");
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project.");
  }
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification.");
  }
}


export async function updateNotificationReadStatus(notificationId: string, read: boolean): Promise<void> {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { read });
    } catch (error) {
        console.error("Error updating notification read status:", error);
        throw new Error("Failed to update notification.");
    }
}

export async function markAllUserNotificationsAsRead(userId: string): Promise<void> {
    try {
        const notificationsCol = collection(db, 'notifications');
        const q = query(notificationsCol, where("userId", "==", userId), where("read", "==", false));
        const unreadSnapshot = await getDocs(q);

        if (unreadSnapshot.empty) {
            return;
        }

        const batch = writeBatch(db);
        unreadSnapshot.docs.forEach(document => {
            batch.update(document.ref, { read: true });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read.");
    }
}
