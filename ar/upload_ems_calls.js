const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const collectionRef = db.collection('ems_calls');

const filePath = './ems_calls_routes_500.csv';
let count = 0;

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const doc_id = row.CallNumber;
    const data = {
        'CallNumber': row.CallNumber,
        'UnitID': row.UnitID,
        'IncidentNumber': row.IncidentNumber,
        'CallType': row.CallType,
        'CallDate': row.CallDate,
        'WatchDate': row.WatchDate,
        'ReceivedDtTm': row.ReceivedDtTm,
        'EntryDtTm': row.EntryDtTm,
        'DispatchDtTm': row.DispatchDtTm,
        'ResponseDtTm': row.ResponseDtTm,
        'OnSceneDtTm': row.OnSceneDtTm,
        'TransportDtTm': row.TransportDtTm,
        'HospitalDtTm': row.HospitalDtTm,
        'CallFinalDisposition': row.CallFinalDisposition,
        'AvailableDtTm': row.AvailableDtTm,
        'Address': row.Address,
        'City': row.City,
        'ZipcodeofIncident': row.ZipcodeofIncident,
        'Battalion': row.Battalion,
        'StationArea': row.StationArea,
        'Box': row.Box,
        'OriginalPriority': row.OriginalPriority,
        'Priority': row.Priority,
        'FinalPriority': parseInt(row.FinalPriority) || null,
        'ALSUnit': row.ALSUnit === 'true',
        'CallTypeGroup': row.CallTypeGroup,
        'NumberofAlarms': parseInt(row.NumberofAlarms) || null,
        'UnitType': row.UnitType,
        'Unitsequenceincalldispatch': parseInt(row.Unitsequenceincalldispatch) || null,
        'FirePreventionDistrict': row.FirePreventionDistrict,
        'SupervisorDistrict': row.SupervisorDistrict,
        'Neighborhoods-AnalysisBoundaries': row['Neighborhooods-AnalysisBoundaries'],
        'Location': row.Location,
        'RowID': row.RowID,
        'RouteID': row.RouteID,
        'DestinationName': row.DestinationName,
        'DestinationAddress': row.DestinationAddress,
        'DestinationLat': parseFloat(row.DestinationLat) || null,
        'DestinationLon': parseFloat(row.DestinationLon) || null,
        'Latitude': parseFloat(row.Latitude) || null,
        'Longitude': parseFloat(row.Longitude) || null
    };
    collectionRef.doc(doc_id).set(data)
    .then(() => {
        count++;
        console.log(`Uploaded document ${count}: ${doc_id}`);
    })
    .catch((error) => {
        console.error('Error writing document: ', error);
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
    console.log(`Uploaded a total of ${count} documents.`);
  });
