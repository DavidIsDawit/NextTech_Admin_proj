// login background image served from public root
const Login_pic = "/images/Login_pic.png";
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
const NextTech_logo = "/NextTech_logo.png";
import { login } from "../../api/userApi";
import { toast } from "sonner";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlesubmit = async function (e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.status === "success") {
        toast.success("Login successful");
        const firstFlag = res.data?.firstTimeLogin || false;
        if (firstFlag) {
          navigate("/admin/change-password");
        } else {
          navigate("/");
        }
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-between h-[90vh] ">

      <div className=" w-2/3 h-[100vh]  overflow-hidden">
        <div className="absolute left-10 top-20   -translate-y-1/2 z-10  flex flex-col items-start justify-start text-white ">
          <img
            src={NextTech_logo}
            alt="NextTech_logo"
            className="2xl:h-16 2xl:w-full xl:h-14 xl:w-full lg:h-12 lg:w-full md:h-11 md:w-full h-10 w-full brightness-150 contrast-125"
          />
        </div>

        <div className="absolute left-1/3 top-1/2 -translate-x-2/4 -translate-y-1/2 z-10  flex flex-col items-center justify-center text-white ">
          <h1 className="text-5xl  mb-6 font-semibold">
            Welcome Back
          </h1>
          <p className="text-lg text-[#E5E7EB] mb-16">
            Sign in to access your admin management dashboard
          </p>
          <div className="flex gap-6">
            <div className="border-[#FFFFFF] border-2 w-16 h-16 rounded-xl"></div>
            <div className="border-[#FFFFFF] border-2 w-16 h-16 rounded-full"></div>
            <div className="border-[#FFFFFF] border-2 w-16 h-16 rotate-45 rounded-xl "></div>
          </div>
        </div>
        <img
          src={Login_pic}
          alt="Login_pic"
          className="h-[100vh] w-full  object-cover   " />
      </div>

      <div className="flex flex-col  justify-center w-1/3 h-[100vh]  px-3 bg-white  rounded-sm">
        <div className="mx-4 lg:mx-20">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl  font-bold text-[#2C3E50] mb-2">Admin Login</h1>
            <p className="text-[#6C757D]">Enter your credentials to continue</p>
          </div>
          <form className="flex flex-col gap-6">
            {/* Email Field */}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-gray-300"
                  required
                />

              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-semibold text-[#2C3E50]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-gray-300"
                />

                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" />
                  ) : (
                    <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" />
                  )}
                </Button>




              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-5 h-5 border-gray-300 rounded accent-[#00A8E8]"
              />

              <Label htmlFor="remember" className="text-gray-600 text-sm">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}

            <Button
              variant="ghost"
              type="submit"
              onClick={handlesubmit}
              disabled={loading}
              className="bg-[#00A8E8] oncli hover:bg-[#0092c9] text-white font-medium py-3 px-4 rounded-xl shadow-md transition-colors mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

          </form>
          {/* Footer Links */}
          <div className="mt-8 text-center flex flex-col gap-10">
            {/* <button className="text-[#00A8E8] font-medium hover:underline">
                Forgot Password?
              </button> */}
            <NavLink
              variant="ghost"
              className="text-[#00A8E8] hover:text-[#0092c9] font-medium hover:underline"
            >
              Forgot Password?
            </NavLink>
            <p className="text-xs text-gray-400">
              © 2026 Next-Tech. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
export default Login;