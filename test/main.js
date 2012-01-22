require('../src/database.js');
require('../src/synchronizer.js');

solubis.data.Synchronizer.setURL('http://192.168.1.2/synchronizer/db/');
solubis.data.Database.setLogging(true);
solubis.data.Database.setUser('Jenna Waite');
solubis.data.Database.createDatabase();