import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "../shared/schema.js";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server, 
    path: "/ws",
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024 * 4,
        windowBits: 13,
        level: 3,
      },
    }
  });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("New WebSocket connection established");
    
    // Set up heartbeat to prevent connection timeout
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);

        if (message.type === "auth") {
          // Store user authentication info
          (ws as any).userId = message.userId;
          (ws as any).isAdmin = message.isAdmin;
          console.log(
            `User ${message.userId} authenticated, admin: ${message.isAdmin}`,
          );
          
          // Send authentication confirmation
          ws.send(JSON.stringify({
            type: "auth_success",
            message: "Authentication successful"
          }));
        } else if (message.type === "ping") {
          // Respond to ping messages to maintain connection
          ws.send(JSON.stringify({
            type: "pong",
            timestamp: Date.now()
          }));
        } else if (message.type === "chat") {
          // Validate and save chat message
          const chatMessage = insertChatMessageSchema.parse({
            userId: message.userId,
            message: message.message,
            isAdmin: message.isAdmin || false,
          });

          const savedMessage = await storage.createChatMessage(chatMessage);

          // Broadcast to all connected clients
          const broadcastData = JSON.stringify({
            type: "chat",
            data: savedMessage,
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connection established",
      }),
    );

    // Send initial chat history (with error handling)
    storage
      .getChatMessages(20)
      .then((messages) => {
        ws.send(
          JSON.stringify({
            type: "chat_history",
            data: messages,
          }),
        );
      })
      .catch((error) => {
        console.error("Failed to load chat history:", error);
      });
  });

  // Set up heartbeat interval to check connection health
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if ((ws as any).isAlive === false) {
        console.log('Terminating dead WebSocket connection');
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  // Clean up interval when server closes
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

// Send notification to all admin users
export function sendAdminNotification(notification: {
  title: string;
  message: string;
  data?: any;
}) {
  if (!wss) return;

  const adminNotification = {
    type: "admin_notification",
    title: notification.title,
    message: notification.message,
    data: notification.data,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (client as any).isAdmin) {
      client.send(JSON.stringify(adminNotification));
    }
  });
}

// Send notification to specific user
export function sendUserNotification(
  userId: number,
  notification: {
    title: string;
    message: string;
    data?: any;
  },
) {
  if (!wss) return;

  const userNotification = {
    type: "user_notification",
    title: notification.title,
    message: notification.message,
    data: notification.data,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as any).userId === userId
    ) {
      client.send(JSON.stringify(userNotification));
    }
  });
}
