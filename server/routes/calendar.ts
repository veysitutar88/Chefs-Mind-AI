import { Router, Request, Response } from "express";
import { jwtAuthMiddleware } from "../middleware/jwtAuth.js";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import { requireWriteConfirm } from "../middleware/safeMode.js";
import { createEvent } from "../services/google-mcp.js";

const router = Router();

// POST /api/calendar/payment - Создание события о платеже
router.post("/payment", jwtAuthMiddleware, requireAuth, requireRole(['admin']), requireWriteConfirm, async (req: Request, res: Response) => {
  try {
    const { startTime, description } = req.body;
    
    if (!startTime) {
      return res.status(400).json({
        success: false,
        error: "startTime is required"
      });
    }
    
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid startTime format"
      });
    }
    
    const eventId = await createEvent({
      summary: "Payment Due",
      startTime: startDate,
      description: description || "Payment reminder"
    });
    
    res.json({
      success: true,
      eventId,
      message: "Payment event created successfully"
    });
  } catch (error) {
    console.error("Error creating payment event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment event",
      details: (error as Error).message
    });
  }
});

// POST /api/calendar/delivery - Создание события о доставке
router.post("/delivery", jwtAuthMiddleware, requireAuth, requireRole(['admin']), requireWriteConfirm, async (req: Request, res: Response) => {
  try {
    const { startTime, description } = req.body;
    
    if (!startTime) {
      return res.status(400).json({
        success: false,
        error: "startTime is required"
      });
    }
    
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid startTime format"
      });
    }
    
    const eventId = await createEvent({
      summary: "Delivery Scheduled",
      startTime: startDate,
      description: description || "Delivery reminder"
    });
    
    res.json({
      success: true,
      eventId,
      message: "Delivery event created successfully"
    });
  } catch (error) {
    console.error("Error creating delivery event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create delivery event",
      details: (error as Error).message
    });
  }
});

// POST /api/calendar/followup - Создание события для последующего контакта
router.post("/followup", jwtAuthMiddleware, requireAuth, requireRole(['admin']), requireWriteConfirm, async (req: Request, res: Response) => {
  try {
    const { startTime, description } = req.body;
    
    if (!startTime) {
      return res.status(400).json({
        success: false,
        error: "startTime is required"
      });
    }
    
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid startTime format"
      });
    }
    
    const eventId = await createEvent({
      summary: "Follow-up Scheduled",
      startTime: startDate,
      description: description || "Follow-up reminder"
    });
    
    res.json({
      success: true,
      eventId,
      message: "Follow-up event created successfully"
    });
  } catch (error) {
    console.error("Error creating followup event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create followup event",
      details: (error as Error).message
    });
  }
});

export default router;