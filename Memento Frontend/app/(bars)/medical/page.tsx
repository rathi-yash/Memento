"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Activity, Clock, TrendingUp, AlertCircle, User } from "lucide-react";
import { API_URL } from "@/lib/constants";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type Relation = {
    id: string;
    name: string;
    relationship: string;
    photo?: string;
    email?: string;
    count?: {
        value: number;
        first: string;
        last: string;
    };
};

export default function MedicalDashboard() {
    const [relations, setRelations] = useState<Relation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchRelations();
    }, []);

    const fetchRelations = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-user`);
            setRelations(res.data.relations || []);
        } catch (error) {
            console.log("ERROR: ", error);
        }
    };

    const filteredRelations = relations.filter((relation) =>
        relation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalInteractions = relations.reduce(
        (sum, rel) => sum + (rel.count?.value || 0),
        0
    );
    const avgInteractions =
        relations.length > 0 ? totalInteractions / relations.length : 0;
    const highActivityCount = relations.filter(
        (rel) => (rel.count?.value || 0) > 5
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6 px-8 py-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Medical Dashboard
                </h1>
                <p className="text-gray-600">
                    Patient interaction analysis and monitoring
                </p>
            </div>

            <div className="px-8 pb-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Interactions
                            </CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {totalInteractions}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Relations
                            </CardTitle>
                            <User className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {relations.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Avg. Interactions
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {avgInteractions.toFixed(1)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                High Activity
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {highActivityCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Table */}
                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold text-gray-900">
                                Patient Interactions
                            </CardTitle>
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Person
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Relationship
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Interactions
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            First Contact
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Last Contact
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRelations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-12 text-gray-500"
                                            >
                                                No interactions recorded yet
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRelations.reverse().map((relation) => {
                                            const count = relation.count?.value || 0;
                                            let statusColor = "text-gray-600";
                                            if (count > 6) statusColor = "text-red-600";
                                            else if (count > 3) statusColor = "text-amber-600";
                                            else if (count > 0) statusColor = "text-green-600";

                                            return (
                                                <tr
                                                    key={relation.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <Avatar className="w-10 h-10 border-2 border-gray-200">
                                                            <AvatarImage
                                                                src={relation.photo}
                                                                alt={relation.name}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                                                                {relation.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-900 font-medium">
                                                        {relation.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600">
                                                        {relation.relationship}
                                                    </td>
                                                    <td
                                                        className={`py-4 px-4 text-center font-bold ${statusColor}`}
                                                    >
                                                        {count}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600 text-sm">
                                                        {relation.count?.first
                                                            ? new Date(
                                                                  relation.count.first
                                                              ).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600 text-sm">
                                                        {relation.count?.last
                                                            ? new Date(
                                                                  relation.count.last
                                                              ).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <Link href={`/user/${relation.name}`}>
                                                            <Button
                                                                size="sm"
                                                                className="bg-purple-600 hover:bg-purple-700 !text-white font-semibold"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredRelations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                                Showing {filteredRelations.length} of {relations.length}{" "}
                                interactions
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

