
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// This function recursively converts plain objects back to Firestore Timestamps.
// Firestore automatically converts Date objects, but data from JSON (or Firestore backup) might be in a different format.
function convertTimestamps(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }

  // Check for Firestore's own timestamp-like objects from the backup
  if (data.hasOwnProperty('_seconds') && data.hasOwnProperty('_nanoseconds')) {
    return new Timestamp(data._seconds, data._nanoseconds);
  }

  const newData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      newData[key] = convertTimestamps(data[key]); // Recurse through the object
    }
  }
  return newData;
}

async function restoreDatabase() {
  try {
    const backupCollectionRef = db.collection('backup');
    console.log('Starting database restore...');

    const snapshot = await backupCollectionRef.get();

    if (snapshot.empty) {
      console.log('No documents found in the backup collection. Nothing to restore.');
      return;
    }

    let restoreCount = 0;
    for (const backupDoc of snapshot.docs) {
      const backupData = backupDoc.data();
      const originalPath = backupData.originalPath;
      let originalData = backupData.data;

      if (!originalPath) {
        console.warn(`  - Skipping document ${backupDoc.id} as it's missing 'originalPath'.`);
        continue;
      }

      // Convert any timestamp objects back to Firestore Timestamps before writing
      originalData = convertTimestamps(originalData);

      // Use the stored path to get a reference to the original document location
      const restoreDocRef = db.doc(originalPath);

      // Using .set() will either create the document or overwrite it if it already exists.
      await restoreDocRef.set(originalData);
      console.log(`  - Restored: ${originalPath}`);
      restoreCount++;
    }

    console.log(`\n✅ Database restore complete! ${restoreCount} documents were successfully restored.`);

  } catch (error) {
    console.error(`❌ RESTORE FAILED: ${error.message}`);
    console.error(error.stack);
  }
}

restoreDatabase();
