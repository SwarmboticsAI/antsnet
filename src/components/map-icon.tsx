interface MapIconProps {
  color: string;
  strokeWidth?: number;
  size: number;
}

export function MapIcon({
  color = "black",
  size,
  strokeWidth = 2,
}: MapIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 370 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M185.5 7L363.5 446.5L185.5 321M184.5 7L6.5 446.5L184.5 321"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
