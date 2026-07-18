export const StatusPill = ({
  label,
  className,
}: {
  label: string;
  className: string;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
  >
    {label}
  </span>
);
