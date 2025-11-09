"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WebcamVideoStream: React.FC = () => {
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const startWebcamStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsStreaming(true);

                // Connect to the WebSocket endpoint
                connectToWebSocket(stream);
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        if (isStreaming) {
            startWebcamStream();
        }

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, [isStreaming]);

    const handleStartStop = () => {
        setIsStreaming((prev) => !prev);
    };

    const connectToWebSocket = (stream: MediaStream) => {
        const webSocket = new WebSocket("http://localhost:8000/api/live-video");

        webSocket.onopen = () => {
            console.log("WebSocket connection established.");

            // Start streaming video data to the WebSocket
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.addEventListener("dataavailable", (event) => {
                if (webSocket.readyState === webSocket.OPEN) {
                    webSocket.send(event.data);
                }
            });
        };

        webSocket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        webSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        webSocket.onmessage = (event) => {
            // Handle any data received from the server
            console.log("Received data from server:", event.data);
        };

        webSocketRef.current = webSocket;
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Webcam Video Streaming to API</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <video
                            ref={videoRef}
                            className="w-full max-w-[640px] h-auto"
                            autoPlay
                            playsInline
                        />
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button
                            type="button"
                            variant={isStreaming ? "destructive" : "default"}
                            onClick={handleStartStop}
                        >
                            {isStreaming ? "Stop" : "Start"} Streaming
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WebcamVideoStream;
