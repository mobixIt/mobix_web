import React from 'react';
import { beforeMount } from '@playwright/experimental-ct-react/hooks';

beforeMount(async ({ App }) => <App />);
