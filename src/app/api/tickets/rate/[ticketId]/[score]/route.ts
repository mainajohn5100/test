import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string; score: string } }
) {
  const { ticketId, score } = params;
  const rating = parseInt(score, 10);

  if (!ticketId || isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid ticket ID or score.' }, { status: 400 });
  }

  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    const ticket = ticketSnap.data() as Ticket;

    // To prevent duplicate ratings, check if a score has already been submitted.
    if (ticket.csatStatus === 'rated') {
        const url = new URL('/thank-you?message=already_rated', request.url);
        return NextResponse.redirect(url);
    }
    
    await updateDoc(ticketRef, {
      csatScore: rating,
      csatStatus: 'rated',
    });

    const url = new URL('/thank-you', request.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Error recording CSAT score:', error);
    const url = new URL('/error', request.url);
    return NextResponse.redirect(url);
  }
}
