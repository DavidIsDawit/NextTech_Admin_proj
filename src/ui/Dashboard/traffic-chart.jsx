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
  // Ensure we always have an array
  const rawData = data || [];
  
  // Calculate the dates for the last 30 days ending today
  const now = new Date();
  const today = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Calculate the chart data for the current month
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    
    // Format to YYYY-MM-DD to match the backend _id format
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find if we have backend data for this exact date
    const existingData = rawData.find(item => 
      item._id === dateStr || item.date === dateStr || item.day === dateStr
    );
    
    // Set to null for future days to stop the line graph
    const visitors = (day <= today) 
      ? (existingData ? (existingData.count || existingData.visitors || 0) : 0)
      : null;

    return {
      day: day,
      visitors: visitors,
      date: dateStr,
    };
  });

  return (
    <div className="h-[42vh] w-full">
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
              allowDecimals={false}
              tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
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
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="#3b82f6"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}