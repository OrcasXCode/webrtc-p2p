"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        //identifying the ws as a sender
        if (message.type === 'sender') {
            senderSocket = ws;
            ws.send('Sender registered');
        }
        //identifying the ws as a sender
        else if (message.type === 'receiver') {
            receiverSocket = ws;
            ws.send('Receiver registered');
        }
        //creating offer from the sender and pushing it towards receiver
        else if (message.type === 'createOffer') {
            if (ws !== senderSocket)
                return;
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
        }
        //creating oanswer from the receiver and pushing it towards sender
        else if (message.type === 'createAnswer') {
            if (ws !== receiverSocket)
                return;
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
        }
        //if its iceCandidate then send it to the opposite side 
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket)
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            else if (ws === receiverSocket)
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
        }
    });
});
