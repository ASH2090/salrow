
const db = require('./index');
const fs = require('fs');
const { Timestamp } = require('firebase-admin/firestore');
const masterSchema = require('./6.master-schema.js');

// Function to recursively convert data structures
function convertData(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertData(item));
  }

  const newData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let value = data[key];

      // Convert date strings to Timestamps
      if (typeof value === 'string' && (key.endsWith('_at') || key.endsWith('_time') || key === 'ts' || key === 'last_seen')) {
        const date = new Date(value);
        if (!isNaN(date)) {
          newData[key] = Timestamp.fromDate(date);
        } else {
          newData[key] = value; // Keep as string if parsing fails
        }
      } else {
        newData[key] = convertData(value); // Recursively process other values
      }
    }
  }
  return newData;
}

// Function to validate data against the master schema
function validateData(collectionName, data) {
    const schema = masterSchema[collectionName];
    if (!schema) {
        console.warn(`  - ⚠️ No schema found for collection ${collectionName}. Skipping validation.`);
        return true;
    }

    for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
            const expectedType = schema[key];
            const actualValue = data[key];
            const actualType = typeof actualValue;

            if (actualValue === undefined) {
                console.error(`  - ❌ Validation failed for ${collectionName}: Missing required field '${key}'.`);
                return false;
            }

            if (expectedType === 'string' && actualType !== 'string') {
                if ((key.endsWith('_at') || key.endsWith('_time') || key === 'ts' || key === 'last_seen') && actualValue instanceof Timestamp) {
                    continue;
                }
                console.error(`  - ❌ Validation failed for ${collectionName}: Field '${key}' should be a ${expectedType}, but got ${actualType}.`);
                return false;
            }

            if (expectedType === 'number' && actualType !== 'number') {
                console.error(`  - ❌ Validation failed for ${collectionName}: Field '${key}' should be a ${expectedType}, but got ${actualType}.`);
                return false;
            }

            if (expectedType === 'object' && actualType !== 'object') {
                console.error(`  - ❌ Validation failed for ${collectionName}: Field '${key}' should be a ${expectedType}, but got ${actualType}.`);
                return false;
            }
        }
    }
    return true;
}


async function uploadData() {
  try {
    const filePath = './2.data.json';
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    const collections = Object.keys(data);

    for (const collection of collections) {
      const documents = data[collection];
      const docIds = Object.keys(documents);

      console.log(`\nUploading to ${collection}...`);

      for (const docId of docIds) {
        const docData = documents[docId];
        const convertedData = convertData(docData);

        if (validateData(collection, convertedData)) {
            await db.collection(collection).doc(docId).set(convertedData);
            console.log(`  - Uploaded ${docId}`);
        } else {
            console.log(`  - Skipping upload for ${docId} due to validation errors.`);
        }
      }
    }

    console.log('\n✅ Data upload complete!');

  } catch (error) {
    console.error('Error uploading data:', error);
  }
}

uploadData();
