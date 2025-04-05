import { google } from "googleapis";

import { env } from "~/env";

const auth = new google.auth.OAuth2({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
  apiKey: env.GOOGLE_API_KEY,
});

google.options({
  auth,
});

export { auth };
