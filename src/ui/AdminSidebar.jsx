import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NextTech_logo from "/NextTech_logo.png";
import Logout from "/images/Logout.png";
import currency from "/images/Currency.png";
import portfolio from "/images/portfolio_logo.png";
import Dashboard from "/images/Dashboard.png";
import Gallary from "/images/Gallary.png";
import Images from "/images/Images_logo.png";
import videos from "/images/Videos_logo.png";

// Inline menu configurations
const menuItems = [
  { title: "Counter", path: "/admin/counter", icon: "/images/Counter.png" },
  { title: "Partner", path: "/admin/partner", icon: "/images/partner.png" },
  { title: "FAQ", path: "/admin/faq", icon: "/images/FAQ.png" },
  { title: "Testimonial", path: "/admin/testimonial", icon: "/images/Testimonial.png" },
  { title: "Team", path: "/admin/team", icon: "/images/partner.png" },
  { title: "Project", path: "/admin/project", icon: "/images/Project.png" },
  { title: "Blog", path: "/admin/blog", icon: "/images/Blog.png" },
  { title: "Job", path: "/admin/job", icon: "/images/Blog.png" },
  { title: "Industry", path: "/admin/industry", icon: "/images/Blog.png" }
];

const gamenuItems = [
  { title: "Services", path: "/admin/gacounter", icon: "/images/Counter.png" },
  { title: "Partner Management", path: "/admin/ga_blog", icon: "/images/Blog.png" },
  { title: "FAQ", path: "/admin/ga_faq", icon: "/images/FAQ.png" },
  { title: "Certificate", path: "/admin/certificate", icon: "/images/Blog.png" },
  { title: "Testimonial", path: "/admin/gatestimonial", icon: "/images/Testimonial.png" },
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

  const GallaryItems = [
    { title: "Images", path: "/admin/image", icon: Images },
    { title: "Videos", path: "/admin/video", icon: videos },
  ];

  // Handle logout function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Get the access token from localStorage or wherever it's stored
      const accessToken = localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        getCookie("accessToken");

      // Call logout endpoint with Authorization header
      const response = await api.post(
        "/user/logout",
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true // Important for cookies
        }
      );

      if (response.data.status === "success") {
        // Clear all client-side storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear any remaining cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          // Clear the cookie by setting expiry to past
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        });

        // Reset API default headers if needed
        if (api.defaults.headers.common['Authorization']) {
          delete api.defaults.headers.common['Authorization'];
        }

        // Redirect to login page
        navigate("/admin/login");
      } else {
        console.error("Logout failed:", response.data.message);
        // Fallback to manual logout even if API fails
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to manual logout on error
      localStorage.clear();
      sessionStorage.clear();
      navigate("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
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
      <div className="lg:hidden fixed  top-0 left-0 z-50 flex h-20 items-start justify-between p-4">

        <button
          onClick={() => { setMobileOpen(true); navigate("/admin"); }}
          className="text-gray-700 focus:outline-none"

          disabled={isLoggingOut}
        >
          <img src={NextTech_logo} alt="NextTech_logo" className="h-10 w-12" />
        </button>

        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-700 md:px-10 px-3 focus:outline-none"
          disabled={isLoggingOut}
        >
          <Menu className="h-10 w-6" />
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B162C] border-r border-gray-200 flex flex-col overflow-y-auto transform transition-transform duration-300 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-gray-200">
          <button
            className=" text-gray-700"
            onClick={() => { setMobileOpen(false); navigate("/admin"); }}
            disabled={isLoggingOut}
          >
            <img
              src={NextTech_logo}
              alt="NextTech_logo"
              className="2xl:h-24 2xl:w-28 xl:h-24 xl:w-28 lg:h-20 lg:w-24 md:h-16 md:w-20 h-14 w-16"
            />
          </button>

          <button
            className="lg:hidden text-gray-700"
            onClick={() => setMobileOpen(false)}
            disabled={isLoggingOut}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 🔹 Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Dashboard */}
          {isSuperAdmin && (
            <NavLink to="/admin" end
              onClick={() => setMobileOpen(false)}>
              {({ isActive }) => (
                <div
                  className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-[#136ECA] text-white"
                    : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
                    }`}
                >
                  <img
                    src={Dashboard}
                    alt="Dashboard"
                    className={`h-4 w-4 mr-3 object-contain transition filter ${isActive ? "invert" : "invert group-hover:invert"
                      }`}
                  />
                  Dashboard
                </div>
              )}
            </NavLink>
          )}

          {/* GA Engineering */}
          {gamenuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-[#136ECA] text-white"
                  : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={`h-4 w-4 mr-3 object-contain transition filter ${item.title === "Counter"
                      ? isActive
                        ? "invert-0"
                        : "invert-0 group-hover:invert-0"
                      : isActive
                        ? "invert"
                        : " invert group-hover:invert"
                      }`}
                  />
                  {item.title}
                </>
              )}
            </NavLink>
          ))}
          <div>
            <button
              onClick={() => setUserManagementOpen(!userManagementOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-[#1A2332] hover:text-[#FFFFFF] transition-colors"
              disabled={isLoggingOut}
            >
              <div className="flex items-center">
                <img
                  src={Gallary}
                  alt="Gallary"
                  className="h-4 w-4 mr-3 object-contain transition filter invert group-hover:invert"
                />
                Gallery
              </div>
              {userManagementOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {userManagementOpen && (
              <div className="pl-8 space-y-1">
                {GallaryItems.map((subItem) => (
                  <NavLink
                    key={subItem.title}
                    to={subItem.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex group items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "text-white bg-[#136ECA]"
                        : "text-gray-600 hover:bg-[#1A2332] hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <img
                          src={subItem.icon}
                          alt={subItem.title}
                          className={`h-4 w-4 mr-3 object-contain transition filter ${isActive ? "invert-0" : "invert group-hover:invert"
                            }`}
                        />
                        {subItem.title}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Portfolio */}
            <NavLink to="/admin/portfolio"
              onClick={() => setMobileOpen(false)}>
              {({ isActive }) => (
                <div
                  className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-[#136ECA] text-white"
                    : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
                    }`}
                >
                  <img
                    src={portfolio}
                    alt="Portfolio"
                    className={`h-4 w-4 mr-3 object-contain transition filter ${isActive ? "invert-0" : "invert group-hover:invert"}`}
                  />
                  Portfolio
                </div>
              )}
            </NavLink>
          </div>
          {/* GA Soft */}
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-[#136ECA] text-white"
                  : "text-[#9CA3AF] hover:bg-[#136ECA] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={`h-4 w-4 mr-3 object-contain transition filter ${item.title === "Counter"
                      ? isActive
                        ? "invert-0"
                        : "invert group-hover:invert-0"
                      : isActive
                        ? "invert"
                        : "invert-0 group-hover:invert"
                      }`}
                  />
                  {item.title}
                </>
              )}
            </NavLink>
          ))}

          <NavLink to="/admin/currency"
            onClick={() => setMobileOpen(false)}>
            {({ isActive }) => (
              <div
                className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-[#136ECA] text-white"
                  : "text-gray-600 hover:bg-[#136ECA] hover:text-white"
                  }`}
              >
                <img
                  src={currency}
                  alt="Currency"
                  className={`h-4 w-4 mr-3 object-contain transition filter ${isActive ? "invert" : "invert-0 group-hover:invert"
                    }`}
                />
                Currency
              </div>
            )}
          </NavLink>





          {/* User Management (Super Admin only) */}
          {/* {isSuperAdmin && (
            <div>
              <button
                onClick={() => setUserManagementOpen(!userManagementOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                disabled={isLoggingOut}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3" />
                  User Management
                </div>
                {userManagementOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {userManagementOpen && (
                <div className="pl-8 space-y-1">
                  {userManagementItems.map((subItem) => (
                    <NavLink
                      key={subItem.title}
                      to={subItem.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                          ? "text-white bg-[#136ECA]"
                          : "text-gray-600 hover:bg-[#136ECA] hover:text-white"
                        }`
                      }
                    >
                      <subItem.icon className="h-4 w-4 mr-3" />
                      {subItem.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )} */}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isLoggingOut
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-[#9CA3AF] hover:bg-[#1A2332] hover:text-white"
              }`}
          >
            <img
              src={Logout}
              alt="Logout"
              className={`h-4 w-4 mr-3 object-contain transition filter ${isLoggingOut ? "opacity-50" : "invert group-hover:invert"
                }`}
            />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
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