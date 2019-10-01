// https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow
// Step 2: Have your application request refresh and access tokens; Spotify returns access and refresh tokens

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');

const SECRETS_PATH = './secrets.yml';

const ENDPOINT = 'https://accounts.spotify.com/api/token';

const REDIRECT_URI = 'http://localhost'; // Needs to match the first one

const getSecrets = () => {
  const doc = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, SECRETS_PATH), 'utf8'));
  return {
    clientId: doc['spotify-client-id'],
    clientSecret: doc['spotify-client-secret'],
    authCode: doc['spotify-auth-code'],
  };
};

const requestTokens = async () => {
  const { clientId, clientSecret, authCode } = getSecrets();
  const params = new URLSearchParams({
    'grant_type': 'authorization_code',
    'code': authCode,
    'redirect_uri': REDIRECT_URI,
    'client_id': clientId,
    'client_secret': clientSecret,
  });
  try {
    const { data } = await axios.post(ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('accessToken:', data['access_token']);
    console.log('refreshToken:', data['refresh_token']);
  } catch (e) {
    console.log(e);
  }
};

requestTokens();