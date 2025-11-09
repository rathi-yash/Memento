"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon, Upload, Users, MessageSquare, Clock, Phone, Mail } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

type Relation = {
    id: string;
    name: string;
    relationship: string;
    photo?: string;
    email?: string;
    messages?: any[];
    count?: {
        value: number;
        first: Date;
        last: Date;
    };
};

const RelationsPage = () => {
    const [open, setOpen] = useState(false);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        relationship: "",
        photo: "",
        email: "",
    });
    const [previewUrl, setPreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchRelations();
    }, [open]);

    const fetchRelations = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-user`);
            setRelations(res.data.relations || []);
        } catch (error) {
            console.log("ERROR: ", error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await axios.post(
                "https://api.imgur.com/3/image",
                formData,
                {
                    headers: {
                        Authorization: "Client-ID YOUR_IMGUR_CLIENT_ID",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setFormData((prev) => ({
                ...prev,
                photo: response.data.data.link,
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await axios.post(`${API_URL}/add-relation`, {
                relation: { ...formData, id: uuidv4() },
            });
            setOpen(false);
            setFormData({
                name: "",
                relationship: "",
                photo: "",
                email: "",
            });
            setPreviewUrl("");
            fetchRelations();
        } catch (error) {
            console.error("Error adding relation:", error);
        }
    };

    const filteredRelations = relations.filter((relation) =>
        relation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        relation.relationship.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen p-8 relative">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text mb-2">
                                Relations
                            </h1>
                            <p className="text-muted-foreground">
                                People you love, all in one place
                            </p>
                        </div>
                        <Button
                            onClick={() => setOpen(!open)}
                            className="bg-primary hover:bg-primary/90"
                            size="lg"
                        >
                            <PlusIcon className="mr-2" /> Add Relation
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or relationship..."
                            className="pl-10 glass"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Relations Grid */}
                {filteredRelations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Users className="w-20 h-20 text-muted-foreground mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">No relations yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start by adding your first relation
                        </p>
                        <Button
                            onClick={() => setOpen(true)}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <PlusIcon className="mr-2" /> Add First Relation
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRelations.reverse().map((relation) => (
                            <Link key={relation.id} href={`/user/${relation.name}`}>
                                <Card className="glass card-hover cursor-pointer border-border">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <Avatar className="w-16 h-16 border-2 border-primary">
                                                <AvatarImage
                                                    src={relation.photo}
                                                    alt={relation.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-primary/20 text-primary">
                                                    {relation.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-1">
                                                    {relation.name}
                                                </h3>
                                                <p className="text-sm text-primary">
                                                    {relation.relationship}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {relation.email || faker.internet.email()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {faker.phone.number().slice(0, 13)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                {relation.messages?.length || 0} conversations
                                            </div>
                                            {relation.count && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {relation.count.value} interactions
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Relation Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md glass">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add New Relation</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <label htmlFor="img-input">
                                    <Avatar className="h-24 w-24 cursor-pointer border-2 border-primary">
                                        {previewUrl ? (
                                            <AvatarImage
                                                src={previewUrl}
                                                alt="Preview"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <AvatarFallback>
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    name="img-input"
                                    id="img-input"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>
                            {isUploading && (
                                <span className="text-sm text-muted-foreground">
                                    Uploading...
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                                placeholder="John Doe"
                                className="glass"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship</Label>
                            <Input
                                id="relationship"
                                value={formData.relationship}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        relationship: e.target.value,
                                    }))
                                }
                                required
                                placeholder="Father / Mother / Sibling / Friend"
                                className="glass"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                placeholder="john@example.com"
                                className="glass"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90"
                                disabled={isUploading}
                            >
                                Add Relation
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RelationsPage;
