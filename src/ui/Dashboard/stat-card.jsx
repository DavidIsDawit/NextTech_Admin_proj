// // src/components/ui/stat-card.jsx
// import { Card, CardContent } from "../card";
// import { cn } from "@/lib/utils";

// export function StatCard({ icon, label, value, change, bgColor = "bg-white", className }) {
//   return (
//     <Card className={cn("shadow-sm hover:shadow-md transition-shadow", bgColor, className)}>
//       <CardContent className="p-6 flex flex-col items-center text-center">
//         <img
//           src={icon}
//           alt={label}
//           className="w-12 h-12 mb-4 object-contain rounded-md"
//         />
//         <div className="text-3xl font-bold text-gray-900 mb-1">
//           {value.toLocaleString()}
//         </div>
//         <div className="text-sm text-gray-600 mb-3">{label}</div>
//         <div className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
//           <span>↑</span> {change}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
import { Card, CardContent } from "../card"; // adjust path to your shadcn card
import { cn } from "@/lib/utils";           // shadcn cn helper

export function StatCard({ icon, label, value, change, bgColor = "bg-white", iconBg, className }) {
  return (
    <Card className={cn(
      "overflow-hidden shadow-lg hover:shadow transition-shadow duration-200 border-0",
      bgColor,
      className
    )}>
      <CardContent className="p-5 flex flex-col items-start gap-1">
        {/* Icon in colored circle */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mb-2",
          iconBg || "bg-gray-100"
        )}>
          <img
            src={icon}
            alt={label}
            className="w-6 h-6 object-contain"
          />
        </div>

        

        {/* Big number */}
        <div className="text-3xl lg:text-4xl font-extrabold text-black">
          {value.toLocaleString()}
        </div>


        <div className="flex justify-between  w-full">
            {/* Label */}
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>

        {/* Change badge - green like screenshot */}
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
          <span>↑</span>
          {change}
        </div>

        </div>

       
      </CardContent>
    </Card>
  );
}