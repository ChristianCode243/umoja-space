// Login page (server component) rendering the client login form.
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-8">
      <LoginForm />
    </section>
  );
}
