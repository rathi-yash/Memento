"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Brain, Users, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend window interface for particles.js
declare global {
    interface Window {
        particlesJS: any;
    }
}

// Particles.js configuration
const particlesConfig = {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: ["#667eea", "#764ba2", "#f093fb"]
        },
        shape: {
            type: "circle",
        },
        opacity: {
            value: 0.5,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#667eea",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "grab"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 1
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
};

const Hero = () => {
    useEffect(() => {
        // Load particles.js library
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
            if (window.particlesJS) {
                window.particlesJS('particles-js', particlesConfig);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Particles Background */}
            <div id="particles-js" className="absolute inset-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                {/* Hero Section */}
                <div className="text-center space-y-6 mb-16 float">
                    <h1 className="text-6xl md:text-8xl font-bold gradient-text">
                        Memento
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        Empowering dementia patients with AI-powered memory assistance
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mb-16">
                    {[
                        {
                            icon: <Users className="w-8 h-8" />,
                            title: "Recognize Loved Ones",
                            description: "Facial recognition helps identify family members and friends",
                            link: "/user"
                        },
                        {
                            icon: <Brain className="w-8 h-8" />,
                            title: "Conversation Memory",
                            description: "AI-powered speech recognition captures and analyzes conversations",
                            link: "/summary"
                        },
                        {
                            icon: <Activity className="w-8 h-8" />,
                            title: "Medical Insights",
                            description: "Track health data and provide insights for caregivers",
                            link: "/medical"
                        }
                    ].map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <div className="glass rounded-2xl p-6 card-hover cursor-pointer h-full">
                                <div className="text-primary mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 flex-wrap justify-center">
                    <Link href="/user">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-xl">
                            <Users className="w-5 h-5 mr-2" />
                            View Relations
                        </Button>
                    </Link>
                    <Link href="/medical">
                        <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-primary text-primary hover:bg-primary/10">
                            <Activity className="w-5 h-5 mr-2" />
                            Medical Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
