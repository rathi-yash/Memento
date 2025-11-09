"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Info, Mail } from "lucide-react";
import { CustomIcon } from "@/components/CustomIcon";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Loading from "@/components/Loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { faker } from "@faker-js/faker";
import { useEffect } from "react";
import { GenRand } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ProgressCircle from "../ProgressCircle";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    Radar as RechartsRadar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

const RecommendationsContent = ({ userName }: { userName: string }) => {
    const [user, setUser] = useState<{
        email: string;
        name: string;
        image: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<null | Error>(null);
    const healthStatus = GenRand(100);

    useEffect(() => {
        const generateFakeUser = (name: string) => {
            const seed = name;
            faker.seed(
                seed
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
            );

            return {
                email: faker.internet.email(),
                name,
                image: faker.image.avatar(),
            };
        };

        try {
            const fakeUser = generateFakeUser(userName);

            setUser(fakeUser);
            setIsLoading(false);
        } catch (err) {
            setError(err as Error);
            setIsLoading(false);
        }
    }, [userName]);

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>No user selected</div>;

    const studentId = `S-${Math.floor(100000 + Math.random() * 900000)}`;

    const randomBadges = [
        <Badge
            key="friendly"
            variant="outline"
            className="border-amber-600 bg-amber-100 text-amber-600"
        >
            Friendly
        </Badge>,
        <Badge
            key="joyous"
            variant="outline"
            className="border-amber-600 bg-amber-100 text-amber-600"
        >
            Joyous
        </Badge>,
        <Badge
            key="creative"
            variant="outline"
            className="border-violet-600 bg-violet-100 text-violet-600"
        >
            Creative
        </Badge>,
        <Badge
            key="empathetic"
            variant="outline"
            className="border-violet-600 bg-violet-100 text-violet-600"
        >
            Empathetic
        </Badge>,
        <Badge
            key="determined"
            variant="outline"
            className="border-violet-600 bg-violet-100 text-violet-600"
        >
            Determined
        </Badge>,
        <Badge
            key="wise"
            variant="outline"
            className="border-green-600 bg-green-100 text-green-600"
        >
            Wise
        </Badge>,
    ];

    // Select three random badges
    const selectedBadges = [];
    const badgeIndices = new Set();
    while (selectedBadges.length < 3) {
        const randomIndex = Math.floor(Math.random() * randomBadges.length);
        if (!badgeIndices.has(randomIndex)) {
            badgeIndices.add(randomIndex);
            selectedBadges.push(randomBadges[randomIndex]);
        }
    }

    const radarData = [
        {
            subject: "Memory",
            current: 65,
            previous: 78,
            fullMark: 100,
        },
        {
            subject: "Attention",
            current: 59,
            previous: 48,
            fullMark: 100,
        },
        {
            subject: "Language",
            current: 90,
            previous: 85,
            fullMark: 100,
        },
        {
            subject: "Spatial",
            current: 81,
            previous: 76,
            fullMark: 100,
        },
        {
            subject: "Function",
            current: 56,
            previous: 63,
            fullMark: 100,
        },
    ];

    const generateContributions = () => {
        const contributions = [];
        for (let i = 0; i < 7; i++) {
            const weekData = [];
            for (let j = 0; j < 5; j++) {
                const value = Math.floor(Math.random() * 4); // 0-3 for contribution levels
                weekData.push(value);
            }
            contributions.push(weekData);
        }
        return contributions;
    };

    const contributionData = generateContributions();

    return (
        <>
            <div className="w-full">
                <div className="mb-8 flex space-x-8">
                    <Card className="flex-grow">
                        <CardContent className="flex h-full items-center justify-between p-8">
                            <div className="relative h-32 w-32">
                                <Avatar className="h-full w-full">
                                    <AvatarImage
                                        alt={user.name}
                                        src={user.image}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {user.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="ml-10 flex-grow">
                                <div className="flex items-center gap-5">
                                    <h2 className="text-2xl font-bold">
                                        {user.name}
                                    </h2>

                                    <p className="flex items-center text-gray-600">
                                        <CustomIcon>
                                            <Mail />
                                        </CustomIcon>{" "}
                                        {user.email}
                                    </p>
                                </div>
                                <p className="text-gray-600">
                                    Relation ID: {studentId}
                                </p>
                                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm sm:text-lg">
                                    <Badge
                                        variant="outline"
                                        className="border-blu bg-blue-100 text-blu"
                                    >
                                        {Math.random() > 0.5
                                            ? "♂ Male"
                                            : "♀ Female"}
                                    </Badge>

                                    {selectedBadges}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-1/3 bg-purple-600 !text-white">
                        <CardContent className="flex items-center p-6">
                            <div>
                                <h3 className="mb-2 text-xl font-semibold text-white">
                                    Overall conversation score
                                </h3>
                                <p className="mb-4 text-white">
                                    User&apos;s cognitive health is{" "}
                                    {healthStatus.text}.
                                </p>
                            </div>

                            <ProgressCircle
                                value={healthStatus.result}
                                color={healthStatus.color}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-8 mt-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold text-darkblu">
                            Status from {user.name}&apos;s conversation
                        </h2>
                        <p className="flex items-center text-gray-500">
                            <CustomIcon>
                                <Calendar />
                            </CustomIcon>{" "}
                            Status last monitored on 11/10/2025
                        </p>
                    </div>

                    <Button>Send new reminder</Button>
                </div>

                <div className="grid grid-cols-4 gap-8">
                    {[
                        "Social Intelligence",
                        "Emotional Resilience",
                        "Inner Harmony",
                    ].map((title, i) => {
                        const value = Math.floor(Math.random() * 100);
                        const color =
                            value < 33
                                ? "red"
                                : value < 66
                                ? "yellow"
                                : "green";

                        return (
                            <div key={i} className="cursor-pointer">
                                <Card className="h-full cursor-pointer transition-all hover:shadow-xl">
                                    <CardContent className="p-6">
                                        <h3 className="mb-8 flex w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                                            {title}
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="ml-2 h-6 w-6 text-blu" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            More information
                                                            about {title}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </h3>

                                        <ProgressCircle
                                            value={value}
                                            color={color}
                                        />

                                        <p
                                            className={`mt-4 text-center font-semibold ${
                                                color === "yellow"
                                                    ? "text-amber-500"
                                                    : color === "red"
                                                    ? "text-rose-500"
                                                    : "text-emerald-500"
                                            }`}
                                        >
                                            {title} levels are{" "}
                                            {color === "green"
                                                ? "optimal"
                                                : color === "yellow"
                                                ? "moderate"
                                                : "concerning"}
                                            .
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    <Card className="h-[300px]">
                        <CardContent className="p-4">
                            <h3 className="mb-2 text-lg font-semibold">
                                Cognitive Function Assessment
                            </h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                    <RechartsRadar
                                        name="Current"
                                        dataKey="current"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.6}
                                    />
                                    <RechartsRadar
                                        name="Previous"
                                        dataKey="previous"
                                        stroke="#82ca9d"
                                        fill="#82ca9d"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

const Recommendations = () => {
    const params = useParams();
    const name = params.name || "Vedanta Somnathe";

    return (
        <Suspense fallback={<Loading />}>
            <RecommendationsContent
                userName={decodeURIComponent(name as string)}
            />
        </Suspense>
    );
};

export default Recommendations;
