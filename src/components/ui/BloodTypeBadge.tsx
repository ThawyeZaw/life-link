import type { BloodType } from "@/lib/types";

export const BloodTypeBadge = ({
  type,
  size = "md",
}: {
  type: BloodType | string;
  size?: "md" | "lg";
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-red-600 font-bold text-white ${
      size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"
    }`}
  >
    {type}
  </span>
);
