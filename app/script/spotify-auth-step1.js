// https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow
// Step 1: Have your application request authorization; the user logs in and authorizes access

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SECRETS_PATH = './secrets.yml';

const ENDPOINT = 'https://accounts.spotify.com/authorize';

const REDIRECT_URI = 'http://localhost'; // Whatever
const SCOPES = ['playlist-read-private', 'playlist-read-collaborative'];

const getSecrets = () => {
  const doc = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, SECRETS_PATH), 'utf8'));
  return {
    clientId: doc['spotify-client-id'],
  };
};

const getAuthUrl = () => {
  const { clientId } = getSecrets();
  const params = new URLSearchParams({
    'client_id': clientId,
    'response_type': 'code',
    'redirect_uri': REDIRECT_URI,
    'scope': SCOPES.join(' '),
  });
  const url = new URL(`${ENDPOINT}?${params.toString()}`);
  console.log('Access here:', url.href);
};

getAuthUrl();