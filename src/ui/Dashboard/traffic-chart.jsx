// // src/components/traffic-chart.jsx
// "use client"; // ← keep only if using Next.js App Router

// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "../chart";

// const chartConfig = {
//   visitors: {
//     label: "Visitors",
//     color: "hsl(var(--chart-1))",
//   },
// };

// export function TrafficChart({ data }) {
//   const chartData = data.map((value, index) => ({
//     day: index + 1,
//     visitors: value,
//   }));

//   return (
//     <div className="h-80 w-full">
//       <ChartContainer config={chartConfig} className="h-full w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={chartData}
//             margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//           >
//             <CartesianGrid vertical={false} strokeDasharray="3 3" />
//             <XAxis
//               dataKey="day"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               label={{ value: "Days", position: "insideBottom", offset: -5 }}
//             />
//             <YAxis
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               domain={[2000, 12000]}
//               ticks={[2000, 4000, 6000, 8000, 10000, 12000]}
//               tickFormatter={(value) => `${value.toLocaleString()}`}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent indicator="dot" />}
//             />
//             <Area
//               type="monotone"
//               dataKey="visitors"
//               stroke="hsl(var(--chart-1))"
//               fill="hsl(var(--chart-1))"
//               fillOpacity={0.15}
//               strokeWidth={3}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </ChartContainer>
//     </div>
//   );
// }

// ../Dashboard/traffic-chart.jsx
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../chart"; // adjust path to shadcn chart

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "#3b82f6", // blue-500 like screenshot
  },
};

export function TrafficChart({ data }) {
  const chartData = data.map((value, index) => ({
    day: index + 1,
    visitors: value,
  }));

  return (
    <div className="h-[280px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              vertical={false} 
              stroke="#e5e7eb" 
              strokeDasharray="3 3" 
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              label={{ 
                value: "Days", 
                position: "insideBottom", 
                offset: -10, 
                fill: "#6b7280", 
                fontSize: 12 
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[2000, 10000]}
              ticks={[0, 2000, 4000, 6000, 8000, 10000]}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot" 
                labelFormatter={(value) => `Day ${value}`}
              />}
            />
            <Area
              type="monotone"           // smooth curve like screenshot
              dataKey="visitors"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="#3b82f6"
              fillOpacity={0.12}        // very light fill
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}