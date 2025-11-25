import { redirect } from 'next/navigation';

// Sign-up is disabled - users are invited via Clerk by admin
export default function SignUpPage() {
  redirect('/sign-in');
}
