// Inicializa firebase admin

const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Solo inicializa una vez aunque el archivo se importe varias veces
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;