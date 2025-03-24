import { Outlet } from "@remix-run/react";
import { Link } from "@remix-run/react";

export default function Layout() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">Flake Manager</h1>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-white hover:text-blue-300">
            Dashboard
          </Link>
          <Link to="/thresholds" className="text-white hover:text-blue-300">
            Thresholds
          </Link>
        </nav>
      </header>

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <footer className="flex justify-between bg-slate-800 p-4 text-white">
        <p>Flake Manager - Manage your flaky Cypress tests</p>
        <p>© 2023</p>
      </footer>
    </div>
  );
}
