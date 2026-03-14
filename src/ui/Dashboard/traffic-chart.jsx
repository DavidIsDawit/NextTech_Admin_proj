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
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    // Offset by (29 - i) days aggressively to get the past 30 days in order
    d.setDate(d.getDate() - (29 - i));
    
    // Format to YYYY-MM-DD to match the backend _id format
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Find if we have backend data for this exact date
    const existingData = rawData.find(item => 
      item._id === dateStr || item.date === dateStr || item.day === dateStr
    );
    
    // Map backend "count" field (or fallback to "visitors")
    return {
      day: i + 1,
      visitors: existingData ? (existingData.count || existingData.visitors || 0) : 0,
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