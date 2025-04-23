// src/tests/unit/lib/supabase.test.ts
import {
  signInProvider,
  createProviderAccount,
  addPatient,
  getPatientsByProvider,
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

describe('Supabase Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInProvider', () => {
    it('should call Supabase auth.signInWithPassword with correct params', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      
      // @ts-ignore - Mocking
      supabase.auth.signInWithPassword = mockSignIn;

      await signInProvider('test@example.com', 'password');
      
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should return error when auth fails', async () => {
      const mockError = { message: 'Invalid credentials' };
      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      // @ts-ignore - Mocking
      supabase.auth.signInWithPassword = mockSignIn;

      const result = await signInProvider('test@example.com', 'password');
      
      expect(result.error).toBe(mockError);
      expect(result.data).toBeNull();
    });
  });

  describe('createProviderAccount', () => {
    it('should create auth user and provider profile', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockProvider = { id: '123', name: 'Test Clinic' };
      
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProvider,
            error: null,
          }),
        }),
      });
      
      // @ts-ignore - Mocking
      supabase.auth.signUp = mockSignUp;
      // @ts-ignore - Mocking
      supabase.from = jest.fn().mockReturnValue({ insert: mockInsert });

      const providerData = { name: 'Test Clinic', email: 'test@example.com' };
      const result = await createProviderAccount('test@example.com', 'password', providerData);
      
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      
      expect(mockInsert).toHaveBeenCalled();
      expect(result.data).toBe(mockProvider);
      expect(result.error).toBeNull();
    });

    it('should return error when auth creation fails', async () => {
      const mockError = { message: 'Email already exists' };
      const mockSignUp = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      // @ts-ignore - Mocking
      supabase.auth.signUp = mockSignUp;

      const providerData = { name: 'Test Clinic', email: 'test@example.com' };
      const result = await createProviderAccount('test@example.com', 'password', providerData);
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe('addPatient', () => {
    it('should insert a patient and return the result', async () => {
      const mockPatient = { id: '123', first_name: 'John', last_name: 'Doe' };
      
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        }),
      });
      
      // @ts-ignore - Mocking
      supabase.from = jest.fn().mockReturnValue({ insert: mockInsert });

      const patientData = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      
      const result = await addPatient(patientData);
      
      expect(supabase.from).toHaveBeenCalledWith('patients');
      expect(mockInsert).toHaveBeenCalledWith(patientData);
      expect(result.data).toBe(mockPatient);
      expect(result.error).toBeNull();
    });
  });

  describe('getPatientsByProvider', () => {
    it('should fetch patients for a provider', async () => {
      const mockPatients = [
        { id: '123', first_name: 'John', last_name: 'Doe' },
        { id: '456', first_name: 'Jane', last_name: 'Smith' },
      ];
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockPatients,
          error: null,
        }),
      });
      
      // @ts-ignore - Mocking
      supabase.from = jest.fn().mockReturnValue({ select: mockSelect });

      const providerId = '123e4567-e89b-12d3-a456-426614174000';
      const result = await getPatientsByProvider(providerId);
      
      expect(supabase.from).toHaveBeenCalledWith('patients');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result.data).toBe(mockPatients);
      expect(result.error).toBeNull();
    });
  });
});

