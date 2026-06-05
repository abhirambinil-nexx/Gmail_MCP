import express from "express";
import { oauth2Client } from "../config/google.js";
import { callback } from "../controllers/gmail.controller.js";

const router = express.Router();

router.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
    ],
  });

  res.redirect(url);
});

router.get("/callback", callback);

export default router;
