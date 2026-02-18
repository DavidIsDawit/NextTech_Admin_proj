// src/components/ViewProfile.jsx  (or wherever it lives)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../../api/api";
import profile from "/images/Profile_pic.png"; // your static image
import { LuBuilding2 } from "react-icons/lu";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiHash,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiChevronLeft,
  FiLock
} from "react-icons/fi";

function ProfileSetting() {
  const navigate = useNavigate();

  // For now using static/mock data to match your screenshot exactly
  // Later → uncomment the fetch and use real API data
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    employeeId: "",
    joinDate: "",
    department: "",
    location: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

    const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0); // 0-100 for bar

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const handleSelectChange = (name, value) => {
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

    const InputWithIcon = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon className="w-4 h-4" />
      </div>
      <Input  className={`pl-10 h-11 border-gray-200 focus:ring-[#00A3E0] ${props.className}`} />
    </div>
  );



  const PasswordWithToggle = ({ field, icon: Icon, ...props }) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400">
        <Icon className="w-4 h-4" />
      </div>
      <Input
        
        type={showPasswords[field] ? "text" : "password"}
        className="pl-10 pr-10 h-11 border-[#D1D5DB] border focus:ring-[#00A3E0]"
      />
      <button
        type="button"
        onClick={() => togglePasswordVisibility(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPasswords[field] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-10">
      <div className="w-full mx-auto px-10  rounded-xl  overflow-hidden">
         <div className="p-6 lg:p-10">
          <div className="flex flex-col  gap-10">
            
            <div className="flex py-10 flex-col sm:flex-row items-center shadow-md sm:items-center justify-between gap-6 p-6 bg-white rounded-xl border border-gray-100">
  {/* Left: Avatar + Info */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start  gap-5">
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
          <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#00A3E0] transition-colors">
                <FiCamera className="w-5 h-5" />
          </button>      
    </div>

    {/* Text info */}
    <div className="text-center sm:text-left  space-y-2">
      <h2 className="text-2xl font-bold text-gray-900 pb-2">Sara Michael</h2>
      {/* Role badge */}
      <span className="inline-block mt-1.5 px-4 py-1 bg-[#E0F2FE] text-[#00A3E0] font-medium text-sm rounded-full">
        System Administrator
      </span>
      {/* Email with icon */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-gray-600 text-sm">
          <FiMail className="w-4 h-4" />
          <span>saramichael@nexttech.com</span>        
      </div>

      {/* Last login */}
      <p className="text-xs text-gray-500 mt-2">
        Last login: Dec 18, 2026 at 09:30 AM
      </p>
    </div>
  </div>

     <Button
            variant="outline"
            className="px-6 py-2.5 bg-white border-2 border-[#00A3E0] text-[#00A3E0] font-medium rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
          >
            Edit Profile
    </Button>
</div>           
            <div className="flex-col space-y-6 py-2 bg-white shadow-md ">
              {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-10  ">
              

            <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Full Name</Label>
                <InputWithIcon
                  icon={FiUser}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

                 <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Designation/Role</Label>
                <InputWithIcon
                  icon={FiBriefcase}
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Email Address</Label>
                <InputWithIcon
                  icon={FiMail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

                          <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Phone Number</Label>
                <InputWithIcon
                  icon={FiPhone}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

                <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Employee ID</Label>
                <InputWithIcon
                  icon={FiHash}
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

                <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Join Date</Label>
                <InputWithIcon
                  icon={FiCalendar}
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="border-[#D1D5DB] border"
                />
              </div>

                <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Department</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400 z-10">
                    <LuBuilding2 className="w-4 h-4" />
                  </div>
                  <Select
                    value={formData.department}
                    onValueChange={(val) => handleSelectChange('department', val)}
                  >
                    <SelectTrigger className="pl-10 h-11 border-[#D1D5DB] border focus:ring-[#00A3E0]">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#64748B]">Location</Label>
                <InputWithIcon
                  icon={FiMapPin}
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className ="border-[#D1D5DB] border"
                />
              </div>         
              </div>

              {/* Bio */}

              <div className="space-y-2 m-10">
              <Label className="text-sm font-semibold text-[#64748B]">Bio/About</Label>
              <div className="relative">
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="border-[#D1D5DB] border focus:ring-[#00A3E0] rounded-xl resize-none p-4 min-h-[120px]"
                />
                <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 font-medium">
                  {formData.bio.length}/500
                </div>
              </div>
            </div>

              {/* Save Button */}
            <div className="flex justify-center pt-4 pb-10">
              <Button
                onClick={handleSaveProfile}
                className="bg-[#00A3E0] hover:bg-blue-600 text-white px-12  h-12 rounded-xl text-md font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Save Changes
              </Button>
            </div>

               </div>
            </div>        


          {/* Change Password Section */}
         <div className="mt-10 pt-10 pb-10  bg-white shadow-lg space-y-8 ">
              <h2 className="text-xl font-bold text-[#1E293B] px-10">Change Password</h2>

              <div className="w-full space-y-6 px-10 ">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Current Password</Label>
                  <PasswordWithToggle
                    field="current"
                    icon={FiLock}
                    name="current"
                    value={passwordData.current}
                    className="border-[#D1D5DB] border-4"
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">New Password</Label>
                  <PasswordWithToggle
                    field="new"
                    icon={FiLock}
                    name="new"
                    value={passwordData.new}
                    className="border-[#D1D5DB] border-4"
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  {/* Strength Bar */}
                  <div className="flex gap-1 h-1.5 mt-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full bg-gray-100 transition-colors duration-500 ${passwordStrength >= i * 25 ? (passwordStrength <= 50 ? 'bg-orange-400' : 'bg-green-400') : ''
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                    {passwordStrength <= 25 && "Weak"}
                    {passwordStrength > 25 && passwordStrength <= 50 && "Medium strength"}
                    {passwordStrength > 50 && passwordStrength <= 75 && "Strong"}
                    {passwordStrength > 75 && "Very Strong"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Confirm Password</Label>
                  <PasswordWithToggle
                    field="confirm"
                    icon={FiLock}
                    name="confirm"
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleUpdatePassword}
                  className="bg-[#475569] hover:bg-[#334155] text-white px-8 h-12 rounded-xl font-bold transition-all active:scale-95"
                >
                  Update Password
                </Button>
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