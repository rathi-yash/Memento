interface ProgressCircleProps {
    value: number;
    color: "green" | "yellow" | "red";
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ value, color }) => {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-28 w-28 items-center justify-center rounded-full bg-white px-2 py-1 text-3xl font-bold text-muted-foreground">
                    {value}%
                </span>
            </div>

            <svg className="h-full w-full" viewBox="0 0 120 120">
                <circle
                    className="text-muted"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`transition-all duration-300 ease-in-out ${
                        color === "red"
                            ? "stroke-rose-500"
                            : color === "yellow"
                            ? "stroke-amber-500"
                            : "stroke-emerald-500"
                    }`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                    }}
                />
            </svg>
        </div>
    );
};

export default ProgressCircle;
