// src/propelAuthConfig.js
import { createAuth } from '@propelauth/react';

const auth = createAuth({
  authUrl: 'https://1376144932.propelauthtest.com',
  redirectUri: window.location.origin + '/dashboard',
  logoutRedirectUri: window.location.origin + '/login',
});

export default auth;