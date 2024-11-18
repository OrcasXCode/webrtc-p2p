import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
        };

        startReceiving(socket);

        return () => {
            socket.close();
        };
    }, []);

    const startReceiving = (socket: WebSocket) => {
        const pc = new RTCPeerConnection();

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play();
            }
        };

        // Handle signaling messages
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "createOffer") {
                pc.setRemoteDescription(message.sdp)
                    .then(() => pc.createAnswer())
                    .then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
                    })
                    .catch((error) => {
                        console.error("Error during signaling:", error);
                    });
            } else if (message.type === "iceCandidate") {
                pc.addIceCandidate(message.candidate).catch((error) => {
                    console.error("Error adding ICE candidate:", error);
                });
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        // Get local stream and show it in the local video
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play();
            }
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        });
    };

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "300px" }} />
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
        </div>
    );
};
