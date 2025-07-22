

import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, query, where, Timestamp, deleteDoc, updateDoc, DocumentData, QuerySnapshot, DocumentSnapshot, writeBatch, limit, orderBy, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Ticket, Project, User, Notification, TicketConversation, Organization, Task } from './data';
import { cache } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Helper to process raw document data, converting Timestamps
function processDocData(data: DocumentData) {
    const processedData: { [key: string]: any } = {};
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            processedData[key] = data[key].toDate().toISOString();
        } else if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
            // Recursively process nested objects, but not arrays
            processedData[key] = processDocData(data[key]);
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

export async function reauthenticateUserPassword(password: string): Promise<{success: boolean, error?: string}> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No authenticated user found.' };
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          return { success: false, error: 'Incorrect password.' };
        }
        console.error("Re-authentication error:", error);
        return { success: false, error: 'Re-authentication failed.' };
    }
}


export const getTickets = cache(async (user: User): Promise<Ticket[]> => {
  try {
    if (!user || !user.organizationId) return [];
    const ticketsCol = collection(db, 'tickets');
    const orgQuery = where("organizationId", "==", user.organizationId);
    
    if (user.role === 'Client') {
      const q = query(ticketsCol, orgQuery, where("reporterEmail", "==", user.email));
      const ticketSnapshot = await getDocs(q);
      return snapshotToData<Ticket>(ticketSnapshot);
    }
    
    if (user.role === 'Agent') {
        const agentQuery = query(ticketsCol, orgQuery, where("assignee", "==", user.name));
        const ticketSnapshot = await getDocs(agentQuery);
        return snapshotToData<Ticket>(ticketSnapshot);
    }

    // Admin gets all
    const ticketQuery = query(ticketsCol, orgQuery);
    const ticketSnapshot = await getDocs(ticketQuery);
    return snapshotToData<Ticket>(ticketSnapshot);

  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
});

export const getTicketsByStatus = cache(async (status: string, user: User): Promise<Ticket[]> => {
  try {
    if (!user || !user.organizationId) return [];
    const ticketsCol = collection(db, 'tickets');
    const orgQuery = where("organizationId", "==", user.organizationId);
    const statusQuery = status !== 'all' ? [where("status", "==", status)] : [];
    
    if (user.role === 'Client') {
      const q = query(ticketsCol, orgQuery, where("reporterEmail", "==", user.email), ...statusQuery);
      const ticketSnapshot = await getDocs(q);
      return snapshotToData<Ticket>(ticketSnapshot);
    }
    
    if (user.role === 'Agent') {
        const agentQuery = query(ticketsCol, orgQuery, where("assignee", "==", user.name), ...statusQuery);
        const ticketSnapshot = await getDocs(agentQuery);
        return snapshotToData<Ticket>(ticketSnapshot);
    }

    const q = query(ticketsCol, orgQuery, ...statusQuery);
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

export const getOpenTicketsByUserId = cache(async (userId: string, organizationId: string): Promise<Ticket[]> => {
    try {
        const ticketsCol = collection(db, 'tickets');
        // This logic is tricky. How do we link a user to a ticket?
        // Let's assume the user created the ticket. We'll need a way to find the user from the WhatsApp webhook.
        // For now, let's assume `reporter` holds a user ID.
        // We need to fetch the user by ID first.
        const user = await getUserById(userId);
        if (!user) return [];

        const q = query(
            ticketsCol,
            where("organizationId", "==", organizationId),
            // This assumes the `reporter` field holds the user ID. 
            // In the `inbound-whatsapp` route, it sets `reporter: user.name`. This needs to be reconciled.
            // Let's query by reporter's name for now, but this is brittle.
            where("reporter", "==", user.name),
            where("status", "in", ['New', 'Active', 'Pending', 'On Hold']),
            orderBy('updatedAt', 'desc'),
            limit(1)
        );
        const ticketSnapshot = await getDocs(q);
        return snapshotToData<Ticket>(ticketSnapshot);
    } catch (error) {
        console.error("Error fetching open tickets by user ID:", error);
        return [];
    }
});

export const getTicketConversations = cache(async (ticketId: string): Promise<TicketConversation[]> => {
    try {
        const conversationCol = collection(db, 'tickets', ticketId, 'conversations');
        const q = query(conversationCol, orderBy('createdAt', 'asc'));
        const conversationSnapshot = await getDocs(q);
        return snapshotToData<TicketConversation>(conversationSnapshot);
    } catch (error) {
        console.error("Error fetching ticket conversations:", error);
        return [];
    }
});


export const getTicketsByProject = cache(async (projectId: string): Promise<Ticket[]> => {
    try {
        // This query is tricky if project names aren't unique. Let's assume they are for now,
        // or better yet, we should query by project ID if possible.
        // For now, let's get the project name from the ID first.
        const project = await getProjectById(projectId);
        if (!project) return [];

        const ticketsCol = collection(db, 'tickets');
        const q = query(ticketsCol, where("project", "==", project.name));
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
  if (!user || !user.organizationId) return [];

  const projectsCol = collection(db, 'projects');
  const orgQuery = where("organizationId", "==", user.organizationId);

  try {
    if (user.role === 'Client') {
      const q = query(projectsCol, orgQuery, where("stakeholders", "array-contains", user.id));
      const projectSnapshot = await getDocs(q);
      return snapshotToData<Project>(projectSnapshot);
    }
    
    // Admins and Agents now have the same logic
    const managerQuery = query(projectsCol, orgQuery, where("manager", "==", user.id));
    const teamMemberQuery = query(projectsCol, orgQuery, where("team", "array-contains", user.id));

    const [managerSnap, teamSnap] = await Promise.all([
        getDocs(managerQuery),
        getDocs(teamMemberQuery)
    ]);

    const projectsMap = new Map<string, Project>();
    snapshotToData<Project>(managerSnap).forEach(p => projectsMap.set(p.id, p));
    snapshotToData<Project>(teamSnap).forEach(p => projectsMap.set(p.id, p));
    
    return Array.from(projectsMap.values());
    
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
});

export const getProjectsByStatus = cache(async (status: string, user: User): Promise<Project[]> => {
    const allProjects = await getProjects(user); // Reuse the main project fetching logic
    if (status === 'all') {
        return allProjects;
    }
    return allProjects.filter(p => p.status === status);
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

export const getTasksByProject = cache(async (projectId: string): Promise<Task[]> => {
    try {
        const tasksCol = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksCol);
        return snapshotToData<Task>(tasksSnapshot);
    } catch (error) {
        console.error("Error fetching tasks for project:", error);
        return [];
    }
});

export const getTaskById = cache(async (projectId: string, taskId: string): Promise<Task | null> => {
    try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);
        return docToData<Task>(taskSnap);
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        return null;
    }
});


export const getUsers = cache(async (user: User): Promise<User[]> => {
  try {
    if (!user || !user.organizationId) return [];
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("organizationId", "==", user.organizationId));
    const userSnapshot = await getDocs(q);
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

export const getUserByEmail = cache(async (email: string): Promise<User | null> => {
    if (!email) return null;
    try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("email", "==", email), limit(1));
        const userSnapshot = await getDocs(q);
        if (userSnapshot.empty) {
            return null;
        }
        return docToData<User>(userSnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
});

export const getUserByPhone = cache(async (phone: string, organizationId: string): Promise<User | null> => {
    try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("phone", "==", phone), where("organizationId", "==", organizationId), limit(1));
        const userSnapshot = await getDocs(q);
        if (userSnapshot.empty) {
            return null;
        }
        return docToData<User>(userSnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching user by phone number:", error);
        return null;
    }
});

export async function createUserInAuth(email: string, password: string):Promise<string> {
    try {
        const tempAuth = auth;
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        return userCredential.user.uid;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use by another account.');
        }
        if (error.code === 'auth/weak-password') {
            throw new Error('The password is too weak. Please use at least 6 characters.');
        }
        console.error("Error creating user in Firebase Auth:", error);
        throw new Error("Could not create user account.");
    }
}

export async function addAutoGeneratedUser(userData: Omit<User, 'id'>): Promise<string> {
    try {
        const userRef = await addDoc(collection(db, 'users'), {
            ...userData,
            status: userData.status || 'active',
            lastSeen: serverTimestamp(),
        });
        return userRef.id;
    } catch (error) {
        console.error("Error adding auto-generated user:", error);
        throw new Error("Failed to create user profile in database.");
    }
}


export async function createUserInFirestore(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...userData,
            status: userData.status || 'active', // Ensure status is set
            lastSeen: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating user in Firestore:", error);
        throw new Error("Failed to create user profile in database.");
    }
}


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

export async function updateUserPresence(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, {
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        // This might fail if the user is offline, which is fine.
        // We can ignore this specific error.
    }
}

export async function addTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticketData,
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clientCanReply: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ticket:", error);
    throw new Error("Failed to create ticket.");
  }
}

export async function addConversation(
    ticketId: string, 
    conversationData: Omit<TicketConversation, 'id' | 'createdAt'>,
    ticketUpdate: Partial<Ticket> = {}
): Promise<string> {
    const batch = writeBatch(db);
    
    // Create the conversation document
    const conversationCol = collection(db, 'tickets', ticketId, 'conversations');
    const conversationDocRef = doc(conversationCol); // Create a new doc with a generated ID
    batch.set(conversationDocRef, {
        ...conversationData,
        createdAt: serverTimestamp(),
    });

    // Update the parent ticket
    const ticketRef = doc(db, 'tickets', ticketId);
    const updates = { ...ticketUpdate, updatedAt: serverTimestamp() };
    batch.update(ticketRef, updates);

    try {
        await batch.commit();
        return conversationDocRef.id;
    } catch (error) {
        console.error("Error adding conversation:", error);
        throw new Error("Failed to add conversation.");
    }
}

export async function addProject(projectData: {
    name: string;
    description: string;
    manager: string; // User ID
    team: string[]; // User IDs
    deadline: Date;
    budget?: number;
    creatorId: string;
    organizationId: string;
    teamCanEditTasks: boolean;
    statusLastSetBy: 'Admin' | 'Agent' | 'Client';
}): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            status: 'New',
            createdAt: serverTimestamp(),
            ticketsEnabled: true,
            stakeholders: [],
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
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    if (Object.keys(cleanData).length > 0) {
        await updateDoc(projectRef, cleanData);
    }
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

export async function getNotifications(userId: string): Promise<Notification[]> {
    try {
        const notificationsCol = collection(db, 'notifications');
        const q = query(
            notificationsCol,
            where("userId", "==", userId),
            orderBy('createdAt', 'desc'),
            limit(50) // Prevent fetching thousands of notifications
        );
        const snapshot = await getDocs(q);
        return snapshotToData<Notification>(snapshot);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function getRecentNotifications(userId: string, count: number): Promise<Notification[]> {
    try {
        const notificationsCol = collection(db, 'notifications');
        const q = query(
            notificationsCol,
            where("userId", "==", userId),
            orderBy('createdAt', 'desc'),
            limit(count)
        );
        const snapshot = await getDocs(q);
        return snapshotToData<Notification>(snapshot);
    } catch (error) {
        console.error("Error fetching recent notifications:", error);
        return [];
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


// Functions for Organization and Auth Claims

export async function createOrganization(name: string): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'organizations'), {
            name,
            createdAt: serverTimestamp(),
            settings: {}
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating organization:", error);
        throw new Error("Failed to create organization.");
    }
}

export const getOrganizationById = cache(async (id: string): Promise<Organization | null> => {
    try {
        const orgRef = doc(db, 'organizations', id);
        const orgSnap = await getDoc(orgRef);
        return docToData<Organization>(orgSnap);
    } catch (error) {
        console.error("Error fetching organization by ID:", error);
        return null;
    }
});

export const getOrganizationByWhatsAppNumber = cache(async (phoneNumber: string): Promise<Organization | null> => {
    try {
        const orgsCol = collection(db, 'organizations');
        const q = query(orgsCol, where("settings.whatsapp.phoneNumber", "==", phoneNumber), limit(1));
        const orgSnapshot = await getDocs(q);
        if (orgSnapshot.empty) {
            return null;
        }
        return docToData<Organization>(orgSnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching organization by WhatsApp number:", error);
        return null;
    }
});

export async function updateOrganizationSettings(orgId: string, settingsUpdate: Partial<Organization['settings']>): Promise<void> {
    try {
        const orgRef = doc(db, 'organizations', orgId);
        const updates: { [key: string]: any } = {};
        for (const key in settingsUpdate) {
            updates[`settings.${key}`] = (settingsUpdate as any)[key];
        }
        
        if(Object.keys(updates).length > 0) {
          await updateDoc(orgRef, updates);
        }
    } catch (error) {
        console.error("Error updating organization settings:", error);
        throw new Error("Failed to update organization settings.");
    }
}

export async function setAuthUserClaims(uid: string, claims: object): Promise<void> {
    console.log(`[SIMULATED] Setting custom claims for user ${uid}:`, claims);
    console.log("In a production environment, this would be a call to a secure Firebase Function.");
    return Promise.resolve();
}

// Project Task Functions
export async function addTaskToProject(projectId: string, taskData: Omit<Task, 'id'>): Promise<string> {
    try {
        const tasksCol = collection(db, 'projects', projectId, 'tasks');
        const docRef = await addDoc(tasksCol, {
            ...taskData,
            dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding task to project:", error);
        throw new Error("Failed to add task.");
    }
}


export async function updateTaskInProject(projectId: string, taskId: string, updates: Partial<Task>) {
    try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        const cleanData: { [key: string]: any } = { ...updates };
        
        if (updates.dueDate) {
            cleanData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
        } else if (updates.dueDate === null) {
            cleanData.dueDate = null;
        }

        await updateDoc(taskRef, cleanData);
    } catch (error) {
        console.error("Error updating task in project:", error);
        throw new Error("Failed to update task.");
    }
}

export async function deleteTaskFromProject(projectId: string, taskId: string) {
    try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await deleteDoc(taskRef);
    } catch (error) {
        console.error("Error deleting task from project:", error);
        throw new Error("Failed to delete task.");
    }
}
