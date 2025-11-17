import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

  if (token?.value) {
    redirect('/dashboard');
  }

  redirect('/login');
}
