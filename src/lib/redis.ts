// src/lib/redis.ts
import { createClient } from 'redis';
import { RedisClientType } from '@redis/client';

// Redis client singleton
let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    // Create a new Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff with a maximum of 10 seconds
          const delay = Math.min(retries * 50, 10000);
          return delay;
        },
      },
    });

    // Listen for connection events
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });

    // Connect to Redis
    await redisClient.connect();
  }

  return redisClient;
}

// Close Redis connection (useful for serverless environments)
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Redis key patterns for different data types
export const redisKeys = {
  // Patient caching
  patient: (id: string) => `patient:${id}`,
  patientsByProvider: (providerId: string) => `provider:${providerId}:patients`,
  
  // Newsletter queues
  newsletterQueue: 'queue:newsletters',
  newsletterProcessing: 'processing:newsletters',
  newsletterFailed: 'failed:newsletters',
  
  // Rate limiting
  rateLimitKey: (key: string) => `ratelimit:${key}`,
  
  // Campaign analytics
  campaignStats: (campaignId: string) => `campaign:${campaignId}:stats`,
  campaignOpenRate: (campaignId: string) => `campaign:${campaignId}:openrate`,
  campaignClickRate: (campaignId: string) => `campaign:${campaignId}:clickrate`,
  
  // Session management
  sessionData: (sessionId: string) => `session:${sessionId}`,
};

// Patient caching functions
export async function cachePatient(patient: any): Promise<void> {
  const redis = await getRedisClient();
  const key = redisKeys.patient(patient.id);
  
  // Cache patient data with 1 hour expiration (3600 seconds)
  await redis.set(key, JSON.stringify(patient), { EX: 3600 });
  
  // Add to provider's patient list
  const providerKey = redisKeys.patientsByProvider(patient.provider_id);
  await redis.sAdd(providerKey, patient.id);
}

export async function getCachedPatient(patientId: string): Promise<any | null> {
  const redis = await getRedisClient();
  const key = redisKeys.patient(patientId);
  
  const patientData = await redis.get(key);
  if (patientData) {
    return JSON.parse(patientData);
  }
  
  return null;
}

export async function invalidatePatientCache(patientId: string, providerId: string): Promise<void> {
  const redis = await getRedisClient();
  
  // Remove patient data
  await redis.del(redisKeys.patient(patientId));
  
  // Remove from provider's patient list
  if (providerId) {
    await redis.sRem(redisKeys.patientsByProvider(providerId), patientId);
  }
}

// Newsletter queue functions
export async function queueNewsletter(campaignData: any): Promise<string> {
  const redis = await getRedisClient();
  
  // Generate a unique ID for this newsletter job
  const jobId = `job:${Date.now()}:${Math.random().toString(36).substring(2, 15)}`;
  
  // Add to the newsletter queue
  await redis.lPush(redisKeys.newsletterQueue, JSON.stringify({
    id: jobId,
    campaignData,
    createdAt: new Date().toISOString(),
  }));
  
  return jobId;
}

export async function processNextNewsletterJob(): Promise<any | null> {
  const redis = await getRedisClient();
  
  // Move a job from the queue to processing
  const job = await redis.rPopLPush(redisKeys.newsletterQueue, redisKeys.newsletterProcessing);
  
  if (job) {
    return JSON.parse(job);
  }
  
  return null;
}

export async function completeNewsletterJob(jobId: string): Promise<void> {
  const redis = await getRedisClient();
  
  // Find and remove the job from the processing queue
  const processingJobs = await redis.lRange(redisKeys.newsletterProcessing, 0, -1);
  
  for (const jobData of processingJobs) {
    const job = JSON.parse(jobData);
    
    if (job.id === jobId) {
      await redis.lRem(redisKeys.newsletterProcessing, 1, jobData);
      break;
    }
  }
}

export async function failNewsletterJob(jobId: string, error: string): Promise<void> {
  const redis = await getRedisClient();
  
  // Find the job in the processing queue
  const processingJobs = await redis.lRange(redisKeys.newsletterProcessing, 0, -1);
  
  for (const jobData of processingJobs) {
    const job = JSON.parse(jobData);
    
    if (job.id === jobId) {
      // Remove from processing
      await redis.lRem(redisKeys.newsletterProcessing, 1, jobData);
      
      // Add to failed queue with error information
      const failedJob = {
        ...job,
        error,
        failedAt: new Date().toISOString(),
      };
      
      await redis.lPush(redisKeys.newsletterFailed, JSON.stringify(failedJob));
      break;
    }
  }
}

// Campaign analytics functions
export async function incrementCampaignStat(campaignId: string, statType: string, increment: number = 1): Promise<void> {
  const redis = await getRedisClient();
  const key = redisKeys.campaignStats(campaignId);
  
  await redis.hIncrBy(key, statType, increment);
  
  // Automatically expire after 30 days (2592000 seconds)
  await redis.expire(key, 2592000);
}

export async function getCampaignStats(campaignId: string): Promise<Record<string, number>> {
  const redis = await getRedisClient();
  const key = redisKeys.campaignStats(campaignId);
  
  const stats = await redis.hGetAll(key);
  
  // Convert string values to numbers
  return Object.fromEntries(
    Object.entries(stats).map(([k, v]) => [k, parseInt(v, 10)])
  );
}

// Rate limiting functions
export async function checkRateLimit(key: string, limit: number, windowSecs: number): Promise<boolean> {
  const redis = await getRedisClient();
  const rateLimitKey = redisKeys.rateLimitKey(key);
  
  // Increment counter
  const count = await redis.incr(rateLimitKey);
  
  // Set expiration if this is the first request in the window
  if (count === 1) {
    await redis.expire(rateLimitKey, windowSecs);
  }
  
  // Check if the rate limit has been exceeded
  return count <= limit;
}

export async function getRateLimitRemaining(key: string, limit: number): Promise<number> {
  const redis = await getRedisClient();
  const rateLimitKey = redisKeys.rateLimitKey(key);
  
  // Get current count
  const countStr = await redis.get(rateLimitKey);
  const count = countStr ? parseInt(countStr, 10) : 0;
  
  // Calculate remaining
  return Math.max(0, limit - count);
}

// Session management
export async function storeSessionData(sessionId: string, data: any, expirationSecs: number = 3600): Promise<void> {
  const redis = await getRedisClient();
  const key = redisKeys.sessionData(sessionId);
  
  await redis.set(key, JSON.stringify(data), { EX: expirationSecs });
}

export async function getSessionData(sessionId: string): Promise<any | null> {
  const redis = await getRedisClient();
  const key = redisKeys.sessionData(sessionId);
  
  const data = await redis.get(key);
  
  if (data) {
    return JSON.parse(data);
  }
  
  return null;
}

export async function removeSessionData(sessionId: string): Promise<void> {
  const redis = await getRedisClient();
  const key = redisKeys.sessionData(sessionId);
  
  await redis.del(key);
}
