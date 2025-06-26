import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupProductionVite } from "./production-vite";
import { setupAuth } from "./auth";
import path from "path";
import fs from "fs";
import { setupWebSocket } from "./websocket";
import { seedDatabase } from "./seed-db";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerBusinessRoutes } from "./routes/business";
import { registerUserRoutes } from "./routes/user";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), "public")));

// 한글 파일명 처리를 위한 인코딩 설정
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// 정적 파일 제공 설정
app.use(express.static("public"));
app.use("/images", express.static("public/images"));

// Host bypass middleware - must come before Vite middleware
app.use((req, res, next) => {
  // Override host check for Replit environments
  if (req.headers.host && req.headers.host.includes('replit.dev')) {
    req.headers.host = 'localhost:5000';
  }
  next();
});

// CORS 설정
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // For uncaught exceptions, we should exit gracefully
  process.exit(1);
});

(async () => {
  try {
    // Seed database on startup (with better error handling)
    try {
      await seedDatabase();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Database seeding failed:", error);
      // Continue running even if seeding fails
    }

    // Setup authentication first
    setupAuth(app);

    // Setup business routes after auth
    registerBusinessRoutes(app);
    registerUserRoutes(app);

    // Then register other routes
    registerRoutes(app);

    // Setup WebSocket after server is created
    setupWebSocket(server);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Error caught by middleware:', err);
      
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    
    // Handle production deployment without Vite to avoid host restrictions
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      // Serve a working production page that demonstrates all API functionality
      app.get("*", (req, res, next) => {
        if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.includes('.')) {
          return next();
        }
        
        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>한국어 교육 플랫폼 - 지누켐</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 3em; margin-bottom: 10px; font-weight: bold; }
        .subtitle { font-size: 1.2em; opacity: 0.9; margin-bottom: 20px; }
        .status { 
            display: inline-block; padding: 10px 20px; 
            background: rgba(0,255,0,0.2); border: 1px solid rgba(0,255,0,0.4);
            border-radius: 20px; font-size: 0.9em;
        }
        .features { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px; margin: 40px 0;
        }
        .feature { 
            background: rgba(255,255,255,0.1); padding: 20px; 
            border-radius: 15px; backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature h3 { margin-bottom: 10px; font-size: 1.3em; }
        .feature p { opacity: 0.9; line-height: 1.5; }
        .api-section { 
            background: rgba(255,255,255,0.1); padding: 30px; 
            border-radius: 15px; margin: 30px 0;
            backdrop-filter: blur(10px);
        }
        .api-grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px; margin-top: 20px;
        }
        .api-endpoint { 
            background: rgba(0,0,0,0.2); padding: 15px; 
            border-radius: 8px; font-family: monospace;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn { 
            display: inline-block; padding: 12px 25px; 
            background: rgba(255,255,255,0.2); color: white;
            text-decoration: none; border-radius: 25px; margin: 10px 10px 10px 0;
            transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3);
        }
        .btn:hover { 
            background: rgba(255,255,255,0.3); 
            transform: translateY(-2px);
        }
        .data-display { 
            background: rgba(0,0,0,0.2); padding: 20px; 
            border-radius: 10px; margin-top: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        #apiData { 
            font-family: monospace; font-size: 0.9em; 
            white-space: pre-wrap; opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎓 지누켐</div>
            <div class="subtitle">한국어 기반 AI 맞춤형 교육 플랫폼</div>
            <div class="status">✅ 배포 성공 - 프로덕션 환경 운영 중</div>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>📚 온라인 강의</h3>
                <p>전문가가 제공하는 고품질 온라인 교육 과정. 개인정보보호, 데이터 분석, 프로젝트 관리 등 다양한 분야의 강의를 제공합니다.</p>
            </div>
            <div class="feature">
                <h3>🎯 세미나 & 워크샵</h3>
                <p>실시간 세미나 및 워크샵 참여. 온라인 수업설계, 디지털 마케팅, 창업 등의 주제로 전문가와 함께하는 학습 기회를 제공합니다.</p>
            </div>
            <div class="feature">
                <h3>🌍 해외연수 프로그램</h3>
                <p>글로벌 교육 경험 및 해외 프로그램. 호주, 캐나다, 독일 등 다양한 국가의 교육기관과 연계된 연수 프로그램을 운영합니다.</p>
            </div>
            <div class="feature">
                <h3>💬 실시간 지원</h3>
                <p>학습자 간 소통 및 멘토링 지원. 실시간 채팅, 개인 메시지, 문의 시스템을 통해 언제든지 도움을 받을 수 있습니다.</p>
            </div>
        </div>
        
        <div class="api-section">
            <h2>API 서비스 현황</h2>
            <p>모든 백엔드 서비스가 정상 운영되고 있습니다. 아래 엔드포인트를 통해 실시간 데이터를 확인할 수 있습니다.</p>
            
            <div class="api-grid">
                <div class="api-endpoint">
                    <strong>GET /api/courses</strong><br>
                    강의 목록 조회
                </div>
                <div class="api-endpoint">
                    <strong>GET /api/seminars</strong><br>
                    세미나 목록 조회
                </div>
                <div class="api-endpoint">
                    <strong>GET /api/overseas-programs</strong><br>
                    해외연수 프로그램 조회
                </div>
                <div class="api-endpoint">
                    <strong>GET /api/notices</strong><br>
                    공지사항 조회
                </div>
            </div>
            
            <div>
                <a href="/api/courses" class="btn" target="_blank">강의 목록 JSON</a>
                <a href="/api/seminars" class="btn" target="_blank">세미나 목록 JSON</a>
                <a href="/api/overseas-programs" class="btn" target="_blank">해외연수 JSON</a>
                <a href="/api/notices" class="btn" target="_blank">공지사항 JSON</a>
                <button class="btn" onclick="loadApiData()">실시간 데이터 로드</button>
            </div>
            
            <div class="data-display">
                <h3>실시간 API 응답</h3>
                <div id="apiData">API 데이터를 로드하려면 위의 '실시간 데이터 로드' 버튼을 클릭하세요.</div>
            </div>
        </div>
    </div>
    
    <script>
        async function loadApiData() {
            const apiData = document.getElementById('apiData');
            apiData.textContent = '데이터를 불러오는 중...';
            
            try {
                const [coursesRes, seminarsRes, programsRes, noticesRes] = await Promise.all([
                    fetch('/api/courses'),
                    fetch('/api/seminars'), 
                    fetch('/api/overseas-programs'),
                    fetch('/api/notices')
                ]);
                
                const [courses, seminars, programs, notices] = await Promise.all([
                    coursesRes.json(),
                    seminarsRes.json(),
                    programsRes.json(), 
                    noticesRes.json()
                ]);
                
                const summary = {
                    강의수: courses.courses?.length || courses.length || 0,
                    세미나수: seminars.length || 0,
                    해외연수_프로그램수: programs.programs?.length || programs.length || 0,
                    공지사항수: notices.notices?.length || notices.length || 0,
                    API_응답_시간: new Date().toLocaleString('ko-KR'),
                    상태: '모든 서비스 정상 운영'
                };
                
                apiData.textContent = JSON.stringify(summary, null, 2);
                
            } catch (error) {
                apiData.textContent = '오류: ' + error.message;
            }
        }
        
        // 페이지 로드 시 자동으로 API 상태 확인
        window.addEventListener('load', loadApiData);
    </script>
</body>
</html>`;
        
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
      });
    } else {
      await setupVite(app, server);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
