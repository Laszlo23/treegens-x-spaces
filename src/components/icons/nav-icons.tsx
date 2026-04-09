import { cn } from "@/lib/cn";

type IconProps = { className?: string; "aria-hidden"?: boolean };

export function IconProfile({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...rest}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20.25c1.25-3.25 4.2-5 6.5-5s5.25 1.75 6.5 5" />
    </svg>
  );
}

export function IconSpace({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...rest}
    >
      <circle cx="12" cy="12" r="2.25" />
      <path d="M8 12a4 4 0 018 0" />
      <path d="M5 12a7 7 0 0114 0" />
    </svg>
  );
}

export function IconLeaderboard({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...rest}
    >
      <path d="M8 21h8M12 17v4M7 3v10a2 2 0 002 2h6a2 2 0 002-2V3" />
      <path d="M7 7h10M10 3h4" />
    </svg>
  );
}

export function IconTasks({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...rest}
    >
      <path d="M9 11l2 2 4-4" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 2v4M16 2v4" />
    </svg>
  );
}
