import { SignIn } from '@clerk/nextjs';
import { Logo } from '@/components/logo';

export default function SignInPage() {
  return (
    <main className="safe-top safe-bottom flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-4 py-12">
      <Logo />
      <SignIn />
    </main>
  );
}
