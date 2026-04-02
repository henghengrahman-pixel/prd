require('dotenv').config();
const { seedDataIfMissing } = require('../helpers/file-db');

seedDataIfMissing()
  .then(() => {
    console.log('Data seed berhasil dibuat.');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
