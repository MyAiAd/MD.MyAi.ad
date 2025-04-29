// src/pages/api/campaigns/[id]/job-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getRedisClient, redisKeys } from '@/lib/redis';

interface Job {
  id: string;
  error?: any;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const providerId = session.user.id;
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: { message: 'Job ID is required' } });
  }

  try {
    // Get Redis client
    const redis = await getRedisClient();
    
    // Check if the job exists in any of the queues
    const processingJobs = await redis.lRange(redisKeys.newsletterProcessing, 0, -1);
    const queuedJobs = await redis.lRange(redisKeys.newsletterQueue, 0, -1);
    const failedJobs = await redis.lRange(redisKeys.newsletterFailed, 0, -1);
    
    // Find the job in any of the queues
    let job: Job | null = null;
    let status = 'unknown';
    let progress = 0;
    let error = null;
    
    // Check processing queue
    for (const jobData of processingJobs) {
      const parsedJob = JSON.parse(jobData) as Job;
      if (parsedJob.id === jobId) {
        job = parsedJob;
        status = 'processing';
        // For processing jobs, check if we have a progress key
        const progressKey = `job:${jobId}:progress`;
        const progressData = await redis.get(progressKey);
        if (progressData) {
          progress = parseInt(progressData, 10);
        }
        break;
      }
    }
    
    // Check queued jobs if not found
    if (!job) {
      for (const jobData of queuedJobs) {
        const parsedJob = JSON.parse(jobData) as Job;
        if (parsedJob.id === jobId) {
          job = parsedJob;
          status = 'queued';
          break;
        }
      }
    }
    
    // Check failed jobs if still not found
    if (!job) {
      for (const jobData of failedJobs) {
        const parsedJob = JSON.parse(jobData) as Job;
        if (parsedJob.id === jobId) {
          job = parsedJob;
          status = 'failed';
          error = parsedJob.error;
          break;
        }
      }
    }
    
    // Check completed jobs
    if (!job) {
      const completedKey = `job:${jobId}:completed`;
      const completedData = await redis.get(completedKey);
      if (completedData) {
        job = JSON.parse(completedData) as Job;
        status = 'completed';
        progress = 100;
      }
    }
    
    if (!job) {
      return res.status(404).json({ error: { message: 'Job not found' } });
    }
    
    return res.status(200).json({
      jobId,
      status,
      progress,
      error,
      data: job,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to fetch job status' } });
  }
}
