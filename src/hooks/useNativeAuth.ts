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

  const validateEmailStep = (): boolean => {
    if (!formData.email) {
      setError('Email address is required.');
      return false;
    }
    if (!validateGmail(formData.email)) {
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
      setError('Please enter a valid 10-digit Nigerian phone number.');
      return false;
    }
    return true;
  };

  const validateUsernameStep = (): boolean => {
    const formattedUsername = formData.username.startsWith('@')
      ? formData.username
      : `@${formData.username}`;

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
    validateEmailStep,
    validateBasicDetailsStep,
    validateUsernameStep,
    navigate,
  };
};