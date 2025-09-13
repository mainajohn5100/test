
import { redirect } from 'next/navigation';

// This page is no longer used and redirects to the main projects page.
export default function ProjectsByStatusPage(): JSX.Element {
  redirect('/projects');
}
