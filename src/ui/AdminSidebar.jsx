import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NextTech_logo from "/NextTech_logo.png";
import Logout from "/images/Logout.png";
import Dashboard from "/images/Dashboard.png";
import Gallary from "/images/Gallary.png";
import Images from "/images/Images_logo.png";
import videos from "/images/Videos_logo.png";
import {Button} from "@/ui/button"

// Inline menu configurations
// const menuItems = [
 
// ];

const gamenuItems = [
   { title: "Services", path: "/admin/services", icon: "/images/Services.png" },
   { title: "Partner Management", path: "/admin/partners", icon: "/images/partner.png" },
   { title: "Projects", path: "/admin/projects", icon: "/images/Project.png" },
   { title: "Gallery", path: "/admin/gallery", icon: "/images/Gallary.png" },
   { title: "Certificates", path: "/admin/certificates", icon: "/images/certificate.png" },
   { title: "Team Management", path: "/admin/teams", icon: "/images/team_page.jpg" },
   { title: "News", path: "/admin/news", icon: "/images/News.png" },
   { title: "FAQ", path: "/admin/faqs", icon: "/images/FAQ.png" },
   { title: "Counter", path: "/admin/counters", icon: "/images/Counter.png" },
   { title: "Testimonial", path: "/admin/testimonials", icon: "/images/Testimonial.png" },
];

const getUserRole = () => {
  return localStorage.getItem("userRole") || null;
};
import {
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import api from "../api/api"; // Import your API instance

const AdminSidebar = () => {
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gaSoftOpen, setGaSoftOpen] = useState(false);
  const [gaEngOpen, setGaEngOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const role = getUserRole();
  const isSuperAdmin = role === "Admin";
  const isGAEng = role === "GaUser" || isSuperAdmin;
  const isGASoft = role === "SoftUser" || isSuperAdmin;

  const userManagementItems = [
    { title: "Users", path: "/admin/users", icon: Users },
  ]; 

  // Handle logout function
  // const handleLogout = async () => {
  //   try {
  //     setIsLoggingOut(true);

  //     // Get the access token from localStorage or wherever it's stored
  //     const accessToken = localStorage.getItem("accessToken") ||
  //       sessionStorage.getItem("accessToken") ||
  //       getCookie("accessToken");

  //     // Call logout endpoint with Authorization header
  //     const response = await api.post(
  //       "/user/logout",
  //       {}, // Empty body
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true // Important for cookies
  //       }
  //     );

  //     if (response.data.status === "success") {
  //       // Clear all client-side storage
  //       localStorage.clear();
  //       sessionStorage.clear();

  //       // Clear any remaining cookies
  //       document.cookie.split(";").forEach(cookie => {
  //         const eqPos = cookie.indexOf("=");
  //         const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  //         // Clear the cookie by setting expiry to past
  //         document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  //       });

  //       // Reset API default headers if needed
  //       if (api.defaults.headers.common['Authorization']) {
  //         delete api.defaults.headers.common['Authorization'];
  //       }

  //       // Redirect to login page
  //       navigate("/admin/login");
  //     } else {
  //       console.error("Logout failed:", response.data.message);
  //       // Fallback to manual logout even if API fails
  //       localStorage.clear();
  //       sessionStorage.clear();
  //       navigate("/admin/login");
  //     }
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     // Fallback to manual logout on error
  //     localStorage.clear();
  //     sessionStorage.clear();
  //     navigate("/admin/login");
  //   } finally {
  //     setIsLoggingOut(false);
  //   }
  // };
  const handleLogout = function(){
     navigate("/admin/login");
  };

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  return (
    <>
      {/* 🔹 Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 z-50 flex h-20 items-start justify-between p-4">

        <Button
          variant="ghost"
          onClick={() => { setMobileOpen(true); navigate("/"); }}
          className="text-gray-700 focus:outline-none"
          disabled={isLoggingOut}
        >
           <img src={NextTech_logo} alt="NextTech_logo" className="h-10 w-full" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => setMobileOpen(true)}
          className="text-gray-700 md:px-10 px-3 focus:outline-none"
          disabled={isLoggingOut}
        >
          <Menu className="h-10 w-6" />
        </Button>
       
      </div>

      {/* 🔹 Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B162C] border-r border-gray-200 flex flex-col overflow-y-auto transform transition-transform duration-300 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className="pt-8 pb-2 flex  items-center justify-between border-gray-200">
        
          <Button
            variant="ghost"
            className=" text-gray-700"
            onClick={() => { setMobileOpen(false); navigate("/"); }}
            disabled={isLoggingOut}
          >
               <img
              src={NextTech_logo}
              alt="NextTech_logo"
              className="2xl:h-24 2xl:w-full xl:h-24 xl:w-full lg:h-20 lg:w-full md:h-16 md:w-full h-14 w-full"
            />
          </Button>

          <Button
          variant="ghost"
          className="lg:hidden text-[#9CA3AF]"
          onClick={() => setMobileOpen(false)}
          disabled={isLoggingOut}
          >
            <X className="h-6 w-6" />
         </Button>
        </div>

        {/* 🔹 Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Dashboard */}
         
            <NavLink to="/" end
              onClick={() => setMobileOpen(false)}>
              {({ isActive }) => (
                <div
                  className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "border-l-[#136ECA] border-l-4   text-white"
                      : "text-[#9CA3AF]  hover:bg-[#1A2332] hover:text-white"
                    }`}
                >
                  <img
                    src={Dashboard}
                    alt="Dashboard"
                    className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7 mr-3 object-contain transition filter ${isActive
                       ?  "brightness-200 contrast-125" 
    : "brightness-100 group-hover:brightness-150"
                      }`}
                  />
                    Dashboard
                </div>
              )}
            </NavLink>         
       
                  {gamenuItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.path}
                      end
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `group flex gap-4 items-center px-3 py-2 rounded-lg text-sm  lg:text-base font-medium transition-colors ${isActive
                          ? "border-l-[#136ECA] border-l-4 text-white"
                          : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <img
                            src={item.icon}
                            alt={item.title}
                            className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7 object-contain transition filter ${isActive
                                  ?  "brightness-200 contrast-125" 
    : "brightness-100 group-hover:brightness-150" }`}
                          />
                          {item.title}
                        </>
                      )}
                    </NavLink>
                  ))}         
        </nav>

        {/* Logout Button */}
        <div className="p-4  ">
        <Button
  variant="ghost"                    // clean, minimal look like your original
  className={`
    w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium
    ${isLoggingOut 
      ? "border-l-4 border-[#136ECA] text-white cursor-not-allowed bg-[#1A2332]/80" 
      : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
    }
  `}
  disabled={isLoggingOut}
  onClick={handleLogout}
>
            <img
              src={Logout}
              alt="Logout"
              className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7  object-contain transition filter ${isLoggingOut ?  "brightness-200 contrast-125" 
              :"brightness-100 group-hover:brightness-150 "
                }`}
            />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button> 
          
        </div>
      </div>

      {/* 🔹 Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => !isLoggingOut && setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;