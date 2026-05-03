import { WebClient } from "@slack/web-api";
import crypto from "crypto";

export function getSlackClient() {
  return new WebClient(process.env.SLACK_BOT_TOKEN);
}

// Slack 요청 서명 검증
export function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
    if (parseInt(timestamp) < fiveMinutesAgo) return false;

    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature =
      "v0=" +
      crypto
        .createHmac("sha256", signingSecret)
        .update(sigBasestring)
        .digest("hex");

    if (mySignature.length !== signature.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
