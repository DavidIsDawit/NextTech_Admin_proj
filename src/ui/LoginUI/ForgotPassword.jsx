import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { forgotPassword } from "../../api/userApi";
import { toast } from "sonner";

const Login_pic = "/images/Login_pic.png";
const NextTech_logo = "/NextTech_logo.png";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Email is required");
            return;
        }

        setLoading(true);
        try {
            const res = await forgotPassword(email);
            if (res.status === "success") {
                setSubmitted(true);
                toast.success("Password reset link sent to your email");
            } else {
                toast.error(res.message || "Failed to send reset link");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong";
            if (!message.toLowerCase().includes("invalid")) {
                toast.error(message);
            }
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
                    <h1 className="text-5xl mb-6 font-semibold">Forgot Password?</h1>
                    <p className="text-lg text-[#E5E7EB] mb-16 text-center max-w-md">
                        Don't worry! Enter your email and we'll send you a link to reset your password.
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
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Reset Password</h1>
                        <p className="text-[#6C757D]">
                            {submitted
                                ? "Check your email for the reset link"
                                : "Enter your registered email address"
                            }
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-[#2C3E50]">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@engineercms.com"
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
                                {loading ? "Sending link..." : "Send Reset Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-green-600 w-8 h-8" />
                            </div>
                            <h3 className="text-green-800 font-semibold text-lg mb-2">Check your inbox</h3>
                            <p className="text-green-600 text-sm">
                                We've sent a password reset link to <span className="font-semibold">{email}</span>.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <NavLink
                            to="/admin/login"
                            className="inline-flex items-center gap-2 text-[#00A8E8] font-medium hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
