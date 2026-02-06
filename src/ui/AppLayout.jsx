import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="relative grid grid-rows-[auto_1fr_auto]">
      <header className="h-16 bg-blue-400">
        <div>Header + Navbar</div>
      </header>
      <main className="h-screen">
        <Outlet />
      </main>
      <footer className="h-56 bg-neutral-500">Footer</footer>
    </div>
  );
}

export default AppLayout;
