// src/ui/AdminHeader.jsx
import { useState, useRef, useEffect } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMe, getUserById } from "../api/userApi";
import { buildImageUrl } from "../api/api";

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  // Fetch the logged-in user from the backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Step 1: Get user ID from getMe
        const meRes = await getMe();
        const meUser = meRes.user || meRes.data?.user || null;
        const userId = meUser?.id || meUser?._id;

        if (userId) {
          // Step 2: Get full user details (including name)
          const fullRes = await getUserById(userId);
          console.log("AdminHeader full response:", fullRes);

          const findUser = (obj) => {
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
            let bestMatch = null, bestScore = 0;
            const score = (o) => {
              let s = 0;
              if (o.email) s += 2;
              if (o.name || o.fullName) s += 2;
              if (o.role) s += 1;
              return s;
            };
            const traverse = (o) => {
              const s = score(o);
              if (s > bestScore) { bestScore = s; bestMatch = o; }
              for (const k in o) if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) traverse(o[k]);
            };
            traverse(obj);
            return bestScore >= 3 ? bestMatch : null;
          };

          const user = findUser(fullRes);
          if (user) {
            setUserName(user.name || user.fullName || "");
            setUserRole(user.role || "");
            if (user.photo) setAvatar(buildImageUrl(user.photo));
          }
        }
      } catch (err) {
        console.error("AdminHeader fetch error:", err);
      }
    };

    fetchUser();

    // Listen for profile updates from other components
    window.addEventListener('userProfileUpdated', fetchUser);
    return () => window.removeEventListener('userProfileUpdated', fetchUser);
  }, []);

  function handleAvatarClick() {
    setMenuOpen((prev) => !prev);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuOpen &&
        menuRef.current &&
        avatarRef.current &&
        !menuRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="bg-white shadow-sm rounded-lg ml-2 border-black p-4 flex justify-end lg:justify-between items-center relative">
      {/* Search bar */}
      <div className="relative w-1/4 hidden lg:flex">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          id="search"
          type="search"
          placeholder="Search anything ...."
          className="w-full pl-10 pr-4 py-1 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {/* Avatar + name */}
      <div className="flex items-center space-x-3 mr-8 hover:bg-[#D1D5DB] rounded-md">
        {/* Avatar circle */}
        <div
          ref={avatarRef}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer ml-1 relative overflow-hidden"
          onClick={handleAvatarClick}
          title="Profile"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="w-full h-full rounded-full object-cover object-top"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </span>
          )}
        </div>

        {/* Name + role + chevron */}
        <div onClick={handleAvatarClick} className="flex gap-4 cursor-pointer">
          <div className="flex flex-col leading-tight">
            {userName && (
              <span className="text-base font-semibold text-gray-800">{userName}</span>
            )}
            <span className="text-sm text-gray-500">{userRole || "Senior Engineer"}</span>
          </div>
          {menuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 right-14 w-52 bg-white shadow-lg px-4 z-50 border border-gray-100"
          >
            <div className="mt-3 space-y-2 text-gray-700">
              <button
                onClick={() => { setMenuOpen(false); navigate("/admin/profile_setting"); }}
                className="flex font-bold items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-[#D1D5DB] transition-colors"
              >
                Profile Setting
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
