const { google } = require('googleapis');


const GOOGLE_CLIENT_ID = 'XXXXXXXXXXXXXXXXXXX';
const GOOGLE_CLIENT_SECRET = 'XXXXXXXXXXXXXXXXXXXXX';
const REDIRECT_URL = 'http://localhost:3000/google-callback'

const OAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URL)

function createUrl(state) {
  return url = OAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile'],
    state: Buffer.from(state).toString('base64')
  });
}

async function getUser(code) {
  try {
    let { tokens } = await OAuth2Client.getToken(code);
    let auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: tokens.access_token });
    var oauth2 = google.oauth2({ auth, version: 'v2' });
    let { data } = await oauth2.userinfo.get();
    return data;
  } catch (error) {
    console.log(error);
  }
}

exports.createUrl = createUrl;
exports.getUser = getUser;