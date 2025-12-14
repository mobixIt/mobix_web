'use client';

import React, { useState } from 'react';

import LoginFormView from './LoginFormView';

import { loginUser } from '@/services/userAuthService';
import { writeSessionIdleCookie } from '@/utils/sessionIdleCookie';
import { getLoginErrorMessage } from '@/errors/getLoginErrorMessage';
import { buildTenantUrl } from '@/utils/tenantUrl';

import { normalizeApiError } from '@/errors/normalizeApiError';
import {
  normalizeSessionMeta,
} from '@/session/sessionMeta';

export default function LoginForm() {
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
        data: rawMeta,
      } = await loginUser(email, password);

      const normalized = normalizeSessionMeta({
        last_activity_at: Date.now(),
        idle_timeout_minutes: rawMeta.idle_timeout_minutes,
        expires_at: rawMeta.expires_at,
      });

      writeSessionIdleCookie({
        last_activity_at: normalized.last_activity_at,
        idle_timeout_minutes: normalized.idle_timeout_minutes,
        expires_at: normalized.expiresAtMs,
      });

      const tenantSlug = rawMeta.default_membership.tenant.slug;
      const url = buildTenantUrl(tenantSlug);
      const dashboardUrl = `${url}/dashboard`;

      window.location.href = dashboardUrl;
    } catch (errorCaught) {
      const normalized = normalizeApiError(errorCaught);
      const code = normalized.code;
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
