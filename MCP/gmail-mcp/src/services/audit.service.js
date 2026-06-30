import pool from "../config/mysql.js";

// ─── MySQL: tool_logs table ───────────────────────────────────────────────────
// Columns: id (PK AI), email, tool_name, status, created_at
// Called by every gmail.service.js function after a successful API call
export async function logTool(email, toolName, status = "success") {
  try {
    await pool.query(
      `INSERT INTO tool_logs (email, tool_name, status) VALUES (?, ?, ?)`,
      [email, toolName, status],
    );
  } catch (err) {
    // Non-fatal — log error but don't crash the tool call
    console.error("Failed to write audit log:", err.message);
  }
}
