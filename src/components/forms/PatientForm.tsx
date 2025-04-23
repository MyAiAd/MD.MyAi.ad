// Client-side form validation example
// src/components/forms/PatientForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientInput } from '@/lib/validations/patient';

type PatientFormProps = {
  onSubmit: (data: PatientInput) => void;
  initialData?: Partial<PatientInput>;
};

export function PatientForm({ onSubmit, initialData = {} }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      
      <div>
        <label>First Name</label>
        <input type="text" {...register('first_name')} />
        {errors.first_name && <p>{errors.first_name.message}</p>}
      </div>
      
      <div>
        <label>Last Name</label>
        <input type="text" {...register('last_name')} />
        {errors.last_name && <p>{errors.last_name.message}</p>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}

