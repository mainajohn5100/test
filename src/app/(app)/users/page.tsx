

'use client';

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/firestore";
import type { User } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { Loader, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (currentUser?.role === 'Admin') {
      const fetchUsers = async () => {
          setLoading(true);
          try {
              const usersData = await getUsers(currentUser);
              setUsers(usersData);
          } catch (error) {
              console.error("Failed to fetch users:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchUsers();
    } else if (currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading || !currentUser) {
    return (
      
          
      
    );
  }

  if (currentUser.role !== 'Admin') {
    return (
      
          
              
              Access Denied
              You do not have permission to view this page.
              
                  Return to Dashboard
              
          
      
    );
  }

  return (
    
      
        
            
                User Accounts Management
                View all user accounts in the system. New users can be created via the signup page.
            
        
        
            
                
                    Users
                    Here is a list of all users in the system. Click a user to view their profile.
                
                
                    
                        
                            
                            
                            
                        
                        
                            
                                
                                    
                                        
                                            
                                            
                                        
                                        
                                    
                                
                                
                                
                            
                            
                                
                                
                            
                            
                                
                                
                            
                        
                    
                    
                        
                            
                                
                                    
                                        
                                            
                                            
                                        
                                        
                                            
                                        
                                        
                                    
                                
                                
                                
                            
                            
                                
                                    
                                
                            
                            
                                
                            
                        
                    
                    
                        
                            
                                No users found.
                            
                        
                    
                
            
        
    
  );
}
