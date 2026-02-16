// // // function Dashboard (){
   
// // //     return <div>Dashboard ui</div>;
// // // }
// // // export default Dashboard;
// // // src/components/Dashboard.jsx
// // import { useEffect, useRef } from "react";
// // import faq_icon from "/images/FAQ.png";
// // import news_icon from "/images/News.png";
// // import certificate_icon from "/images/certificate.png";
// // import portfolio_icon from "/images/portfolio_logo.png";

// // function Dashboard() {
// //   // Fake stats data
// //   const stats = [
// //     { icon: certificate_icon, label: "Total Certificates", value: 247, change: "+5%",bgColor: "bg-blue-50", },
// //     { icon: news_icon, label: "Total News", value: 83, change: "+5%", bgColor: "bg-blue-50", },
// //     { icon: faq_icon, label: "Total FAQ", value: 156, change: "+5%", bgColor: "bg-blue-50", },
// //     { icon: portfolio_icon, label: "Portfolio Projects", value: 34, change: "+5%", bgColor: "bg-blue-50", },
// //   ];

// //   // 30-day traffic data (mock) — same as before
// //   const trafficData = [
// //     3800, 4200, 4000, 4800, 5200, 5000, 5800, 6200, 6000, 6800,
// //     7200, 7000, 7500, 8200, 8000, 8500, 8800, 9000, 9200, 9500,
// //     9400, 9800, 9600, 10200, 10500, 10800, 11000, 11200, 11400, 11800
// //   ];

// //   // Simple SVG line chart settings
// //   const width = 800;
// //   const height = 280;
// //   const padding = { top: 20, right: 30, bottom: 40, left: 50 };

// //   const maxValue = Math.max(...trafficData);
// //   const minValue = Math.min(...trafficData);
// //   const valueRange = maxValue - minValue || 1;

// //   const points = trafficData.map((value, i) => {
// //     const x = padding.left + (i / (trafficData.length - 1)) * (width - padding.left - padding.right);
// //     const y = padding.top + ((maxValue - value) / valueRange) * (height - padding.top - padding.bottom);
// //     return { x, y }; });

// //   // Generate polyline points string
// //   const linePoints = points.map(p => `${p.x},${p.y}`).join(" ");

// //   // Generate area fill (same path but closed to bottom)
// //   const areaPoints = [
// //     `${padding.left},${height - padding.bottom}`,
// //     ...points.map(p => `${p.x},${p.y}`),
// //     `${width - padding.right},${height - padding.bottom}`,
// //   ].join(" ");

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
// //       <div className="w-full mx-auto">
// //         {/* Header */}
// //         <div className="mb-8">
// //           <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
// //             Dashboard Overview
// //           </h1>
// //           <p className="mt-1 text-gray-600">
// //             Welcome back! Here's what's happening
// //           </p>
// //         </div>

// //         {/* Stats Cards */}
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
// //           {stats.map((stat, idx) => (
// //             <div
// //               key={idx}
// //               className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
// //             >
// //               <img
// //                 src={stat.icon}
// //                 alt={stat.label}
// //                 className="w-12 h-12 mb-4 object-contain bg-slate-500"  // adjust size as needed
// //               />
// //               <div className="text-3xl font-bold text-gray-900 mb-1">
// //                 {stat.value.toLocaleString()}
// //               </div>
// //               <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
// //               <div className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
// //                 <span>↑</span> {stat.change}
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Traffic Chart – now pure SVG */}
// //         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
// //           <h2 className="text-xl font-semibold text-gray-900 mb-6">
// //             30-Day Website Traffic
// //           </h2>

// //           <div className="h-80 w-full overflow-hidden">
// //             <svg
// //               viewBox={`0 0 ${width} ${height}`}
// //               className="w-full h-full"
// //               preserveAspectRatio="xMidYMid meet"
// //             >
// //               {/* Horizontal grid lines */}
// //               {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
// //                 const y = padding.top + tick * (height - padding.top - padding.bottom);
// //                 return (
// //                   <g key={tick}>
// //                     <line
// //                       x1={padding.left}
// //                       y1={y}
// //                       x2={width - padding.right}
// //                       y2={y}
// //                       stroke="#e5e7eb"
// //                       strokeWidth="1"
// //                     />
// //                     <text
// //                       x={padding.left - 10}
// //                       y={y + 4}
// //                       textAnchor="end"
// //                       className="text-xs text-gray-500 fill-current"
// //                     >
// //                       {Math.round(maxValue - tick * valueRange).toLocaleString()}
// //                     </text>
// //                   </g>
// //                 );
// //               })}

// //               {/* X-axis labels (days) */}
// //               <text
// //                 x={(width - padding.left - padding.right) / 2 + padding.left}
// //                 y={height - 8}
// //                 textAnchor="middle"
// //                 className="text-sm text-gray-500 fill-current"
// //               >
// //                 Days
// //               </text>

// //               {/* Area fill */}
// //               <polygon
// //                 points={areaPoints}
// //                 fill="#3b82f6"
// //                 fillOpacity="0.1"
// //               />

// //               {/* Line */}
// //               <polyline
// //                 points={linePoints}
// //                 fill="none"
// //                 stroke="#3b82f6"
// //                 strokeWidth="3"
// //                 strokeLinecap="round"
// //                 strokeLinejoin="round"
// //               />

// //               {/* Data points (circles on hover) */}
// //               {points.map((p, i) => (
// //                 <g key={i}>
// //                   <circle
// //                     cx={p.x}
// //                     cy={p.y}
// //                     r="4"
// //                     fill="#3b82f6"
// //                     className="opacity-0 group-hover:opacity-100 transition-opacity"
// //                   />
// //                   {/* Invisible larger hit area for better hover */}
// //                   <circle
// //                     cx={p.x}
// //                     cy={p.y}
// //                     r="12"
// //                     fill="transparent"
// //                     className="cursor-pointer"
// //                   >
// //                     <title>{`Day ${i + 1}: ${trafficData[i].toLocaleString()} visits`}</title>
// //                   </circle>
// //                 </g>
// //               ))}
// //             </svg>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Dashboard;

// // src/components/Dashboard.jsx
// import { StatCard } from "../Dashboard/stat-card";      
// import { TrafficChart } from "../Dashboard/traffic-chart";
// import { Card, CardContent, CardHeader, CardTitle } from "../card";
// import {stats} from "../../data/stats";
// import {trafficData} from "../../data/trafficData";

// export default function Dashboard() {

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
//       <div className="w-full mx-auto space-y-8">
//         {/* Header */}
//         <div>
//           <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
//             Dashboard Overview
//           </h1>
//           <p className="mt-1 text-gray-600">Welcome back! Here's what's happening</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           {stats.map((stat, idx) => (
//             <StatCard
//               key={idx}
//               icon={stat.icon}
//               label={stat.label}
//               value={stat.value}
//               change={stat.change}
//               bgColor={stat.bgColor}
//             />
//           ))}
//         </div>

//         {/* Traffic Chart Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>30-Day Website Traffic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <TrafficChart data={trafficData} />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// Dashboard.jsx
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