import { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";

// 테이블 초기화 상태 추적
let progressTableInitialized = false;
let progressTableInitializing = false;

export function registerUserRoutes(app: Express) {
  // ... existing code ...

  // 특정 강의 수강 정보 조회 API
  app.get(
    "/api/user/enrollments/course/:courseId",
    isAuthenticated,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const userId = req.user?.id;

        if (!userId) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        // 해당 사용자의 모든 수강 정보 조회
        const enrollments = await storage.getEnrollments(userId, courseId);

        // 해당 강의에 대한 수강 정보 찾기
        const enrollment = enrollments.find((e) => e.courseId === courseId);

        if (!enrollment) {
          return res.json({ enrollment: null });
        }

        res.json({ enrollment });
      } catch (error) {
        console.error("Error fetching course enrollment:", error);
        res
          .status(500)
          .json({ message: "수강 정보 조회 중 오류가 발생했습니다." });
      }
    },
  );

  // 수료증 발급 API
  app.post(
    "/api/user/enrollments/:enrollmentId/issue-certificate",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const userId = req.user?.id;

        // 수강 정보 조회
        const enrollment = await storage.getEnrollment(enrollmentId);
        if (!enrollment || enrollment.userId !== userId) {
          return res
            .status(404)
            .json({ message: "수강 정보를 찾을 수 없습니다." });
        }

        // 과정 정보 조회
        const course = await storage.getCourse(enrollment.courseId);
        if (!course) {
          return res
            .status(404)
            .json({ message: "과정 정보를 찾을 수 없습니다." });
        }

        // 진도율 80% 이상인지 확인
        if (!enrollment.progress || enrollment.progress < 80) {
          return res
            .status(400)
            .json({
              message: "진도율이 80% 이상일 때 수료증을 발급받을 수 있습니다.",
            });
        }

        // 이미 발급된 수료증이 있는지 확인
        const existingCertificate = await storage.getCertificate(enrollmentId);
        if (existingCertificate) {
          return res
            .status(400)
            .json({ message: "이미 발급된 수료증이 있습니다." });
        }

        // 수료증 발급
        const certificate = await storage.createCertificate({
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          enrollmentId: enrollmentId,
          issuedBy: course.providerId || 1,
          certificateNumber: `CERT-${enrollmentId}-${new Date().getFullYear()}`,
          issuedAt: new Date(),
          status: "active",
        });

        // 수강 상태 업데이트
        await storage.updateEnrollment(enrollmentId, {
          status: "completed",
          completedAt: new Date(),
        });

        res.json({
          message: "수료증이 성공적으로 발급되었습니다.",
          certificate,
        });
      } catch (error) {
        console.error("Error issuing certificate:", error);
        res
          .status(500)
          .json({ message: "수료증 발급 중 오류가 발생했습니다." });
      }
    },
  );

  // 수료증 조회 API
  app.get(
    "/api/user/enrollments/:enrollmentId/certificate",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const userId = req.user?.id;

        // 수강 정보 조회
        const enrollment = await storage.getEnrollment(enrollmentId);
        if (!enrollment || enrollment.userId !== userId) {
          return res
            .status(404)
            .json({ message: "수강 정보를 찾을 수 없습니다." });
        }

        // 과정 정보 조회
        const course = await storage.getCourse(enrollment.courseId);
        if (!course) {
          return res
            .status(404)
            .json({ message: "과정 정보를 찾을 수 없습니다." });
        }

        // 사용자 정보 조회
        const user = await storage.getUser(userId);
        if (!user) {
          return res
            .status(404)
            .json({ message: "사용자 정보를 찾을 수 없습니다." });
        }

        // 수료증 정보 조회
        let certificate = await storage.getCertificate(enrollmentId);

        // 수료증이 없고 진도율이 80% 이상이면 자동으로 발급
        if (!certificate && enrollment.progress && enrollment.progress >= 80) {
          certificate = await storage.createCertificate({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            enrollmentId: enrollmentId,
            issuedBy: course.providerId || 1,
            certificateNumber: `CERT-${enrollmentId}-${new Date().getFullYear()}`,
            issuedAt: new Date(),
            status: "active",
          });

          // 수강 상태 업데이트
          await storage.updateEnrollment(enrollmentId, {
            status: "completed",
            completedAt: new Date(),
          });
        }

        // 수료증이 없고 진도율이 80% 미만이면 에러
        if (!certificate) {
          return res.status(400).json({
            message: "진도율이 80% 이상일 때 수료증이 자동으로 발급됩니다.",
            currentProgress: enrollment.progress || 0,
          });
        }

        const formatDate = (date: Date | null | undefined) => {
          if (!date) return "";
          const d = new Date(date);
          return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
        };

        // HTML 응답 생성
        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>수료증</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
              
              body {
                margin: 0;
                padding: 0;
                font-family: 'Noto Sans KR', sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .certificate-container {
                width: 210mm;
                height: 267mm;
                margin: 10px auto;
                position: relative;
                background: url('/images/certificate-border.png') no-repeat center;
                background-size: 100% 100%;
                padding: 0;
                box-sizing: border-box;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              
              .certificate-content {
                position: relative;
                width: 100%;
                height: 100%;
                padding: 60px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
              }
              
              .document-number {
                position: absolute;
                top: 100px;
                right: 100px;
                font-size: 14px;
                color: #666;
              }
              
              .certificate-text {
                margin-top: 500px;
                font-size: 18px;
                line-height: 2;
                margin-bottom: 5px;
              }
              
              .certificate-footer {
                margin-top: auto;
                margin-bottom: 10px;
              }
              
              .issue-date {
                margin-bottom: 10px;
              }
              
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 40px;
                position: relative;
                z-index: 2;
              }
              
              .company-seal {
                position: absolute;
                width: 80px;
                height: 80px;
                background: url('/images/seal.png') no-repeat center;
                background-size: contain;
                right: -80px;
                bottom: -10px;
                opacity: 0.9;
                z-index: 1;
              }

              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                .certificate-container {
                  margin: 0;
                  box-shadow: none;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  background: url('/images/certificate-border.png') no-repeat center !important;
                  background-size: 100% 100% !important;
                }

                .company-seal {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  background: url('/images/seal.png') no-repeat center !important;
                  background-size: contain !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="certificate-container">
              <div class="document-number">
                발급번호: 제 ${certificate?.id || enrollmentId}-${new Date().getFullYear()}호
              </div>

              <div class="certificate-content">
                <div class="certificate-text">
                  ${user.name} 님은 '${course.title}' 교육과정을<br />
                  성실히 이수하였기에 이 증서를 수여합니다.<br /><br />
                  <span style="font-size: 14px; color: #666;">
                    본 수료증은 「평생교육법」 제25조 및 「학원의 설립·운영 및 과외교습에 관한 법률」<br />
                    제2조의2에 의거하여 발급되었습니다.
                  </span>
                </div>

                <div class="certificate-footer">
                  <div class="issue-date">
                    발급일: ${formatDate(certificate.issuedAt)}
                  </div>

                  <div class="company-name">
                    (주) 지누켐 대표이사
                    <div class="company-seal"></div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

        // Content-Type을 text/html로 설정하고 HTML 응답
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
      } catch (error) {
        console.error("Error generating certificate:", error);
        res
          .status(500)
          .json({ message: "수료증 생성 중 오류가 발생했습니다." });
      }
    },
  );

  // 테이블 생성 헬퍼 함수
  async function ensureProgressTable(requestId: string) {
    // 이미 초기화되었으면 스킵
    if (progressTableInitialized) {
      return;
    }

    // 초기화 중이면 대기
    if (progressTableInitializing) {
      let attempts = 0;
      while (progressTableInitializing && attempts < 50) {
        // 최대 5초 대기
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      return;
    }

    try {
      progressTableInitializing = true;

      const tableExists = await storage.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'enrollment_progress'
        );
      `);

      if (!tableExists.rows[0].exists) {
        // 테이블 생성
        await storage.query(`
          CREATE TABLE IF NOT EXISTS enrollment_progress (
            id SERIAL PRIMARY KEY,
            enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            item_id VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(enrollment_id, user_id, item_id)
          );
        `);

        // 인덱스 생성
        await storage.query(`
          CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id);
        `);
        await storage.query(`
          CREATE INDEX IF NOT EXISTS idx_enrollment_progress_user_id ON enrollment_progress(user_id);
        `);
        await storage.query(`
          CREATE INDEX IF NOT EXISTS idx_enrollment_progress_type ON enrollment_progress(type);
        `);
      }

      progressTableInitialized = true;
    } catch (error) {
      progressTableInitialized = true; // 에러가 발생해도 더 이상 시도하지 않음
    } finally {
      progressTableInitializing = false;
    }
  }

  // 전체 진도율 계산 헬퍼 함수
  async function calculateTotalProgress(
    enrollmentId: number,
    userId: number,
    course: any,
  ): Promise<number> {
    try {
      // 테이블 존재 여부 확인
      const tableExists = await storage.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'enrollment_progress'
        );
      `);

      if (!tableExists.rows[0].exists) {
        // 테이블이 없으면 0 반환
        return 0;
      }

      if (!course.curriculumItems || !Array.isArray(course.curriculumItems)) {
        // 커리큘럼이 없는 경우 현재 저장된 개별 진도율의 평균 반환
        try {
          const avgResult = await storage.query(
            `
            SELECT COALESCE(AVG(progress), 0) as avg_progress
            FROM enrollment_progress
            WHERE enrollment_id = $1 AND user_id = $2
          `,
            [enrollmentId, userId],
          );

          return Math.round(parseFloat(avgResult.rows[0]?.avg_progress || 0));
        } catch (error) {
          console.error("Error calculating average progress:", error);
          return 0;
        }
      }

      let totalItems = 0;
      let completedItems = 0;

      // 커리큘럼 항목 순회
      for (const item of course.curriculumItems) {
        // 비디오 항목 처리
        if (
          item.videos &&
          Array.isArray(item.videos) &&
          item.videos.length > 0
        ) {
          totalItems += item.videos.length;

          // 각 비디오 ID별로 개별 확인
          for (const video of item.videos) {
            try {
              const videoResult = await storage.query(
                `
                SELECT progress FROM enrollment_progress
                WHERE enrollment_id = $1 
                AND user_id = $2 
                AND item_id = $3
                AND type = $4
              `,
                [enrollmentId, userId, video.id.toString(), "video"],
              );

              if (
                videoResult.rows.length > 0 &&
                videoResult.rows[0].progress >= 90
              ) {
                completedItems++;
              }
            } catch (error) {
              console.error("Error checking video progress:", error);
            }
          }
        }

        // 퀴즈 항목 처리
        if (
          item.quizzes &&
          Array.isArray(item.quizzes) &&
          item.quizzes.length > 0
        ) {
          totalItems += item.quizzes.length;

          // 각 퀴즈 ID별로 개별 확인
          for (const quiz of item.quizzes) {
            try {
              const quizResult = await storage.query(
                `
                SELECT progress FROM enrollment_progress
                WHERE enrollment_id = $1 
                AND user_id = $2 
                AND item_id = $3
                AND type = $4
              `,
                [enrollmentId, userId, quiz.id.toString(), "quiz"],
              );

              if (
                quizResult.rows.length > 0 &&
                quizResult.rows[0].progress >= 60
              ) {
                completedItems++;
              }
            } catch (error) {
              console.error("Error checking quiz progress:", error);
            }
          }
        }
      }

      return totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;
    } catch (error) {
      console.error("Error in calculateTotalProgress:", error);
      return 0;
    }
  }

  // 진도율 업데이트 API
  app.post(
    "/api/user/enrollments/:enrollmentId/progress",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const { itemId, itemType, progress } = req.body;
        const userId = req.user?.id;

        // 기본 검증
        if (!userId) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        if (!itemId || !itemType || typeof progress !== "number") {
          return res.status(400).json({ message: "잘못된 요청 데이터입니다." });
        }

        // 테이블 생성 (필요시)
        await ensureProgressTable("simple");

        // 더 안전한 방식 - UPDATE 시도 후 INSERT
        try {
          const enrollmentIdSafe = parseInt(enrollmentId.toString());
          const userIdSafe = parseInt(userId.toString());
          const itemIdSafe = itemId.toString().replace(/'/g, "''"); // SQL injection 방지
          const itemTypeSafe = itemType.toString().replace(/'/g, "''");
          const progressSafe = parseInt(progress.toString());

          // 먼저 기존 레코드 확인
          const existingRecord = await storage.query(`
          SELECT id FROM enrollment_progress 
          WHERE enrollment_id = ${enrollmentIdSafe} 
          AND user_id = ${userIdSafe} 
          AND item_id = '${itemIdSafe}'
        `);

          if (existingRecord.rows.length > 0) {
            // 레코드가 있으면 UPDATE
            await storage.query(`
            UPDATE enrollment_progress 
            SET progress = ${progressSafe}, updated_at = CURRENT_TIMESTAMP
            WHERE enrollment_id = ${enrollmentIdSafe} 
            AND user_id = ${userIdSafe} 
            AND item_id = '${itemIdSafe}'
          `);
          } else {
            // 레코드가 없으면 INSERT
            await storage.query(`
            INSERT INTO enrollment_progress 
            (enrollment_id, user_id, item_id, type, progress, created_at, updated_at)
            VALUES (${enrollmentIdSafe}, ${userIdSafe}, '${itemIdSafe}', '${itemTypeSafe}', ${progressSafe}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
          }

          console.log(`Progress saved: ${itemType} ${itemId} = ${progress}%`);

          // 간단한 성공 응답
          res.json({
            success: true,
            message: "진도율이 저장되었습니다.",
            progress: progress,
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
          res
            .status(500)
            .json({ message: "데이터베이스 오류가 발생했습니다." });
        }
      } catch (error) {
        console.error("Progress API error:", error);
        res
          .status(500)
          .json({ message: "진도율 업데이트 중 오류가 발생했습니다." });
      }
    },
  );

  // 진도율 조회 API
  app.get(
    "/api/user/enrollments/:enrollmentId/progress",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const userId = req.user?.id;

        if (!userId) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        // 수강 정보 조회
        const enrollment = await storage.getEnrollment(enrollmentId);
        if (!enrollment || enrollment.userId !== userId) {
          return res
            .status(404)
            .json({ message: "수강 정보를 찾을 수 없습니다." });
        }

        try {
          // 완료된 비디오와 퀴즈 조회
          const enrollmentIdSafe = parseInt(enrollmentId.toString());
          const userIdSafe = parseInt(userId.toString());

          // 간단하게 모든 완료된 항목 반환
          const result = await storage.query(`
          SELECT item_id, type, progress
          FROM enrollment_progress
          WHERE enrollment_id = ${enrollmentIdSafe}
          AND user_id = ${userIdSafe}
        `);

          console.log("Query result type:", typeof result);
          console.log("Query result:", result);
          console.log("Result rows:", result.rows);

          const videoIds = [];
          const quizIds = [];

          // result.rows가 실제 데이터 배열
          if (result.rows && Array.isArray(result.rows)) {
            for (const row of result.rows) {
              console.log("Processing actual row:", row);
              const itemId = row.item_id;
              const type = row.type;
              const progress = row.progress;

              if (type === "video" && progress >= 90) {
                videoIds.push(itemId);
              } else if (type === "quiz" && progress >= 60) {
                quizIds.push(itemId);
              }
            }
          }

          console.log("Final video IDs:", videoIds);
          console.log("Final quiz IDs:", quizIds);

          res.json({
            completedVideos: videoIds,
            completedQuizzes: quizIds,
            totalProgress: enrollment.progress || 0,
          });
        } catch (error) {
          // 쿼리 오류 발생 시 빈 데이터 반환
          console.error("Error fetching progress details:", error);
          res.json({
            completedVideos: [],
            completedQuizzes: [],
            totalProgress: enrollment.progress || 0,
          });
        }
      } catch (error) {
        console.error("Error in progress API:", error);
        res
          .status(500)
          .json({ message: "진도율 조회 중 오류가 발생했습니다." });
      }
    },
  );
}
