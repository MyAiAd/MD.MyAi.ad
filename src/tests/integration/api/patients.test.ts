// src/tests/integration/api/patients.test.ts
import { createMocks } from 'node-mocks-http';
import patientHandler from '@/pages/api/patients/index';
import patientIdHandler from '@/pages/api/patients/[id]';
import { supabase } from '@/lib/supabase';

// Mock authentication
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerSupabaseClient: jest.fn().mockImplementation(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'provider-123',
            },
          },
        },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
            error: null,
          }),
          range: jest.fn().mockResolvedValue({
            data: [
              { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
              { id: 'patient-456', first_name: 'Jane', last_name: 'Smith' },
            ],
            count: 2,
            error: null,
          }),
        })),
        order: jest.fn(() => ({
          range: jest.fn().mockResolvedValue({
            data: [
              { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
              { id: 'patient-456', first_name: 'Jane', last_name: 'Smith' },
            ],
            count: 2,
            error: null,
          }),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'patient-789', first_name: 'New', last_name: 'Patient' },
            error: null,
          }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'patient-123', first_name: 'Updated', last_name: 'Patient' },
              error: null,
            }),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

describe('Patient API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('should return a list of patients', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await patientHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        data: {
          patients: [
            { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
            { id: 'patient-456', first_name: 'Jane', last_name: 'Smith' },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      });
    });
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'Patient',
        },
      });

      await patientHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        data: {
          patient: { id: 'patient-789', first_name: 'New', last_name: 'Patient' },
        },
      });
    });
  });

  describe('GET /api/patients/[id]', () => {
    it('should return a specific patient', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'patient-123',
        },
      });

      await patientIdHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        data: {
          patient: { id: 'patient-123', first_name: 'John', last_name: 'Doe' },
        },
      });
    });
  });

  describe('PUT /api/patients/[id]', () => {
    it('should update a patient', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          id: 'patient-123',
        },
        body: {
          first_name: 'Updated',
          last_name: 'Patient',
        },
      });

      await patientIdHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        data: {
          patient: { id: 'patient-123', first_name: 'Updated', last_name: 'Patient' },
        },
      });
    });
  });

  describe('DELETE /api/patients/[id]', () => {
    it('should delete a patient', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'patient-123',
        },
      });

      await patientIdHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        data: {
          message: 'Patient deleted successfully',
        },
      });
    });
  });
});

