
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Helper function to backup a single document
// It uses the document's full path as the ID in the backup collection for uniqueness
async function backupDoc(doc, backupCollectionRef) {
    const docData = doc.data();
    // Replace '/' with a character that's valid in doc IDs, like '|', to create a unique ID
    const backupDocId = doc.ref.path.replace(/\//g, '|');
    const backupDocRef = backupCollectionRef.doc(backupDocId);
    
    await backupDocRef.set({
        originalPath: doc.ref.path, // Store the original path for easy restoration
        data: docData,
        backedUpAt: new Date()
    });
    console.log(`  - Backed up: ${doc.ref.path}`);
}

async function backupDatabase() {
  try {
    const backupCollectionRef = db.collection('backup');
    // Define all top-level collections you want to back up
    const topLevelCollections = ['users', 'devices', 'vehicles', 'routes', 'geofences', 'alerts'];

    console.log('Starting recursive database backup...');

    for (const collectionId of topLevelCollections) {
      console.log(`\nProcessing collection: ${collectionId}`);
      const collectionRef = db.collection(collectionId);
      const snapshot = await collectionRef.get();

      for (const doc of snapshot.docs) {
        await backupDoc(doc, backupCollectionRef);

        // --- SUBCOLLECTION LOGIC ---
        // If a document in a collection is known to have subcollections, process them here.
        // This is crucial for backing up nested data like 'positions'.
        if (collectionId === 'routes') {
          const subcollectionRef = doc.ref.collection('positions');
          const subcollectionSnapshot = await subcollectionRef.get();
          
          if (!subcollectionSnapshot.empty) {
            console.log(`    - Found subcollection 'positions' in ${doc.id}`);
            for (const subDoc of subcollectionSnapshot.docs) {
              // Recurse or directly call the backup function for the sub-document
              await backupDoc(subDoc, backupCollectionRef);
            }
          }
        }
        // Add more 'if' blocks here for other collections with subcollections
      }
    }
    console.log('\n✅ Database backup complete!');
  } catch (error) {
    console.error(`❌ BACKUP FAILED: ${error.message}`);
    console.error(error.stack);
  }
}

backupDatabase();
