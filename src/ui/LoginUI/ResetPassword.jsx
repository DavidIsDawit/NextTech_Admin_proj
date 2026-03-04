import { Lock, EyeOff, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { useState } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/userApi";
import { toast } from "sonner";

const Login_pic = "/images/Login_pic.png";
const NextTech_logo = "/NextTech_logo.png";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error("Both password fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, { newPassword, confirmPassword });
            if (res.status === "success") {
                setSuccess(true);
                toast.success("Password reset successfully!");
                setTimeout(() => navigate("/admin/login"), 3000);
            } else {
                toast.error(res.message || "Failed to reset password");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex justify-between h-[90vh]">
            <div className="max-md:absolute max-md:inset-0 max-md:w-full w-2/3 h-[100vh] overflow-hidden">
                <div className="absolute left-10 top-20 -translate-y-1/2 z-10 flex flex-col items-start justify-start text-white">
                    <img
                        src={NextTech_logo}
                        alt="NextTech_logo"
                        className="2xl:h-16 2xl:w-full xl:h-14 xl:w-full lg:h-12 lg:w-full md:h-11 md:w-full h-10 w-full brightness-150 contrast-125"
                    />
                </div>

                <div className="hidden md:flex absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center justify-center text-white">
                    <h1 className="text-5xl mb-6 font-semibold">Security First</h1>
                    <p className="text-lg text-[#E5E7EB] mb-16 text-center max-w-md">
                        Set a strong new password to protect your account.
                    </p>
                </div>
                <img
                    src={Login_pic}
                    alt="Login_pic"
                    className="h-[100vh] w-full object-cover"
                />
            </div>

            <div className="flex flex-col justify-center w-1/3 h-[100vh] px-8 bg-white rounded-sm max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-1/2 max-md:-translate-y-1/2 max-md:w-[90%] max-md:max-w-sm max-md:h-auto max-md:rounded-2xl max-md:shadow-2xl max-md:bg-white/95 max-md:backdrop-blur-md max-md:z-10 max-md:px-7 max-md:py-9">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">New Password</h1>
                        <p className="text-[#6C757D]">
                            {success
                                ? "Password updated successfully"
                                : "Enter and confirm your new password"
                            }
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="newPassword" className="text-sm font-semibold text-[#2C3E50]">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimal 8 characters"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#2C3E50]">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#00A8E8] hover:bg-[#0092c9] text-white font-medium py-3 px-4 rounded-xl shadow-md transition-colors mt-2"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="text-green-600 w-8 h-8" />
                            </div>
                            <h3 className="text-green-800 font-semibold text-lg mb-2">All set!</h3>
                            <p className="text-green-600 text-sm mb-4">
                                Your password has been changed. You will be redirected to login shortly.
                            </p>
                            <NavLink to="/admin/login" className="text-[#00A8E8] font-bold hover:underline">
                                Go to login now
                            </NavLink>
                        </div>
                    )}

                    {!success && (
                        <div className="mt-8 text-center">
                            <NavLink
                                to="/admin/login"
                                className="inline-flex items-center gap-2 text-[#00A8E8] font-medium hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </NavLink>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}

export default ResetPassword;
