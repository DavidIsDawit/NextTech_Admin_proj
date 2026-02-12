// src/components/ViewProfile.jsx  (or wherever it lives)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api/api";
import profile from "../../public/images/Profile_pic.png"; // your static image

function ProfileSetting() {
  const navigate = useNavigate();

  // For now using static/mock data to match your screenshot exactly
  // Later → uncomment the fetch and use real API data
  const [formData, setFormData] = useState({
    fullName: "Sara Michael",
    role: "System Administrator",
    email: "saramichael@nettech.com",
    phone: "+25119999999",
    employeeId: "ENG-2024-001",
    joinDate: "2020-01-15",
    department: "Administration",
    location: "Addis Ababa, ET",
    bio: "Experienced system administrator with over 8 years of expertise in engineering content management systems. Specialized in team coordination, system optimization, and ensuring seamless operations across multiple departments.",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0); // 0-100 for bar

  // Optional: Fetch real user later (uncomment when ready)
  /*
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/getme");
        const user = res.data.user;
        setFormData({
          fullName: user.name || "",
          role: user.role || "",
          email: user.email || "",
          phone: user.phone || "",
          employeeId: user.employeeId || "",
          joinDate: user.joinDate?.split("T")[0] || "",
          department: user.department || "Administration",
          location: user.location || "Addis Ababa, ET",
          bio: user.bio || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);
  */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Simple strength simulation (you can improve with zxcvbn later)
    if (name === "new") {
      let strength = 0;
      if (value.length > 5) strength += 30;
      if (value.length > 8) strength += 20;
      if (/[A-Z]/.test(value)) strength += 15;
      if (/[0-9]/.test(value)) strength += 15;
      if (/[^A-Za-z0-9]/.test(value)) strength += 20;
      setPasswordStrength(Math.min(strength, 100));
    }
  };

  const handleSaveProfile = () => {
    // TODO: api.put("/profile", formData);
    alert("Profile changes saved! (mock)");
  };

  const handleUpdatePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (passwordData.new.length < 8) {
      alert("New password must be at least 8 characters.");
      return;
    }
    // TODO: api.post("/change-password", { current: ..., new: ... });
    alert("Password updated! (mock)");
    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordStrength(0);
  };

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto  rounded-xl  overflow-hidden">
        {/* Header / Title */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile
          </h1>
        </div> */}

        <div className="p-6 lg:p-10">
          <div className="flex flex-col  gap-10">
            
            {/* <div className="flex   items-center bg-white lg:items-start">
              <div className="flex  item-center  justify-start">
                <div className=" m-20 w-28 h-28 lg:w-32 lg:h-32  rounded-full overflow-hidden border-4  shadow-xl">
                    <img
                      src={profile}
                      alt="Sara Michael"
                      className="w-full h-full  object-cover"
                      onError={(e) => (e.target.src = "/Avatar.png")}
                    />
                </div>
             
              <div className="mt-4  text-center lg:text-left ">
                <h2 className="text-2xl font-bold text-gray-900">Sara Michael</h2>
                <p className="text-blue-600 font-medium">System Administrator</p>
                <p className="text-sm text-gray-500 mt-1">sarahmichael@nettech.com</p>
              </div>
              </div>

              <div className="flex items-center justify-end bg-blue-500">
                  <button>
                Edit Profile
              </button>
              </div>
             
            </div> */}
            <div className="flex py-10 flex-col sm:flex-row items-center  sm:items-center justify-between gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
  {/* Left: Avatar + Info */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
    {/* Avatar with camera overlay */}
    <div className="relative space-y-6 ">
      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
        <img
          src={profile}
          alt="Sara Michael"
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/Avatar.png")}
        />
      </div>

      {/* Small camera icon overlay (common in profile cards) */}
      <div className="absolute bottom-0  right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    </div>

    {/* Text info */}
    <div className="text-center sm:text-left space-y-2">
      <h2 className="text-2xl font-bold text-gray-900 pb-2">Sara Michael</h2>

      {/* Role badge */}
      <span className="inline-block mt-1.5 px-4 py-1 bg-[#E0F2FE] text-[#00A3E0] font-medium text-sm rounded-full">
        System Administrator
      </span>

      {/* Email with icon */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-gray-600 text-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span>saramichael@nexttech.com</span>
      </div>

      {/* Last login */}
      <p className="text-xs text-gray-500 mt-2">
        Last login: Dec 18, 2026 at 09:30 AM
      </p>
    </div>
  </div>

  {/* Right: Edit Profile button */}
  <button
    className="px-6 py-2.5 bg-white border-2 border-[#00A3E0] text-[#00A3E0] font-medium rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
    onClick={() => {
      // navigate to edit profile page or open modal
      // navigate("/profile/edit");
      alert("Edit profile clicked (implement navigation/modal)");
    }}
  >
    Edit Profile
  </button>
</div>

           
            <div className="flex-col space-y-6 py-10 bg-white ">
              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-10  ">
              

                <div >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation/Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white"
                  >
                    <option>Administration</option>
                    <option>Engineering</option>
                    <option>IT Support</option>
                    <option>HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                </div>

              

              {/* Bio */}
         
              </div>
              <div className="m-10 ">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / About
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none"
                />
              </div>

              <div className="flex justify-center mb-10">
                <button
                  onClick={handleSaveProfile}
                  className="px-8 py-3 bg-[#00A3E0] text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
               </div>
            </div>

          



          {/* Change Password Section */}
          <div className="mt-16 pt-10 border-t bg-white p-10 border-gray-200">
            <h2 className="text-xl   mb-6">
              Change Password
            </h2>

            <div className="flex-col space-y-6 gap-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current"
                  value={passwordData.current}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new"
                  value={passwordData.new}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="Enter new password"
                />

                {/* Strength bar */}
                <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength < 40
                        ? "bg-red-500"
                        : passwordStrength < 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={passwordData.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-start">
              <button
                onClick={handleUpdatePassword}
                className="px-8 py-3 bg-[#4A5568] text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ProfileSetting;