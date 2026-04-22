import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin - LinaresYa",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Si ya estas autenticado, saltate el login
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-md px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          {"\u2190"} Volver al sitio
        </Link>
        <span className="text-xs font-bold tracking-wide text-muted-foreground">ADMIN</span>
      </div>

      <div className="rounded-3xl ue-shadow bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Panel administrador</h1>
        <p className="mt-1 text-sm text-muted-foreground mb-6">
          Acceso restringido a LinaresYa.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
