import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "sonner";
import { updatePassword } from "../api/userApi";

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await updatePassword({
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      });
      console.log("change-password response", res);
      if (res.status === "success") {
        toast.success("Password updated successfully");
        localStorage.setItem("firstTimeLogin", "false");
        navigate("/");
      }
    } catch (err) {
      console.error("change-password error", err);
      const msg = err.response?.data?.message || err.message || "Update failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
      <p className="text-sm text-gray-600 mb-6">
        As this is your first login, please choose a new password before
        continuing.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <Label htmlFor="new" className="text-sm font-semibold">
            New Password
          </Label>
          <Input
            id="new"
            name="new"
            type="password"
            value={passwordData.new}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="confirm" className="text-sm font-semibold">
            Confirm Password
          </Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            value={passwordData.confirm}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
