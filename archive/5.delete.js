
const db = require('./index');

/**
 * Deletes a single document from a Firestore collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} docId - The ID of the document to delete.
 */
async function deleteDocument(collectionPath, docId) {
  try {
    console.log(`Attempting to delete document: ${collectionPath}/${docId}...`);
    await db.collection(collectionPath).doc(docId).delete();
    console.log(`✅ Document successfully deleted!`);
  } catch (error) {
    console.error(`❌ Error deleting document: ${error.message}`);
  }
}

/**
 * Deletes an entire collection by deleting all of its documents.
 * @param {string} collectionPath - The path to the collection to delete.
 */
async function deleteCollection(collectionPath) {
  try {
    console.log(`Attempting to delete all documents from collection: ${collectionPath}...`);
    const snapshot = await db.collection(collectionPath).get();

    if (snapshot.empty) {
      console.log(`Collection '${collectionPath}' is already empty.`);
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ All documents in collection '${collectionPath}' have been deleted.`);
  } catch (error) {
    console.error(`❌ Error deleting collection: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// HOW TO USE THIS SCRIPT
// -----------------------------------------------------------------------------
// To run a deletion, uncomment one of the function calls below and then
// run 'node 5.delete.js' in your terminal.
// -----------------------------------------------------------------------------

async function main() {

  // --- Example 1: Delete a single document ---
  // This will delete the document 'user_001' from the 'users' collection.
  //await deleteDocument('users', 'user_001');

  // --- Example 2: Delete an entire collection ---
  // This will delete all documents from the 'vehicles' collection.
  await deleteCollection('vehicles');

  console.log('\nScript finished. Please uncomment a function call in main() to perform a deletion.');
}

main();
