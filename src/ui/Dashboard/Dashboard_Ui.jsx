import { StatCard } from "../Dashboard/stat-card";
import { useState, useEffect } from "react";
import { TrafficChart } from "../Dashboard/traffic-chart";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { stats } from "../../data/stats";
import api from "../../api/api";
import { trafficData } from "../../data/trafficData";

export default function Dashboard() {

    const [totalNews, setTotalNews] = useState(0);
    const [totalFAQ, setTotalFAQ] = useState(0);
    const [totalProject, setTotalProject] = useState(0);
    const [totalCertificate, setTotalCertificate] = useState(0);
    const [totalPortfolios, setTotalPortfolios] = useState(0);

    useEffect(() => {
        const fetchDashboardTotalData = async () => {
            try {
                // Using Promise.allSettled to allow partial failures
                const results = await Promise.allSettled([
                    api.get("/AllNews"),             // index 0
                    api.get("/getAllCertificates"),   // index 1
                    api.get("/getAllFAQs"),           // index 2
                    api.get("/getAllPortfolios"),           // index 3
                ]);

                // Safely extract each response (axios wraps data in .data)
                const resNews         = results[0].status === "fulfilled" ? results[0].value.data : null;
                const resCertificates = results[1].status === "fulfilled" ? results[1].value.data : null;
                const resFAQs         = results[2].status === "fulfilled" ? results[2].value.data : null;
                const resPortfolios   = results[3].status === "fulfilled" ? results[3].value.data : null;

                // API shapes:
                //   News:         { status, totalNews, data: { news: [] } }
                //   Certificates: { status, totalCertificates, certificates: [] }
                //   FAQs:         { status, results, data: [] }
                setTotalNews(Number(resNews?.totalNews) || 0);
                setTotalCertificate(Number(resCertificates?.totalCertificates) || 0);
                setTotalFAQ(Number(resFAQs?.results) || 0);
                setTotalPortfolios(Number(resPortfolios?.totalPortfolios) || 0);
               

            } catch {
                // Silent fail — individual API errors are already toasted by the interceptor
            }
        };

        fetchDashboardTotalData();
    }, []);

    // Map each stat card label to the correct state value
    const getStatValue = (label) => {
        switch (label) {
            case "Total Certificates":  return totalCertificate;
            case "Total News":          return totalNews;
            case "Total FAQ":           return totalFAQ;
            case "Portfolio Projects":  return totalPortfolios;
            default:                    return 0;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/70 p-6 lg:p-8">
            <div className="w-full mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600">
                        Welcome back! Here's what's happening
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            icon={stat.icon}
                            label={stat.label}
                            value={getStatValue(stat.label)}
                            change={stat.change}
                            bgColor={stat.bgColor}
                            iconBg={stat.iconBg}
                        />
                    ))}
                </div>

                {/* Traffic Chart Card */}
                <Card className="border shadow-sm ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">
                            30-Day Website Traffic
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <TrafficChart data={trafficData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}