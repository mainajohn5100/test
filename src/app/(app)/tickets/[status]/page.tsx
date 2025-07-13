

'use client';

import React, { useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getTicketsByStatus, getUsers } from "@/lib/firestore";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, User } from '@/lib/data';
import { setErrorMap } from 'zod';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// TypeScript interfaces
interface StatusConfig {
  dbValue: string;
  title: string;
}

interface PageParams {
  status: string;
}

interface TicketsPageProps {
  params: Promise

      
          
              
                  
              
              
                  
              
                  
              
                  
              
                  
              
                  
              
                  
              
          
      
    
  )
}
