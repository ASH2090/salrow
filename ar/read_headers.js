
const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('./ems_calls_routes_500.csv')
  .pipe(csv())
  .on('headers', (headers) => {
    console.log(headers);
    process.exit(0);
  });
