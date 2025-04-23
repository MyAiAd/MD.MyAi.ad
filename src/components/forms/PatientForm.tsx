// Client-side form validation example - simplified version without external dependencies
// src/components/forms/PatientForm.tsx

import { useState, FormEvent, ChangeEvent } from 'react';

// Define interface for form data
interface PatientInput {
  email: string;
  first_name: string;
  last_name: string;
  [key: string]: string; // Allow additional fields
}

type PatientFormProps = {
  onSubmit: (data: PatientInput) => void;
  initialData?: Partial<PatientInput>;
};

export function PatientForm({ onSubmit, initialData = {} }: PatientFormProps) {
  // Initialize form state with initial data
  const [formData, setFormData] = useState<PatientInput>({
    email: initialData.email || '',
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
  });

  // Error state for each field
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate first name
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    
    // Validate last name
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div>
        <label>First Name</label>
        <input 
          type="text" 
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
        {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
      </div>
      
      <div>
        <label>Last Name</label>
        <input 
          type="text" 
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
        {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
