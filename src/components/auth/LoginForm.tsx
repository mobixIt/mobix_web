'use client';

import React, { useState } from 'react';
import type { AxiosError } from 'axios';

import LoginFormView from './LoginFormView';

import { loginUser } from '@/services/userAuthService';
import { writeSessionIdleCookie } from '@/utils/sessionIdleCookie';
import { getLoginErrorMessage } from '@/errors/getLoginErrorMessage';
import { buildTenantUrl } from '@/utils/tenantUrl';
import type { ApiErrorResponse } from '@/types/api';

import { useAppDispatch } from '@/store/hooks';
import { fetchMe } from '@/store/slices/authSlice';

export default function LoginForm() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const {
        data: { expires_at, idle_timeout_minutes },
      } = await loginUser(email, password);

      const idleMinutes =
        typeof idle_timeout_minutes === 'number' && idle_timeout_minutes > 0
          ? idle_timeout_minutes
          : 30;

      const now = Date.now();

      writeSessionIdleCookie({
        last_activity_at: now,
        idle_timeout_minutes: idleMinutes,
        expires_at,
      });

      const { memberships } = await dispatch(fetchMe()).unwrap();
      const tenantSlug = memberships[0].tenant.slug;
      const url = buildTenantUrl(tenantSlug);
      const dashboardUrl = `${url}/dashboard`;

      window.location.href = dashboardUrl;
    } catch (errorCaught) {
      const err = errorCaught as AxiosError<ApiErrorResponse>;
      const code = err?.response?.data?.errors?.[0]?.code;
      setError(getLoginErrorMessage(code));
      setIsSubmitting(false);
    }
  };

  return (
    <LoginFormView
      email={email}
      password={password}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onEmailChange={(value) => setEmail(value)}
      onPasswordChange={(value) => setPassword(value)}
    />
  );
}
