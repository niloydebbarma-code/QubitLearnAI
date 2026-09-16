/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QubitLearn AI - Enterprise Server-Side Rate Limiter & AI Abuse Guard
 * Protects against DDoS attacks, automated scrapers, and excessive Vertex AI / LLM billing.
 */

import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
  lastRequestTime: number;
}

class SlidingWindowRateLimiter {
  private ipRecords = new Map<string, RateLimitRecord>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly tierName: string;

  constructor(maxRequests: number, windowMs: number, tierName: string) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.tierName = tierName;

    // Automatic cleanup of expired entries every 5 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.ipRecords.entries()) {
      if (now - record.firstRequestTime > this.windowMs) {
        this.ipRecords.delete(ip);
      }
    }
  }

  public getMiddleware(customErrorMessage?: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Resolve real client IP (handles reverse proxies & Cloud Run headers)
      const clientIp = 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown_ip';

      const now = Date.now();
      let record = this.ipRecords.get(clientIp);

      if (!record || now - record.firstRequestTime > this.windowMs) {
        // First request in a new time window
        record = {
          count: 1,
          firstRequestTime: now,
          lastRequestTime: now
        };
        this.ipRecords.set(clientIp, record);
      } else {
        // Increment count within existing window
        record.count++;
        record.lastRequestTime = now;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const resetTimeSec = Math.ceil((record.firstRequestTime + this.windowMs - now) / 1000);

      // Set standard RFC rate-limiting headers
      res.setHeader('RateLimit-Limit', this.maxRequests);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetTimeSec);

      if (record.count > this.maxRequests) {
        res.setHeader('Retry-After', resetTimeSec);
        res.status(429).json({
          error: customErrorMessage || `Too many requests for ${this.tierName}. Rate limit exceeded.`,
          retryAfterSeconds: resetTimeSec,
          tier: this.tierName,
          status: 429
        });
        return;
      }

      next();
    };
  }

  public getStats() {
    return {
      activeIpsTracked: this.ipRecords.size,
      windowDurationSeconds: this.windowMs / 1000,
      maxAllowedPerWindow: this.maxRequests
    };
  }
}

// =============================================================================
// TIER 1: Global API Rate Limiter (120 requests / 1 minute per IP)
// Blocks rapid scraping, brute-force requests, and automated network floods
// =============================================================================
export const globalApiLimiter = new SlidingWindowRateLimiter(
  120,
  60 * 1000,
  "Global API"
).getMiddleware("Global request rate limit exceeded. Please slow down your requests.");

// =============================================================================
// TIER 2: AI & LLM Protection Limiter (15 AI requests / 10 minutes per IP)
// Protects expensive Vertex AI / Gemini tokens and prevents unauthorized cloud billing
// =============================================================================
export const aiEndpointLimiter = new SlidingWindowRateLimiter(
  15,
  10 * 60 * 1000,
  "Vertex AI Engine"
).getMiddleware("AI compute limit reached (15 requests per 10 minutes). Please wait before generating more AI solutions.");

// =============================================================================
// TIER 3: Payload Size & Prompt Length Security Guard
// Rejects oversized payloads that attempt prompt-injection or token exhaustion
// =============================================================================
export function payloadSecurityGuard(req: Request, res: Response, next: NextFunction): void {
  // Max string length for text prompts: 10,000 characters
  if (req.body && typeof req.body === 'object') {
    const checkStringLength = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].length > 12000) {
          return false;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (!checkStringLength(obj[key])) return false;
        }
      }
      return true;
    };

    if (!checkStringLength(req.body)) {
      res.status(400).json({
        error: "Payload rejected: prompt text exceeds maximum allowed length (12,000 characters).",
        status: 400
      });
      return;
    }
  }

  next();
}
