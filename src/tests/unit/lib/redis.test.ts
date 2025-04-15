// src/tests/unit/lib/redis.test.ts
import {
  cachePatient,
  getCachedPatient,
  invalidatePatientCache,
  queueNewsletter,
  processNextNewsletterJob,
} from '@/lib/redis';
import { getRedisClient, redisKeys } from '@/lib/redis';

describe('Redis Helpers', () => {
  let mockRedisClient;
  
  beforeEach(() => {
    mockRedisClient = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      sAdd: jest.fn().mockResolvedValue(1),
      sRem: jest.fn().mockResolvedValue(1),
      lPush: jest.fn().mockResolvedValue(1),
      rPopLPush: jest.fn().mockResolvedValue(null),
      lRem: jest.fn().mockResolvedValue(1),
      lRange: jest.fn().mockResolvedValue([]),
    };
    
    (getRedisClient as jest.Mock).mockResolvedValue(mockRedisClient);
  });

  describe('cachePatient', () => {
    it('should cache patient data and add to provider set', async () => {
      const patient = {
        id: '123',
        provider_id: '456',
        first_name: 'John',
        last_name: 'Doe',
      };
      
      await cachePatient(patient);
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        redisKeys.patient(patient.id),
        JSON.stringify(patient),
        { EX: 3600 }
      );
      expect(mockRedisClient.sAdd).toHaveBeenCalledWith(
        redisKeys.patientsByProvider(patient.provider_id),
        patient.id
      );
    });
  });

  describe('getCachedPatient', () => {
    it('should return null when patient is not in cache', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      
      const result = await getCachedPatient('123');
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.get).toHaveBeenCalledWith(redisKeys.patient('123'));
      expect(result).toBeNull();
    });

    it('should return patient data when found in cache', async () => {
      const patient = {
        id: '123',
        provider_id: '456',
        first_name: 'John',
        last_name: 'Doe',
      };
      
      mockRedisClient.get.mockResolvedValue(JSON.stringify(patient));
      
      const result = await getCachedPatient('123');
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.get).toHaveBeenCalledWith(redisKeys.patient('123'));
      expect(result).toEqual(patient);
    });
  });

  describe('invalidatePatientCache', () => {
    it('should remove patient from cache and provider set', async () => {
      await invalidatePatientCache('123', '456');
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.del).toHaveBeenCalledWith(redisKeys.patient('123'));
      expect(mockRedisClient.sRem).toHaveBeenCalledWith(
        redisKeys.patientsByProvider('456'),
        '123'
      );
    });
  });

  describe('queueNewsletter', () => {
    it('should add campaign to the newsletter queue', async () => {
      const campaignData = { campaignId: '123', name: 'Test Campaign' };
      
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const result = await queueNewsletter(campaignData);
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.lPush).toHaveBeenCalledWith(
        redisKeys.newsletterQueue,
        expect.any(String)
      );
      
      // Verify the job ID format
      expect(result).toMatch(/^job:\d+:[a-z0-9]+$/);
    });
  });

  describe('processNextNewsletterJob', () => {
    it('should return null when no jobs are in the queue', async () => {
      mockRedisClient.rPopLPush.mockResolvedValue(null);
      
      const result = await processNextNewsletterJob();
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.rPopLPush).toHaveBeenCalledWith(
        redisKeys.newsletterQueue,
        redisKeys.newsletterProcessing
      );
      expect(result).toBeNull();
    });

    it('should return job data when a job is found', async () => {
      const job = {
        id: 'job:123',
        campaignData: { campaignId: '123' },
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      
      mockRedisClient.rPopLPush.mockResolvedValue(JSON.stringify(job));
      
      const result = await processNextNewsletterJob();
      
      expect(getRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.rPopLPush).toHaveBeenCalledWith(
        redisKeys.newsletterQueue,
        redisKeys.newsletterProcessing
      );
      expect(result).toEqual(job);
    });
  });
});

