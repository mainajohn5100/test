


import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, query, where, Timestamp, deleteDoc, updateDoc, DocumentData, QuerySnapshot, DocumentSnapshot, writeBatch, limit, orderBy, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Ticket, Project, User, Notification, TicketConversation, Organization } from './data';
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
    
    // Agent or Admin
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


export const getTicketsByProject = cache(async (projectName: string): Promise<Ticket[]> => {
    try {
        // This function may need org context if project names are not unique across orgs.
        // For now, assuming project names are unique enough for this context.
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
  if (!user || !user.organizationId) return [];

  const projectsCol = collection(db, 'projects');
  const orgQuery = where("organizationId", "==", user.organizationId);

  // Clients can only see projects associated with tickets they've reported.
  if (user.role === 'Client') {
      try {
          const clientTickets = await getTicketsByReporter(user.name);
          if (clientTickets.length === 0) return [];
          
          const projectNames = [...new Set(clientTickets.map(t => t.project).filter(Boolean))];
          if (projectNames.length === 0) return [];

          const q = query(projectsCol, orgQuery, where("name", "in", projectNames));
          const projectSnapshot = await getDocs(q);
          return snapshotToData<Project>(projectSnapshot);

      } catch (error) {
          console.error("Error fetching projects for client:", error);
          return [];
      }
  }

  // Admins and Agents see projects they manage or are on the team for.
  try {
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
    if (!user || !user.organizationId) return [];
    
    const projectsCol = collection(db, 'projects');
    const orgQuery = where("organizationId", "==", user.organizationId);
    const statusFilter = status !== 'all' ? [where("status", "==", status)] : [];

    // Clients can only see projects associated with tickets they've reported.
    if (user.role === 'Client') {
        try {
            const clientTickets = await getTicketsByReporter(user.name);
            if (clientTickets.length === 0) return [];
            
            const projectNames = [...new Set(clientTickets.map(t => t.project).filter(Boolean))];
            if (projectNames.length === 0) return [];

            const q = query(projectsCol, orgQuery, where("name", "in", projectNames));
            const projectSnapshot = await getDocs(q);

            return snapshotToData<Project>(projectSnapshot);

        } catch (error) {
            console.error("Error fetching projects for client:", error);
            return [];
        }
    }

    // Logic for Admins and Agents
    try {
        const managerQuery = query(projectsCol, orgQuery, where("manager", "==", user.id), ...statusFilter);
        const teamMemberQuery = query(projectsCol, orgQuery, where("team", "array-contains", user.id), ...statusFilter);
        
        const [managerSnap, teamSnap] = await Promise.all([
            getDocs(managerQuery),
            getDocs(teamMemberQuery)
        ]);

        const projectsMap = new Map<string, Project>();
        snapshotToData<Project>(managerSnap).forEach(p => projectsMap.set(p.id, p));
        snapshotToData<Project>(teamSnap).forEach(p => projectsMap.set(p.id, p));
        
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

export async function createUserInFirestore(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, userData);
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

export async function addTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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

export async function addConversation(ticketId: string, conversationData: Omit<TicketConversation, 'id' | 'createdAt'>): Promise<string> {
    try {
        const conversationCol = collection(db, 'tickets', ticketId, 'conversations');
        const docRef = await addDoc(conversationCol, {
            ...conversationData,
            createdAt: serverTimestamp(),
        });
        // Also update the parent ticket's updatedAt timestamp
        const ticketRef = doc(db, 'tickets', ticketId);
        await updateDoc(ticketRef, { updatedAt: serverTimestamp() });
        return docRef.id;
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
    creatorId: string;
    organizationId: string;
}): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            status: 'New',
            createdAt: serverTimestamp(),
            ticketsEnabled: true,
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
