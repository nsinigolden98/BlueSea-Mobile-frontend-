import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateGmail, validateUsername, normalizePhoneNumber } from '../utils/platform';

export interface NativeSignUpState {
  email: string;
  firstName: string;
  surname: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  username: string;
  otp: string;
  pin: string;
}

const initialSignUpState: NativeSignUpState = {
  email: '',
  firstName: '',
  surname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
  username: '',
  otp: '',
  pin: '',
};

export const useNativeAuth = () => {
  const [formData, setFormData] = useState<NativeSignUpState>(initialSignUpState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateField = useCallback((field: keyof NativeSignUpState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialSignUpState);
    setError(null);
  }, []);

  const validateEmailStep = (): boolean => {
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email address is required.');
      return false;
    }
    if (!validateGmail(cleanEmail)) {
      setError('Only standard @gmail.com email addresses are allowed.');
      return false;
    }
    return true;
  };

  const validateBasicDetailsStep = (): boolean => {
    if (!formData.firstName.trim() || !formData.surname.trim()) {
      setError('First name and surname are required.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    const cleanPhone = normalizePhoneNumber(formData.phone);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password is required and must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const validateUsernameStep = (): boolean => {
    if (!formData.username.trim()) {
      return true; // Optional step
    }

    const trimmed = formData.username.trim().toLowerCase();
    const formattedUsername = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;

    if (!validateUsername(formattedUsername)) {
      setError('Username must start with @, be 4-30 characters long, and contain only lowercase letters, numbers, underscores, or hyphens.');
      return false;
    }
    return true;
  };

  return {
    formData,
    loading,
    error,
    setLoading,
    setError,
    updateField,
    resetForm,
    validateEmailStep,
    validateBasicDetailsStep,
    validateUsernameStep,
    navigate,
  };
};