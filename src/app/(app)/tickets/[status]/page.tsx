
import { redirect } from 'next/navigation';

// This page is no longer used and now redirects to the main tickets page.
export default function LegacyTicketsPage() {
  redirect('/tickets');
}
