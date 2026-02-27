// src/components/ViewProfile.jsx  (or wherever it lives)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL, updatePassword, getMe, buildImageUrl, cleanupAuth } from "../../api/api";
// static profile picture lives in public/images; reference via root URL
const defaultAvatar = "/images/Profile_pic.png";
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
import { toast } from "sonner";

function ProfileSetting() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phoneNumber: "",
    employeId: "",
    joinDate: "",
    department: "",
    location: "",
    bio: "",
    photo: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe();
        if (response.status === "success") {
          const user = response.user || response.data?.user;
          if (user) {
            setFormData({
              name: user.name || user.fullName || "",
              role: user.role || "",
              email: user.email || "",
              phoneNumber: user.phoneNumber || "",
              employeId: user.employeId || "",
              joinDate: user.createdDate ? new Date(user.createdDate).toLocaleDateString() : "",
              department: user.department || "",
              location: user.location || "",
              bio: user.bio || "",
              photo: user.photo || "",
              userId: user._id || user.id || "",
            });
          }
        }
      } catch (error) {
        // Error handled globally in api.js
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  const handleSaveProfile = async () => {
    if (!formData.userId) {
      toast.error("User ID not found. Please refresh.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/updateUser/${formData.userId}`, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
        employeId: formData.employeId,
        department: formData.department,
        role: formData.role,
      });

      if (response.data?.status === "success" || response.status === 200) {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Save profile error", error);
      if (error.response?.status === 403) {
        toast.error("Permission Denied: Only administrators can update profile fields (name, email, bio, etc).");
      } else {
        const msg = error.response?.data?.message || "Failed to save profile";
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    try {
      const response = await updatePassword({
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm
      });
      console.log("profile update-password response", response);
      if (response.status === "success" || response.status === 200) {
        toast.success("Password updated successfully!");
        localStorage.setItem("firstTimeLogin", "false");
        setPasswordData({ current: "", new: "", confirm: "" });
        setPasswordStrength(0);
      }
    } catch (error) {
      console.error("profile update-password error", error);
      const msg = error.response?.data?.message || error.message || "Update failed";
      toast.error(msg);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: client side size check
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("photo", file);

    setIsLoading(true);
    try {
      const response = await uploadPhoto(formDataUpload);
      if (response.status === "success") {
        toast.success("Photo uploaded successfully!");
        // Update local state with new photo path
        setFormData((prev) => ({ ...prev, photo: response.data?.photo || response.photo }));
      }
    } catch (error) {
      console.error("Photo upload error", error);
      const msg = error.response?.data?.message || "Failed to upload photo";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-10">
      <div className="w-full mx-auto px-10 rounded-xl overflow-hidden">
        <div className="p-6 lg:p-10">
          <div className="flex flex-col gap-10">
            {/* Profile Header Card */}
            <div className="flex py-10 flex-col sm:flex-row items-center shadow-md sm:items-center justify-between gap-6 p-6 bg-white rounded-xl border border-gray-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar with camera overlay */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img
                      src={
                        formData.photo
                          ? buildImageUrl(formData.photo)
                          : defaultAvatar
                      }
                      alt={formData.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/Avatar.png")}
                    />
                  </div>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <button
                    onClick={() => document.getElementById("photo-upload").click()}
                    className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#00A3E0] transition-colors"
                  >
                    <FiCamera className="w-5 h-5" />
                  </button>
                </div>

                {/* Text info */}
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 pb-2">{formData.name || "User"}</h2>
                  <span className="inline-block mt-1.5 px-4 py-1 bg-[#E0F2FE] text-[#00A3E0] font-medium text-sm rounded-full">
                    {formData.role === "admin" ? "System Administrator" : "User"}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-gray-600 text-sm">
                    <FiMail className="w-4 h-4" />
                    <span>{formData.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Member since: {formData.joinDate || "N/A"}
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

            {/* Form Sections */}
            <div className="flex flex-col space-y-6 py-2 bg-white shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-10">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Full Name</Label>
                  <InputWithIcon
                    icon={FiUser}
                    name="name"
                    value={formData.name}
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
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Employee ID</Label>
                  <InputWithIcon
                    icon={FiHash}
                    name="employeId"
                    value={formData.employeId}
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
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Department</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
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
                    className="border-[#D1D5DB] border"
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


            {/* Change Password Section */}
            <div className="mt-10 pt-10 pb-10 bg-white shadow-lg space-y-8">
              <h2 className="text-xl font-bold text-[#1E293B] px-10">Change Password</h2>

              <div className="w-full space-y-6 px-10">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Current Password</Label>
                  <PasswordWithToggle
                    field="current"
                    icon={FiLock}
                    name="current"
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    showPassword={showPasswords.current}
                    onToggle={() => togglePasswordVisibility('current')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">New Password</Label>
                  <PasswordWithToggle
                    field="new"
                    icon={FiLock}
                    name="new"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    showPassword={showPasswords.new}
                    onToggle={() => togglePasswordVisibility('new')}
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
                    showPassword={showPasswords.confirm}
                    onToggle={() => togglePasswordVisibility('confirm')}
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
        <div className="mt-8 text-center pb-8">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetting;

const InputWithIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon className="w-4 h-4" />
    </div>
    <Input {...props} className={`pl-10 h-11 border-gray-200 focus:ring-[#00A3E0] ${props.className || ''}`} />
  </div>
);

const PasswordWithToggle = ({ field, icon: Icon, showPassword, onToggle, ...props }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400">
      <Icon className="w-4 h-4" />
    </div>
    <Input
      {...props}
      type={showPassword ? "text" : "password"}
      className={`pl-10 pr-10 h-11 border-[#D1D5DB] border focus:ring-[#00A3E0] ${props.className || ''}`}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  </div>
);