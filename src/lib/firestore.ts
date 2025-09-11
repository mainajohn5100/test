

import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, query, where, Timestamp, deleteDoc, updateDoc, DocumentData, QuerySnapshot, DocumentSnapshot, writeBatch, limit, orderBy, setDoc, or, arrayUnion,getCountFromServer } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Ticket, Project, User, Notification, TicketConversation, Organization, Task, SLAPolicy } from './data';
import { cache } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail as firebaseSendPasswordResetEmail, sendEmailVerification as firebaseSendVerificationEmail, User as FirebaseUser } from 'firebase/auth';
import { addHours, differenceInMinutes } from 'date-fns';

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

export const getOpenTicketsByUserId = cache(async (userId: string): Promise<Ticket[]> => {
    console.log(`Searching for open tickets for user ID: ${userId}`);
    if (!userId) {
        console.error("getOpenTicketsByUserId called with no userId.");
        return [];
    }

    try {
        const ticketsCol = collection(db, 'tickets');
        const q = query(
            ticketsCol,
            where("reporterId", "==", userId),
            where("status", "in", ['New', 'Active', 'Pending', 'On Hold'])
        );
        
        const ticketSnapshot = await getDocs(q);
        const tickets = snapshotToData<Ticket>(ticketSnapshot);
        
        console.log(`Found ${tickets.length} open ticket(s) for user ${userId}.`);
        
        // Sort by most recently updated to get the most active conversation
        if (tickets.length > 1) {
            tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }

        return tickets;
    } catch (error) {
        console.error(`Error fetching open tickets by user ID ${userId}:`, error);
        return [];
    }
});


export const getTicketsByProject = cache(async (projectId: string): Promise<Ticket[]> => {
    try {
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

export const getActionableSlaTickets = cache(async (): Promise<Ticket[]> => {
  try {
    const ticketsCol = collection(db, 'tickets');
    
    // Fetch all tickets that are active and have an SLA policy applied.
    // The previous logic was flawed because it didn't fetch tickets that had already breached.
    const q = query(
        ticketsCol,
        where("status", "in", ['New', 'Active', 'Pending']),
        // We only need to know that resolutionDue is set, not its value.
        // A simple inequality check works well for this "existence" check.
        where("resolutionDue", "!=", null) 
    );
    const ticketSnapshot = await getDocs(q);
    
    return snapshotToData<Ticket>(ticketSnapshot);

  } catch (error) {
    console.error("Error fetching actionable SLA tickets:", error);
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

interface UserFilter {
    organizationId?: string;
    role?: string;
  }
  
  export const getUsers = cache(async (filter: UserFilter = {}): Promise<User[]> => {
    try {
      if (!filter.organizationId) return [];
      
      const usersCol = collection(db, 'users');
      const queries = [where("organizationId", "==", filter.organizationId)];
  
      if (filter.role) {
        queries.push(where("role", "==", filter.role));
      }
  
      const q = query(usersCol, ...queries);
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
        // Since there is no auth user, we create a doc with a new ID
        const newUserRef = doc(collection(db, "users"));
        await setDoc(newUserRef, {
            ...userData,
            status: userData.status || 'active',
            lastSeen: serverTimestamp(),
        });
        return newUserRef.id;
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
    const org = await getOrganizationById(ticketData.organizationId);
    const slaPolicy = org?.settings?.slaPolicies?.[0]; // Get the first (default) policy
    
    let slaFields = {};
    if (slaPolicy) {
      const target = slaPolicy.targets.find(t => t.priority === ticketData.priority);
      if (target) {
        const now = new Date();
        slaFields = {
          slaPolicyId: slaPolicy.id,
          firstResponseDue: addHours(now, target.firstResponseHours).toISOString(),
          resolutionDue: addHours(now, target.resolutionHours).toISOString(),
        }
      }
    }

    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticketData,
      ...slaFields,
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clientCanReply: true,
      reporterId: ticketData.reporterId || null,
      reporterPhone: ticketData.reporterPhone || null,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ticket:", error);
    throw new Error("Failed to create ticket.");
  }
}

export async function addConversation(
    ticketId: string, 
    conversationData: Partial<Omit<TicketConversation, 'id' | 'createdAt'>>
): Promise<string> {
    if (!conversationData.authorId || (!conversationData.content && (!conversationData.attachments || conversationData.attachments.length === 0))) {
        throw new Error("Author ID and content or attachments are required to add a conversation.");
    }

    const ticketRef = doc(db, 'tickets', ticketId);
    const conversationCol = collection(ticketRef, 'conversations');
    
    // Look up author name if not provided.
    let authorName = conversationData.authorName;
    if (!authorName) {
        const author = await getUserById(conversationData.authorId);
        if (author) {
            authorName = author.name;
        } else {
            throw new Error(`Author with ID ${conversationData.authorId} not found.`);
        }
    }

    const newConversation: Omit<TicketConversation, 'id' | 'createdAt'> = {
        authorId: conversationData.authorId,
        authorName: authorName,
        content: conversationData.content || '',
        createdAt: new Date().toISOString(),
        attachments: conversationData.attachments || [],
    };
    
    // Add the new message to the sub-collection
    const docRef = await addDoc(conversationCol, {
        ...newConversation,
        createdAt: serverTimestamp()
    });
    
    // Also, update the main ticket's `updatedAt` field and status if needed.
    const ticket = await getTicketById(ticketId);
    if (!ticket) throw new Error("Ticket not found for update.");
    
    const author = await getUserById(newConversation.authorId);
    const updates: { [key: string]: any } = {
        updatedAt: serverTimestamp(),
    };
    
    if (author?.role === 'Client') {
        if (ticket.status === 'Pending' || ticket.status === 'On Hold') {
            updates.status = 'Active';
            updates.statusLastSetBy = 'Client';
        }
    } else if (author?.role === 'Admin' || author?.role === 'Agent') {
        if (ticket.status === 'New') {
            updates.status = 'Active';
            updates.statusLastSetBy = author.role;
        }
    }
    
    await updateDoc(ticketRef, updates);

    return docRef.id;
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

export const getOrganizationBySubdomain = cache(async (subdomain: string): Promise<Organization | null> => {
    try {
        const orgsCol = collection(db, 'organizations');
        const q = query(orgsCol, where("subdomain", "==", subdomain), limit(1));
        const orgSnapshot = await getDocs(q);
        if (orgSnapshot.empty) {
            return null;
        }
        return docToData<Organization>(orgSnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching organization by subdomain:", error);
        return null;
    }
});

export async function updateOrganization(orgId: string, data: Partial<Omit<Organization, 'id' | 'settings'>>): Promise<void> {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    if (Object.keys(cleanData).length > 0) {
        await updateDoc(orgRef, cleanData);
    }
  } catch (error) {
    console.error("Error updating organization:", error);
    throw new Error("Failed to update organization.");
  }
}

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

export async function sendPasswordResetEmail(email: string) {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email.");
    }
}

export async function sendVerificationEmail(userId: string) {
    const user = auth.currentUser;
    // This check is important because createUserWithEmailAndPassword auto-signs-in the user.
    // We need to ensure the user we're acting on is the one we just created.
    if (user && user.uid === userId) {
        await firebaseSendVerificationEmail(user);
    } else {
        // This case should ideally not happen in the signup flow.
        console.warn("Could not send verification email: current user does not match new user.");
    }
}

// Superadmin Functions
export async function getAllOrganizations(): Promise<Organization[]> {
    const orgsCol = collection(db, 'organizations');
    const orgSnapshot = await getDocs(orgsCol);
    return snapshotToData<Organization>(orgSnapshot);
}

export async function getUsersForOrganization(orgId: string): Promise<User[]> {
    if (!orgId) return [];
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("organizationId", "==", orgId));
    const userSnapshot = await getDocs(q);
    return snapshotToData<User>(userSnapshot);
}

export async function getUserCountForOrganization(orgId: string, role: User['role']): Promise<number> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("organizationId", "==", orgId), where("role", "==", role));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

export async function getProjectCountForOrganization(orgId: string): Promise<number> {
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, where("organizationId", "==", orgId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}


export async function getPrimaryAdminForOrganization(orgId: string): Promise<User | null> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("organizationId", "==", orgId), where("role", "==", "Admin"), orderBy("createdAt", "asc"), limit(1));
    const userSnapshot = await getDocs(q);
     if (userSnapshot.empty) {
        return null;
    }
    return docToData<User>(userSnapshot.docs[0]);
}

export async function updateOrganizationBySuperAdmin(orgId: string, data: Partial<Organization>): Promise<void> {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    if (Object.keys(cleanData).length > 0) {
        await updateDoc(orgRef, cleanData);
    }
  } catch (error) {
    console.error("Error updating organization (superadmin):", error);
    throw new Error("Failed to update organization.");
  }
}
