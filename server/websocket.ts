import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "../shared/schema.js";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("New WebSocket connection established");

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
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
              try {
                client.send(broadcastData);
              } catch (sendError) {
                console.error("Failed to send message to client:", sendError);
              }
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        try {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            }),
          );
        } catch (sendError) {
          console.error("Failed to send error message:", sendError);
        }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    // Send welcome message
    try {
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket connection established",
        }),
      );
    } catch (error) {
      console.error("Failed to send welcome message:", error);
    }

    // Send initial chat history (with error handling)
    storage
      .getChatMessages(20)
      .then((messages) => {
        try {
          ws.send(
            JSON.stringify({
              type: "chat_history",
              data: messages,
            }),
          );
        } catch (error) {
          console.error("Failed to send chat history:", error);
        }
      })
      .catch((error) => {
        console.error("Failed to load chat history:", error);
      });
  });

  return wss;
}

// Send notification to all admin users
export function sendAdminNotification(notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  if (!wss) return;

  const adminNotification = {
    ...notification,
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
    type: string;
    title: string;
    message: string;
    data?: any;
  },
) {
  if (!wss) return;

  const userNotification = {
    ...notification,
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
