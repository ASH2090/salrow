
const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionRef = db.collection('accidents');

const filePath = './US_Accidents_March23.csv';
let count = 0;
let processedCount = 0;

console.log('Starting to process CSV file for accidents from 2017...');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', async (row) => {
    processedCount++;
    if (processedCount % 10000 === 0) {
        console.log(`Processed ${processedCount} rows...`);
    }

    try {
      const startTime = new Date(row.Start_Time);

      // Check if the year is 2017
      if (startTime.getFullYear() === 2017) {
        const endTime = new Date(row.End_Time); // Parse End_Time

        // Create the data object with all specified columns
        const accidentData = {
          ID: row.ID,
          Source: row.Source,
          Severity: parseInt(row.Severity, 10),
          Start_Time: admin.firestore.Timestamp.fromDate(startTime),
          End_Time: admin.firestore.Timestamp.fromDate(endTime),
          Start_Lat: parseFloat(row.Start_Lat),
          Start_Lng: parseFloat(row.Start_Lng),
          End_Lat: parseFloat(row.End_Lat),
          End_Lng: parseFloat(row.End_Lng),
          // Note: The key is changed from 'Distance(mi)' to 'Distance'
          Distance: parseFloat(row['Distance(mi)']),
          City: row.City,
          State: row.State,
          Zipcode: row.Zipcode,
          Timezone: row.Timezone,
          Weather_Condition: row.Weather_Condition,
          // Convert boolean-like strings to actual booleans
          Bump: row.Bump === 'True',
          Crossing: row.Crossing === 'True',
          Give_Way: row.Give_Way === 'True',
          Junction: row.Junction === 'True',
          No_Exit: row.No_Exit === 'True',
          Railway: row.Railway === 'True',
          Roundabout: row.Roundabout === 'True',
          Station: row.Station === 'True',
          Stop: row.Stop === 'True',
          Traffic_Calming: row.Traffic_Calming === 'True',
          Traffic_Signal: row.Traffic_Signal === 'True',
          Turning_Loop: row.Turning_Loop === 'True'
        };

        // Add the document to the 'accidents' collection
        await collectionRef.add(accidentData);
        count++;
        if (count % 100 === 0) {
          console.log(`Uploaded ${count} documents from 2017...`);
        }
      }
    } catch (error) {
      // This will catch errors like invalid dates, but continue processing.
      // console.error('Error processing row:', row.ID, error);
    }
  })
  .on('end', () => {
    console.log(`\nCSV file successfully processed.`);
    console.log(`- Total rows scanned: ${processedCount}`);
    console.log(`- Uploaded a total of ${count} documents from 2017.`);
  });
