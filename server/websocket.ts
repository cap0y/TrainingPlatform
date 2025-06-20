import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { insertChatMessageSchema } from '@shared/schema';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'chat') {
          // Validate and save chat message
          const chatMessage = insertChatMessageSchema.parse({
            userId: message.userId,
            message: message.message,
            isAdmin: message.isAdmin || false
          });
          
          const savedMessage = await storage.createChatMessage(chatMessage);
          
          // Broadcast to all connected clients
          const broadcastData = JSON.stringify({
            type: 'chat',
            data: savedMessage
          });
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Send initial chat history
    storage.getChatMessages(20).then(messages => {
      ws.send(JSON.stringify({
        type: 'chat_history',
        data: messages
      }));
    });
  });

  return wss;
}
