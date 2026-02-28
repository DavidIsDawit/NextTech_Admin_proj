import { StatCard } from "../Dashboard/stat-card";
import { TrafficChart } from "../Dashboard/traffic-chart";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { stats } from "../../data/stats";
import { trafficData } from "../../data/trafficData";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50/70 p-6 lg:p-8  ">
      <div className="w-full mx-auto space-y-8">
        {/* Header - match screenshot spacing */}
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening
          </p>
        </div>

        {/* Stats Grid - tighter gap like screenshot */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              bgColor={stat.bgColor}
              iconBg={stat.iconBg}
            />
          ))}
        </div>

        {/* Traffic Chart Card */}
        <Card className="border shadow-sm">
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