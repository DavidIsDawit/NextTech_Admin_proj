// src/components/ViewProfile.jsx  (or wherever it lives)
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildImageUrl } from "../../api/api";
import { setSecureItem } from "../../utils/storageUtils";
import { updatePassword, getMe, getUserById, uploadPhoto, updateUser } from "../../api/userApi";
import { mapBackendErrors } from "../../utils/errorHelpers";
// static profile picture lives in public/images; reference via root URL
import { LuBuilding2 } from "react-icons/lu";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import defaultAvatar from "/images/default-avatar.png";

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
    photo: defaultAvatar,
  });
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [tempPhotoFile, setTempPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // State to track the original loaded data for dirty-check (must be state, not ref,
  // so useMemo properly recomputes after a successful save updates the baseline)
  const [initialFormData, setInitialFormData] = useState(null);
  const [photoError, setPhotoError] = useState("");

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Compute whether form has changed compared to the initial snapshot
  const isProfileChanged = useMemo(() => {
    if (!initialFormData) return false;
    const editableFields = ['name', 'email', 'phoneNumber', 'employeId', 'department', 'location', 'bio', 'role'];
    return editableFields.some(key => (formData[key] ?? '') !== (initialFormData[key] ?? ''));
  }, [formData, initialFormData]);

  const handleUpdateProfile = async () => {
    if (!isProfileChanged) return;

    setIsUpdatingProfile(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
        employeId: formData.employeId,
        department: formData.department,
        role: formData.role,
      };

      const response = await updateUser(formData.userId, payload);

      // Update the baseline so the button goes disabled again after a successful save
      setInitialFormData({ ...formData });

      // Show backend success message strictly
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        toast.success(successMsg);
      }

      navigate("/");

      window.dispatchEvent(new CustomEvent("userProfileUpdated"));
    } catch (error) {
      const backendErrors = mapBackendErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      }

      // Show ONLY the backend error message
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        toast.error(backendMessage);
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
          const loadedData = {
            name: user.name || user.fullName || "",
            role: user.role || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || user.phone || "",
            employeId: user.employeId || user.employeeId || "",
            joinDate: user.createdDate || user.createdAt ? new Date(user.createdDate || user.createdAt).toLocaleDateString() : "",
            department: user.department || "",
            location: user.location || "",
            bio: user.bio || "",
            photo: user.photo || defaultAvatar,
            userId: user._id || user.id || "",
          };
          setFormData(loadedData);
          // Capture initial snapshot for dirty-check (as state so useMemo reacts to it)
          setInitialFormData({ ...loadedData });
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [passwordData, setPasswordData] = useState({
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0); // 0=none, 1=Weak, 2=Strong, 3=Very Strong

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

    // Clear the error for this field as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Password strength: 1=Weak, 2=Strong, 3=Very Strong
    if (name === "new") {
      if (!value) {
        setPasswordStrength(0);
      } else {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[^A-Za-z0-9]/.test(value);

        // Count how many character types are present
        const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

        if (value.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial) {
          setPasswordStrength(3); // Very Strong
        } else if (value.length >= 8 && (hasUpper || hasLower) && hasNumber) {
          setPasswordStrength(2); // Strong
        } else {
          setPasswordStrength(1); // Weak — under 8 chars or only one type
        }
      }
    }
  };


  const handleUpdatePassword = async () => {
    // --- Client-side validation: check ALL fields at once ---
    const validationErrors = {};


    if (!passwordData.new.trim()) {
      validationErrors.new = "New password is required.";
    } else if (passwordData.new.length < 8) {
      validationErrors.new = "Password must be at least 8 characters.";
    } else if (!/[a-zA-Z]/.test(passwordData.new) || !/[0-9]/.test(passwordData.new)) {
      validationErrors.new = "Password must contain both letters and numbers.";
    }

    if (!passwordData.confirm.trim()) {
      validationErrors.confirm = "Please confirm your new password.";
    } else if (passwordData.new && passwordData.confirm !== passwordData.new) {
      validationErrors.confirm = "Passwords do not match.";
    }

    // If any client-side errors, show them all at once and stop
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await updatePassword({
        newPassword: passwordData.new,
        password: passwordData.new,
        confirmPassword: passwordData.confirm,
        passwordConfirm: passwordData.confirm
      });
      if (response.status === "success" || response.status === 200) {
        // Backend success — strictly show backend message
        const successMsg = response?.data?.message || response?.message;
        if (successMsg) {
          toast.success(successMsg);
        }
        navigate("/");
        setSecureItem("firstTimeLogin", "false");
        setPasswordData({ new: "", confirm: "" });
        setPasswordStrength(0);
      }
    } catch (error) {
      const backendErrors = mapBackendErrors(error);
      const msg = error?.response?.data?.message;

      if (Object.keys(backendErrors).length > 0) {
        // Map backend keys to our state keys
        if (backendErrors.passwordConfirm) backendErrors.confirm = backendErrors.passwordConfirm;
        if (backendErrors.password) backendErrors.new = backendErrors.password;
        setErrors(backendErrors);
      } else if (msg) {
        // Fallback: parse the message to highlight the right field
        const lowerMsg = msg.toLowerCase();
        const fallbackErrors = {};
        if (lowerMsg.includes('confirm') || lowerMsg.includes('match')) {
          fallbackErrors.confirm = msg;
        }
        // If no specific field was matched, default to new password field
        if (Object.keys(fallbackErrors).length === 0) {
          fallbackErrors.new = msg;
        }
        setErrors(fallbackErrors);
      }

      // Always show the backend error as a toast so it's visible
      if (msg) toast.error(msg, { id: 'password-error-toast' });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoError("");
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("File size must be less than 2MB");
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
    setPhotoError("");
    try {
      const response = await uploadPhoto(formDataUpload);
      if (response.status === "success") {
        const successMsg = response?.data?.message || response?.message;
        if (successMsg) {
          toast.success(successMsg);
        }
        setFormData((prev) => ({ ...prev, photo: response.data?.photo || response.photo }));
        handleCancelPhoto();
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) toast.error(msg);
      else setPhotoError("Photo upload failed. Please try again.");
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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl  flex items-center justify-center relative">
                    {(photoPreview || formData.photo) ? (
                      <img
                        // src={
                        //   photoPreview
                        //     ? photoPreview
                        //     : formData.photo
                        //       ? buildImageUrl(formData.photo)
                        //       : defaultAvatar
                        // }

                        src={photoPreview || (formData.photo === defaultAvatar
                          ? defaultAvatar
                          : buildImageUrl(formData.photo))}

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
              {photoError && (
                <p className="text-sm text-red-500 mt-2">{photoError}</p>
              )}
            </div>

            {/* Form Sections */}
            <div className="flex flex-col space-y-2 py-2 bg-white shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-10">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Full Name <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiUser}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Designation/Role <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiBriefcase}
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={errors.role ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                    disabled
                  />
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Email Address <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiMail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Phone Number <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiPhone}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={errors.phoneNumber ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#64748B]">Employee ID <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiHash}
                    name="employeId"
                    value={formData.employeId}
                    onChange={handleInputChange}
                    className={errors.employeId ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                    disabled
                    readOnly
                  />
                  {errors.employeId && (
                    <p className="text-sm text-red-500">{errors.employeId}</p>
                  )}
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
                  <Label className="text-sm font-semibold text-[#64748B]">Department <span className="text-red-500">*</span></Label>
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
                  <Label className="text-sm font-semibold text-[#64748B]">Location <span className="text-red-500">*</span></Label>
                  <InputWithIcon
                    icon={FiMapPin}
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={errors.location ? "border-red-500" : "border-[#D1D5DB] bg-[#F9FAFB] border"}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
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
              <div className="mx-10 mb-10 mt-0 pb-8 flex justify-center">
                <Button
                  onClick={() => {
                    handleUpdateProfile();
                    // navigate("/");
                  }}
                  disabled={isUpdatingProfile || !isProfileChanged}
                  className={`px-12 h-12 rounded-xl font-bold transition-all active:scale-95 text-white ${isProfileChanged
                    ? 'bg-[#00A3E0] hover:bg-[#008cc2]'
                    : 'bg-[#00A3E0]/40 cursor-not-allowed'
                    }`}
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
                  {/* Strength Bar — 3 segments: Weak / Strong / Very Strong */}
                  {passwordData.new && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex gap-1 h-1.5 flex-1">
                        {[1, 2, 3].map((i) => {
                          let barColor = 'bg-gray-200';
                          if (passwordStrength >= i) {
                            if (passwordStrength === 1) barColor = 'bg-red-500';
                            else if (passwordStrength === 2) barColor = 'bg-yellow-400';
                            else barColor = 'bg-green-500';
                          }
                          return (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-colors duration-500 ${barColor}`}
                            />
                          );
                        })}
                      </div>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-yellow-500' :
                        passwordStrength === 3 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {passwordStrength === 1 && "Weak"}
                        {passwordStrength === 2 && "Strong"}
                        {passwordStrength === 3 && "Very Strong"}
                      </span>
                    </div>
                  )}
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
                  disabled={!passwordData.current && !passwordData.new && !passwordData.confirm}
                  className="bg-[#475569] hover:bg-[#334155] text-white px-8 h-12 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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