"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Tooltip } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, File, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
    LineChart,
    PieChart,
    XAxis,
    YAxis,
    Line,
    CartesianGrid,
    Pie,
    Sector,
    AreaChart,
    Area,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { GoogleMap, useLoadScript, HeatmapLayer } from "@react-google-maps/api";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const chartData = [
    { tag: "Confident", count: 605, fill: "hsl(var(--chart-2))" },
    { tag: "Neutral", count: 342, fill: "hsl(var(--chart-4))" },
    { tag: "Anxious", count: 231, fill: "hsl(var(--chart-5))" },
    { tag: "Angry", count: 81, fill: "hsl(var(--chart-1))" },
];

const dialogContent = {
    Confident: {
        title: "Confident Conversations",
        description: "Analysis of confident communication patterns",
        points: [
            "The patient confidently reassures his family about repairing an old watch, drawing on years of experience and inspiring his grandson's admiration",
            "When met with skepticism, the patient expresses unwavering self-assurance in his watch repair abilities, demonstrating pride in his lifelong skills",
        ],
    },
    Neutral: {
        title: "Neutral Interactions",
        description: "Balanced communication patterns",
        points: [
            "During a family dinner discussion, the patient responds neutrally to spaghetti as the meal choice, showing comfort with routine family exchanges",
            "The patient casually participates in meal planning, agreeably accepting his daughter's spaghetti suggestion with a relaxed attitude",
        ],
    },
    Anxious: {
        title: "Anxious Communication Patterns",
        description: "Signs of anxiety in conversations",
        points: [
            "The patient shows anxiety about an upcoming doctor's appointment, expressing unease with hospitals despite family reassurance",
            "Feeling anxious about a medical checkup, the patient seeks comfort from his children while revealing fears about the unknown",
        ],
    },
    Angry: {
        title: "Angry Interactions",
        description: "Patterns indicating frustration or anger",
        points: [
            "The patient reacts angrily upon discovering his belongings were moved without permission, asserting his need for autonomy",
            "When his personal space is rearranged, the patient becomes frustrated and expresses his desire for control over his surroundings",
        ],
    },
};

const chartConfig = {
    confident: {
        label: "Confident",
        color: "hsl(var(--chart-2))",
    },
    neutral: {
        label: "Neutral",
        color: "hsl(var(--chart-4))",
    },
    anxious: {
        label: "Anxious",
        color: "hsl(var(--chart-5))",
    },
    angry: {
        label: "Angry",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const currentMonthIndex = new Date().getMonth();
const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const getYearlyData = () => {
    const newData = months.slice(0, currentMonthIndex + 1).map((month) => ({
        month: month,
        percentage: Math.floor(Math.random() * 30) + 60,
    }));

    return newData;
};

const lineChartData = {
    Yearly: getYearlyData(),
    Monthly: [
        { month: "Week 1", percentage: 65 },
        { month: "Week 2", percentage: 85 },
        { month: "Week 3", percentage: 75 },
        { month: "Week 4", percentage: 90 },
    ],
};

// Sample heatmap data - replace with actual patient location data
const heatmapData = [
    { lat: 37.774546, lng: -122.433523, weight: 5 },
    { lat: 37.784546, lng: -122.443523, weight: 8 },
    { lat: 37.794546, lng: -122.453523, weight: 3 },
    // Add more location points as needed
];

const Summary = () => {
    const [timeFrame, setTimeFrame] = useState<"Yearly" | "Monthly">("Yearly");
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        undefined
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMood, setSelectedMood] = useState<
        keyof typeof dialogContent | null
    >(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["visualization"],
    });

    const mapOptions = {
        center: { lat: 37.774546, lng: -122.433523 },
        zoom: 13,
    };

    const handlePieClick = (data: { tag: keyof typeof dialogContent }) => {
        setSelectedMood(data.tag);
        setDialogOpen(true);
    };

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {selectedMood && (
                    <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                {dialogContent[selectedMood].title}
                            </DialogTitle>
                            <DialogDescription className="text-lg mt-2 text-gray-600">
                                {dialogContent[selectedMood].description}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6">
                            <ul className="space-y-4">
                                {dialogContent[selectedMood].points.map(
                                    (point, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start text-gray-700"
                                        >
                                            <span className="mr-2 text-lg text-blue-600">
                                                •
                                            </span>
                                            <span className="text-lg">
                                                {point}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <h2 className="mr-4 text-lg font-semibold">
                        Stats for 2024-25
                    </h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                    >
                        <ChevronRight />
                    </Button>
                </div>
                <div className="flex space-x-1 rounded-lg border bg-white p-1">
                    <Button
                        className={
                            timeFrame === "Yearly"
                                ? "bg-purple-600 hover:bg-purple-700 !text-white font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                        }
                        variant="ghost"
                        onClick={() => setTimeFrame("Yearly")}
                    >
                        Yearly
                    </Button>
                    <Button
                        className={
                            timeFrame === "Monthly"
                                ? "bg-purple-600 hover:bg-purple-700 !text-white font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                        }
                        variant="ghost"
                        onClick={() => setTimeFrame("Monthly")}
                    >
                        Monthly
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {[
                    {
                        title: "Total healthy social interactions",
                        count: 605,
                        change: "+131 since last month",
                    },
                    {
                        title: "Daily steps",
                        count: 8000,
                        change: "+1200 since yesterday",
                    },
                    {
                        title: "Mood Tracking",
                        count: "Happy",
                        change: "Feeling great since today :)",
                    },
                    {
                        title: "Medication adherence",
                        count: 21,
                        change: "-11 since last month",
                    },
                ].map((item, i) => (
                    <Card key={i} className="rounded-lg bg-white p-6">
                        <CardTitle className="text-lg font-medium">
                            {item.title}
                        </CardTitle>
                        <p className="mt-6 text-2xl font-bold">{item.count}</p>
                        <p className="text-sm font-medium text-emerald-600">
                            {item.change}
                        </p>
                    </Card>
                ))}
            </div>

            <div className="flex space-x-6">
                <div className="mt-6 w-[40%]">
                    <Card className="h-full w-full p-6">
                        <CardTitle className="mb-2 text-xl font-semibold">
                            Conversational Semantic Analysis
                        </CardTitle>

                        <ChartContainer
                            config={chartConfig}
                            className="h-[90%] w-full"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            className="bg-white"
                                            hideLabel
                                        />
                                    }
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="count"
                                    nameKey="tag"
                                    innerRadius={90}
                                    activeIndex={activeIndex}
                                    onClick={handlePieClick}
                                    onMouseEnter={(data, index) => {
                                        setActiveIndex(index);
                                    }}
                                    onMouseLeave={() => {
                                        setActiveIndex(undefined);
                                    }}
                                    activeShape={({
                                        outerRadius = 0,
                                        ...props
                                    }: PieSectorDataItem) => (
                                        <Sector
                                            {...props}
                                            outerRadius={outerRadius + 10}
                                        />
                                    )}
                                />

                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    className="gap-4"
                                />
                            </PieChart>
                        </ChartContainer>
                    </Card>
                </div>

                <div className="mt-6 w-[60%]">
                    <Card className="h-full p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="mb-2 text-xl font-semibold">
                                    Overall Health Assessment
                                </CardTitle>
                                <CardDescription className="mb-6 text-base text-black">
                                    Tracking general wellness indicators and
                                    vitals over time
                                </CardDescription>
                            </div>

                            <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6611150/">
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700 rounded-full !text-white"
                                    size="icon"
                                >
                                    <File />
                                </Button>
                            </Link>
                        </div>

                        <ChartContainer
                            config={{
                                value: {
                                    label: "Overall Health Trend",
                                    color: "#4CAF50",
                                },
                            }}
                            className="h-[30vh] w-full"
                        >
                            <LineChart
                                data={lineChartData[timeFrame]}
                                className="w-full"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e0e0e0"
                                    vertical={false}
                                />
                                <XAxis dataKey="month" />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(tick) => `${tick}%`}
                                />
                                <Tooltip />
                                <Line
                                    dataKey="percentage"
                                    strokeWidth={2}
                                    stroke="#059669"
                                />
                            </LineChart>
                        </ChartContainer>

                        <p className="mt-4 flex items-center text-lg font-semibold text-emerald-600">
                            11% improvement from last month
                            <TrendingUp className="ml-2" />
                        </p>
                    </Card>
                </div>
            </div>

            <div className="flex flex-row-reverse gap-6 mt-6">
                <div className="w-[40%]">
                    <Card className="h-full w-full p-6">
                        <CardTitle className="mb-2 text-xl font-semibold">
                            Activity Location Heatmap
                        </CardTitle>
                        <CardDescription className="mb-6 text-base text-black">
                            Locations visited by the patient this week
                        </CardDescription>

                        <ChartContainer
                            config={{
                                activity: {
                                    label: "Visit Frequency",
                                    color: "hsl(var(--red-500))",
                                },
                            }}
                            className="h-[90%] w-full relative"
                        >
                            {isLoaded ? (
                                <div className="w-full h-[300px]">
                                    <GoogleMap
                                        mapContainerClassName="w-full h-full rounded-lg"
                                        options={mapOptions}
                                    >
                                        <HeatmapLayer
                                            data={heatmapData.map(
                                                (location) =>
                                                    new google.maps.LatLng(
                                                        location.lat,
                                                        location.lng
                                                    )
                                            )}
                                            options={{
                                                radius: 50,
                                                opacity: 0.8,
                                                gradient: [
                                                    "rgba(0, 0, 255, 0)",
                                                    "rgba(0, 255, 0, 0.6)",
                                                    "rgba(255, 255, 0, 0.7)",
                                                    "rgba(255, 128, 0, 0.8)",
                                                    "rgba(255, 0, 0, 1)",
                                                ],
                                                dissipating: true,
                                                maxIntensity: 100,
                                            }}
                                        />
                                    </GoogleMap>
                                </div>
                            ) : (
                                <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                                    Loading map...
                                </div>
                            )}
                        </ChartContainer>
                    </Card>
                </div>

                <div className="w-[60%]">
                    <Card className="h-full p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="mb-2 text-xl font-semibold">
                                    Physical Activity Heatmap
                                </CardTitle>
                                <CardDescription className="mb-6 text-base text-black">
                                    Daily cognitive activity levels over the
                                    past year
                                </CardDescription>
                            </div>

                            <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3207358/">
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700 rounded-full !text-white"
                                    size="icon"
                                >
                                    <File />
                                </Button>
                            </Link>
                        </div>

                        <ChartContainer
                            config={{
                                activity: {
                                    label: "Activity Level",
                                    color: "hsl(var(--chart-2))",
                                },
                            }}
                            className="h-[30vh] w-full"
                        >
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: "repeat(36, 1fr)",
                                }}
                            >
                                {Array.from({ length: 36 * 16 }).map((_, i) => {
                                    const activityLevel = Math.random();

                                    let bgColor = "bg-gray-100";
                                    if (activityLevel > 0.75) {
                                        bgColor = "bg-emerald-500";
                                    } else if (activityLevel > 0.5) {
                                        bgColor = "bg-emerald-400";
                                    } else if (activityLevel > 0.25) {
                                        bgColor = "bg-emerald-300";
                                    } else if (activityLevel > 0) {
                                        bgColor = "bg-emerald-100";
                                    }
                                    return (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-sm ${bgColor}`}
                                            title={`Activity Level: ${Math.round(
                                                activityLevel * 100
                                            )}%`}
                                        />
                                    );
                                })}
                            </div>
                        </ChartContainer>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-sm bg-gray-100" />
                                    <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                                    <div className="w-3 h-3 rounded-sm bg-emerald-300" />
                                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                                </div>
                                <span>More</span>
                            </div>
                            <p className="flex items-center text-sm font-medium text-emerald-600">
                                Strong activity pattern detected
                                <TrendingUp className="ml-2" />
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
            </div>
        </>
    );
};
export default Summary;
