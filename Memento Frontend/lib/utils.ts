import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function GenRand(num: number): {
    result: number;
    color: "green" | "yellow" | "red";
    text: "Optimal" | "Moderate" | "Concerning";
} {
    const r = Math.floor(Math.random() * num);

    return {
        result: r,
        color: r > (2 * num) / 3 ? "green" : r > num / 3 ? "yellow" : "red",
        text:
            r > (2 * num) / 3
                ? "Optimal"
                : r > num / 3
                ? "Moderate"
                : "Concerning",
    };
}
