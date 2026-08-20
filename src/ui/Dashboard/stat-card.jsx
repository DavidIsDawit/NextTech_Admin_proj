import { Card, CardContent } from "../card"; // adjust path to your shadcn card
import { cn } from "@/lib/utils";           // shadcn cn helper

export function StatCard({ icon, label, value, change, bgColor = "bg-white", iconBg, className }) {
    
   return (
    // <Card className={cn(
    //   "overflow-hidden shadow-lg hover:shadow transition-shadow duration-200 border-0",
    //   bgColor,
    //   className
    // )}>
    //   <CardContent className="p-5 flex flex-col lg:flex lg:flex-row  items-start gap-1">
    //     {/* Icon in colored circle */}
    //     <div className={cn(
    //       "w-10 h-10 rounded-full flex items-center justify-center mb-2",
    //       iconBg || "bg-gray-100"
    //     )}>
    //       <img
    //         src={icon}
    //         alt={label}
    //         className="w-6 h-6 object-contain"
    //       />
    //     </div>     
    //     {/* Big number */}
        
    //     <div className="flex  flex-col   justify-start lg:justify-end w-full">
    //         {/* Label */}
    //     <div className="flex justify-start lg:justify-end   text-3xl lg:text-4xl font-extrabold text-black">
    //       {value.toLocaleString()}
    //     </div>
    //     <div className="flex justify-start lg:justify-end text-sm text-gray-600 font-medium">
    //       {label}
    //     </div>
    //     </div>       
    //   </CardContent>
    // </Card>
    <Card
  className={cn(
    "overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow border-0",
    bgColor,
    className
  )}
>
  {/* <CardContent className="flex items-center gap-4 pt-5 pb-5 pr-8 pl-8"> */}
  <CardContent className="flex items-center gap-3 px-10 py-4 sm:gap-6 sm:px-12 sm:py-4 md:px-12  md:py-4 lg:px-3  lg:gap-4 lg:py-4 xl:px-5 xl:py-4">
    {/* Icon */}
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        iconBg ?? "bg-gray-100"
      )}
    >
      <img
        src={icon}
        alt={label}
        className="h-6 w-6 object-contain"
      />
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col items-end">
      <p className="text-3xl text-right font-black  leading-none text-black lg:text-4xl">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-right text-sm font-medium text-black">
        {label}
      </p>
    </div>
  </CardContent>
</Card>
  );
}