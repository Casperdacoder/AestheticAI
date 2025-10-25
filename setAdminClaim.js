const admin = require('firebase-admin');

// Use the new key path
const serviceAccount = require('./src/server/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'admin@gmail.com'; // Or the new email you want as admin

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for ${email} (UID: ${user.uid})`);
    console.log('⚠️ Sign out and log back in to refresh token.');
  } catch (err) {
    console.error('❌ Error setting admin claim:', err);
  }
}

setAdminClaim(ADMIN_EMAIL);
