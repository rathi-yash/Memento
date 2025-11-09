import React from "react";
import { LucideProps } from "lucide-react";

interface CustomIconProps {
    children: React.ReactElement<LucideProps>;
    className?: string;
}

export function CustomIcon({ children, className = "" }: CustomIconProps) {
    return React.cloneElement(children, {
        ...children.props,
        className: `mr-2 h-4 w-4 ${className} ${children.props.className || ""}`,
    });
}
