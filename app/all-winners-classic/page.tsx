import type { Metadata } from 'next';
import { ClassicWinnersPage } from '@/app/components/ClassicWinnersPage';

export const metadata: Metadata = {
  title: 'Classic All Winners Layout — Golf Majors',
  description: 'A decade-grouped winners view for the four men’s golf majors.',
};

export default function Page() {
  return <ClassicWinnersPage />;
}
