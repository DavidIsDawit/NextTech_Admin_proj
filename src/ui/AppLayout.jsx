// import { Outlet } from "react-router-dom";

// function AppLayout() {
//   return (
//     <div className="relative grid grid-rows-[auto_1fr_auto]">
//       <header className="h-16 bg-blue-400">
//         <div>Header + Navbar</div>
//       </header>
//       <main className="h-screen">
//         <Outlet />
//       </main>
//       <footer className="h-56 bg-neutral-500">Footer</footer>
//     </div>
//   );
// }

// export default AppLayout;
// import { Outlet } from "react-router-dom";

// function AppLayout() {
//   return (
//     <div className="relative grid grid-rows-[auto_1fr_auto]">
//       <header className="h-16 bg-blue-400">
//         <div>Header + Navbar</div>
//       </header>
//       <main className="h-screen">
//         <Outlet />
//       </main>
//       <footer className="h-56 bg-neutral-500">Footer</footer>
//     </div>
//   );
// }

// export default AppLayout;

import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#E2E8F0] bg-opacity-35">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

