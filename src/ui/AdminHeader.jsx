// src/ui/AdminHeader.jsx
import { useState, useRef, useEffect } from "react";
import profile from "../../public/images/Profile_pic.png";
import { User, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userItems from "../data/Userlist_data"; // ✅ Import your data
import { Mail, Lock, EyeOff, Search, ArrowDown, ArrowUp, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  // Pick current admin user (you can change this logic as needed)
  const currentUser = userItems.find((user) => user.role === "Admin") || userItems[0];

  // Load default avatar from user data
  useEffect(() => {
    if (currentUser?.image) {
      setAvatar(currentUser.image);
    }
  }, [currentUser]);

  // Refs for avatar and menu
  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  function handleAvatarClick() {
    setMenuOpen(!menuOpen);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
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
    <header className=" bg-white border rounded-lg ml-2 border-white p-4 flex justify-end lg:justify-between items-center relative">
      <div className="relative  w-1/4 hidden lg:flex  ">
                  <Search  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    id="search"
                    type="search"
                    placeholder="Search anything ...."
                    className="w-full pl-10 pr-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-gray-300"
                  />
      </div>
      <div className="flex items-center space-x-3 pr-4 hover:bg-[#D1D5DB] ">
        

        {/* Avatar */}
        <div
          ref={avatarRef}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer ml-3 relative"
          onClick={handleAvatarClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          title="Click"
        >
          {avatar ? (
            <img
              // src={avatar}
              src={profile}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover object-top"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {currentUser?.name ? currentUser.name.charAt(0) : "U"}
            </span>
          )}
        
        </div>
        
           
        <div onDrop={handleDrop} onClick={handleAvatarClick} className="flex gap-4">
          <span  className="text-lg  text-gray-800">Senior engineer</span>
          {menuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>   

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 right-3 w-60 bg-white shadow-lg  p-4 z-50 border border-gray-100"
          >
            {/* User Info */}
            {/* <div className="flex flex-col items-center mb-3">
              <img
                src={avatar}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover mb-2"
              />
              <p className="text-gray-800 font-semibold">{currentUser.name}</p>
              <p className="text-gray-500 text-sm">{currentUser.role}</p>
            </div> */}

            {/* Profile Options */}
            <div className="mt-3 space-y-2 text-gray-700">
              {/* <button
                onClick={() => navigate("/admin/View-profile")}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
              >
                <User className="w-4 h-4" /> My Profile
              </button> */}

              <button
                onClick={() => navigate("/admin/profile_setting")}
                className="flex font-bold items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-[#D1D5DB]  transition-colors"
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
