import { Router, Request, Response } from "express";
const router = Router();
router.get("/api/safe/status", (req:Request,res:Response)=>{
  res.json({
    safe_mode: (process.env.SAFE_MODE || "on").toLowerCase(),
    requires_header: "X-Confirm-Code",
    confirm_code_set: Boolean(process.env.CONFIRM_CODE)
  });
});
export default router;
