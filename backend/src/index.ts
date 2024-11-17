import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data:any) {
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
    else if(message.type==='createOffer'){
      if(ws!==senderSocket) return;
      receiverSocket?.send(JSON.stringify({type:'createOffer',sdp:message.sdp}));
    }
    //creating oanswer from the receiver and pushing it towards sender
    else if(message.type==='createAnswer'){
      if(ws!==receiverSocket) return;
      senderSocket?.send(JSON.stringify({type:'createAnswer',sdp:message.sdp}));
    }
    //if its iceCandidate then send it to the opposite side 
    else if(message.type==='iceCandidate'){
      if(ws===senderSocket) receiverSocket?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}));
      else if(ws===receiverSocket) senderSocket?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}));
    }

  });
});
