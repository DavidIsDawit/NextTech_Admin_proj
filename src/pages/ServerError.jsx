import { ServerCrash, RefreshCw, Home } from "lucide-react";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router-dom";

const NextTech_logo = "/NextTech_logo.png";

function ServerError() {
    const navigate = useNavigate();

    const handleRetry = () => {
        // Try to go back to the previous page or dashboard and reload
        window.location.href = "/";
    };

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="flex justify-center mb-8">
                    <img
                        src={NextTech_logo}
                        alt="NextTech Logo"
                        className="h-12 w-auto brightness-110"
                    />
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-red-50 p-4 rounded-full">
                        <ServerCrash className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-[#2C3E50] mb-3">
                    Server Connection Lost
                </h1>

                <p className="text-[#6C757D] mb-8 leading-relaxed">
                    We're having trouble connecting to our servers. This could be due to a temporary maintenance or a network issue.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleRetry}
                        className="bg-[#00A8E8] hover:bg-[#0092c9] text-white font-semibold py-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleGoHome}
                        className="text-[#6C757D] hover:text-[#2C3E50] hover:bg-gray-50 font-medium py-4 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        If the problem persists, please contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ServerError;
