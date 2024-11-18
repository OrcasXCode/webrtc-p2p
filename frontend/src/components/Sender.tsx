import { useEffect, useRef, useState } from "react";

export const Sender = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "sender" }));
        };

        return () => {
            socket.close();
        };
    }, []);

    const initiateCommunication = async () => {
        if (!socket) {
            alert("Socket not found");
            return;
        }

        const pc = new RTCPeerConnection();
        setPc(pc);

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play();
            }
        };

        // Handle signaling messages
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "createAnswer") {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === "iceCandidate") {
                await pc.addIceCandidate(message.candidate);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: "createOffer", sdp: pc.localDescription }));
        };

        // Get the local stream and send it to the receiver
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
            <button onClick={initiateCommunication}>Start Communication</button>
        </div>
    );
};
