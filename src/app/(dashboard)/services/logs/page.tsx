import { redirect } from 'next/navigation';

export default function LogsIndexPage() {
  redirect('/services/logs/all');
}
