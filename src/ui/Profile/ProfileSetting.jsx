// src/components/ViewProfile.jsx  (or wherever it lives)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { buildImageUrl } from "../../api/api";
import { setSecureItem, getSecureItem } from "../../utils/storageUtils";
import { updatePassword, getMe, getUserById, uploadPhoto, cleanupAuth, updateUser } from "../../api/userApi";
import { mapBackendErrors } from "../../utils/errorHelpers";
// static profile picture lives in public/images; reference via root URL
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
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [tempPhotoFile, setTempPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async () => {
    if (!formData.userId) {
      toast.error("User ID not found");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
        employeId: formData.employeId,
        department: formData.department,
        role: formData.role
      };
      if (passwordData.new) {
        payload.password = passwordData.new;
      }

      const response = await updateUser(formData.userId, payload);
      if (response.status === "success" || response.status === 200) {
        toast.success("Profile updated successfully!");
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const backendErrors = mapBackendErrors(error);
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Step 1: Get the current user's ID
        const meResponse = await getMe();

        const meUser = meResponse.user || meResponse.data?.user || null;
        const userId = meUser?.id || meUser?._id;

        if (!userId) {
          setIsLoading(false);
          return;
        }

        // Step 2: Get full user details using the ID
        const fullResponse = await getUserById(userId);

        // Best-candidate search helper
        const findUser = (obj) => {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
          let bestMatch = null, bestScore = 0;
          const score = (o) => {
            let s = 0;
            if (o.email) s += 2;
            if (o.name || o.fullName) s += 2;
            if (o.role) s += 1;
            if (o._id || o.id) s += 1;
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

        const user = findUser(fullResponse);

        if (user) {
          setFormData({
            name: user.name || user.fullName || "",
            role: user.role || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || user.phone || "",
            employeId: user.employeId || user.employeeId || "",
            joinDate: user.createdDate || user.createdAt ? new Date(user.createdDate || user.createdAt).toLocaleDateString() : "",
            department: user.department || "",
            location: user.location || "",
            bio: user.bio || "",
            photo: user.photo || "",
            userId: user._id || user.id || "",
          });
        }
      } catch (error) {
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


  const handleUpdatePassword = async () => {
    setErrors({});
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match!");
      setErrors({ confirm: "Passwords do not match" });
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("New password must be at least 8 characters.");
      setErrors({ new: "Must be at least 8 characters" });
      return;
    }

    try {
      const response = await updatePassword({
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm
      });
      if (response.status === "success" || response.status === 200) {
        toast.success("Password updated successfully!");
        setSecureItem("firstTimeLogin", "false");
        setPasswordData({ current: "", new: "", confirm: "" });
        setPasswordStrength(0);
      }
    } catch (error) {
      const responseData = error?.response?.data;

      const backendErrors = mapBackendErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        const msg = error.response?.data?.message || error.message || "Update failed";
        toast.error(msg);
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setTempPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleCancelPhoto = () => {
    setTempPhotoFile(null);
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleUploadPhoto = async () => {
    if (!tempPhotoFile) return;

    const formDataUpload = new FormData();
    formDataUpload.append("photo", tempPhotoFile);

    setIsLoading(true);
    try {
      const response = await uploadPhoto(formDataUpload);
      if (response.status === "success") {
        toast.success("Photo updated successfully!");
        setFormData((prev) => ({ ...prev, photo: response.data?.photo || response.photo }));
        handleCancelPhoto(); // Clear temp state
        // Dispatch custom event to notify other components (like AdminHeader)
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
      }
    } catch (error) {
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
    <div className="min-h-screen py-4 px-0 sm:px-6 lg:px-10">
      <div className="w-full mx-auto px-1 rounded-xl overflow-hidden">
        <div className="py-6  lg:p-10">
          <div className="flex flex-col gap-10">
            {/* Profile Header Card */}
            <div className="flex py-10 flex-col sm:flex-row items-center shadow-md sm:items-center justify-between gap-6 p-6 bg-white rounded-xl border border-gray-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar with camera overlay */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-blue-500 flex items-center justify-center relative">
                    {(photoPreview || formData.photo) ? (
                      <img
                        src={
                          photoPreview
                            ? photoPreview
                            : formData.photo
                              ? buildImageUrl(formData.photo)
                              : defaultAvatar
                        }
                        alt={formData.name || "User"}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          if (!e.target.src.endsWith(defaultAvatar)) {
                            e.target.src = defaultAvatar;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white font-bold text-4xl">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}

                    {/* Camera Overlay Strip */}
                    <div
                      onClick={() => document.getElementById("photo-upload").click()}
                      className="absolute bottom-0 left-0 right-0 h-1/4 sm:h-1/3 bg-[#FFFFFF] opacity-50  backdrop-blur-[2px] flex items-center justify-center cursor-pointer text-black hover:bg-gray-300/80 transition-colors"
                      title="Update Profile Photo"
                    >
                      <FiCamera className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
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

              {/* Action Buttons for Photo Change */}
              {tempPhotoFile && (
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <Button
                    onClick={handleUploadPhoto}
                    disabled={isLoading}
                    className="bg-[#00A3E0] hover:bg-[#008cc2] text-white h-9 px-4 rounded-lg flex items-center gap-2 transition-all active:scale-95"
                  >
                    Save Photo
                  </Button>
                  <Button
                    onClick={handleCancelPhoto}
                    variant="outline"
                    disabled={isLoading}
                    className="h-9 px-4 rounded-lg border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Form Sections */}
            <div className="flex flex-col space-y-2 py-2 bg-white shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-10">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Full Name</Label>
                  <InputWithIcon
                    icon={FiUser}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Designation/Role</Label>
                  <InputWithIcon
                    icon={FiBriefcase}
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
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
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Phone Number</Label>
                  <InputWithIcon
                    icon={FiPhone}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Employee ID</Label>
                  <InputWithIcon
                    icon={FiHash}
                    name="employeId"
                    value={formData.employeId}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Join Date</Label>
                  <InputWithIcon
                    icon={FiCalendar}
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Department</Label>
                  <div className="relative bg-[#F9FAFB]">
                    <div className="absolute  left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                      <LuBuilding2 className="w-4 h-4  " />
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
                        <SelectItem value="IT">IT</SelectItem>
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
                    className="border-[#D1D5DB] bg-[#F9FAFB] border"
                  />
                </div>
              </div>

              {/* Bio */}

              <div className="space-y-2 m-10 pb-10 ">
                <Label className="text-sm font-semibold text-[#64748B]">Bio/About</Label>
                <div className="relative">
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-[#D1D5DB] bg-[#F9FAFB] border focus:ring-[#00A3E0] rounded-xl resize-none p-4 min-h-[120px]"
                  />
                 
                </div>
                 <div className="flex justify-end  bottom-2 right-4 text-xs md:text-sm lg:text-base text-gray-400 font-medium">
                    {formData.bio.length}/500
                  </div>
              </div>
              <div className="space-y-2 mx-10 pb-4 pt-10  border-t-neutral-300 border-t " >
              </div>

              {/* Update Profile Button */}
              <div className="mx-10 mb-10 mt-0  pb-8 flex justify-center">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdatingProfile}
                  className="bg-[#00A3E0] hover:bg-[#008cc2] text-white px-12 h-12 rounded-xl font-bold transition-all active:scale-95"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
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
                    className={errors.currentPassword || errors.current ? 'border-red-500' : ''}
                  />
                  {(errors.currentPassword || errors.current) && (
                    <p className="text-xs text-red-500 mt-1">{errors.currentPassword || errors.current}</p>
                  )}
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
                    className={errors.newPassword || errors.new ? 'border-red-500' : ''}
                  />
                  {(errors.newPassword || errors.new) && (
                    <p className="text-xs text-red-500 mt-1">{errors.newPassword || errors.new}</p>
                  )}
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
                    className={errors.confirmPassword || errors.confirm ? 'border-red-500' : ''}
                  />
                  {(errors.confirmPassword || errors.confirm) && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword || errors.confirm}</p>
                  )}
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