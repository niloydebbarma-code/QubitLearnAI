/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Section 5.4: Efficient System Design - Async Execution, Resilience & Cost Control
 */

import { AsyncJobStatus, SystemStatus } from "../src/types";

// ==========================================
// 1. CIRCUIT BREAKER PATTERN
// ==========================================
class CircuitBreaker {
  public state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 3;
  private readonly cooldownPeriodMs = 30000; // 30 seconds

  public recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  public recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  public canExecute(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    // HALF_OPEN allows single probe
    return true;
  }
}

export const circuitBreakers = {
  geminiService: new CircuitBreaker(),
  simulatorEngine: new CircuitBreaker(),
  leanCompiler: new CircuitBreaker(),
};

// ==========================================
// 2. SEMANTIC CACHING
// ==========================================
class SemanticCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  public hitCount = 0;
  public missCount = 0;
  public savedTokens = 0;

  private hashKey(namespace: string, payload: any): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    // Simple deterministic string hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `${namespace}:${hash}`;
  }

  public get<T>(namespace: string, payload: any): T | null {
    const key = this.hashKey(namespace, payload);
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < 1000 * 60 * 60) {
      this.hitCount++;
      this.savedTokens += 450; // estimated saved tokens per cached prompt
      return entry.data as T;
    }
    this.missCount++;
    return null;
  }

  public set(namespace: string, payload: any, data: any) {
    const key = this.hashKey(namespace, payload);
    if (this.cache.size > 200) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? Math.round((this.hitCount / total) * 100) : 100;
    return {
      entriesCount: this.cache.size,
      hitRatePercent: hitRate,
      savedTokenCount: this.savedTokens,
    };
  }
}

export const semanticCache = new SemanticCache();

// ==========================================
// 3. TOKEN GUARD / RATE LIMITER
// ==========================================
class TokenGuard {
  private tokens = 120;
  private readonly maxTokens = 120;
  private lastRefill = Date.now();

  public checkAndConsume(cost: number = 1): boolean {
    this.refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds >= 60) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
  }

  public getStatus() {
    this.refill();
    const resetInSeconds = Math.max(0, 60 - Math.floor((Date.now() - this.lastRefill) / 1000));
    return {
      tokensRemaining: this.tokens,
      maxTokens: this.maxTokens,
      resetInSeconds,
    };
  }
}

export const tokenGuard = new TokenGuard();

// ==========================================
// 4. ASYNC JOB QUEUE (Section 5.4.A)
// ==========================================
const jobStore = new Map<string, AsyncJobStatus>();

export function submitAsyncJob(serviceName: string, executeFn: () => Promise<any>): AsyncJobStatus {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const job: AsyncJobStatus = {
    jobId,
    status: 'PENDING',
    progressPercent: 10,
    serviceName,
    createdAt: new Date().toISOString(),
  };

  jobStore.set(jobId, job);

  // Background execution with progressive status
  (async () => {
    try {
      job.status = 'RUNNING';
      job.progressPercent = 35;
      
      // Artificial short steps to simulate async workers if fast
      await new Promise((r) => setTimeout(r, 400));
      job.progressPercent = 75;

      const result = await executeFn();
      job.progressPercent = 100;
      job.status = 'COMPLETED';
      job.result = result;
      job.completedAt = new Date().toISOString();
    } catch (err: any) {
      job.status = 'FAILED';
      job.error = err.message || 'Job execution failed';
      job.completedAt = new Date().toISOString();
    }
  })();

  return job;
}

export function getAsyncJobStatus(jobId: string): AsyncJobStatus | null {
  return jobStore.get(jobId) || null;
}

export function getSystemStatus(): SystemStatus {
  return {
    circuitBreakers: {
      geminiService: circuitBreakers.geminiService.state,
      simulatorEngine: circuitBreakers.simulatorEngine.state,
      leanCompiler: circuitBreakers.leanCompiler.state,
    },
    semanticCache: semanticCache.getStats(),
    rateLimiter: tokenGuard.getStatus(),
    activeJobsCount: Array.from(jobStore.values()).filter((j) => j.status === 'RUNNING' || j.status === 'PENDING').length,
  };
}
