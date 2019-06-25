
process.env['DB_DRIVER'] = 'mysql';
process.env['DB_HOST'] = 'admin.mrpengu.com';
process.env['DB_USERNAME'] = 'mrpengu_remote';
process.env['DB_PASSWORD'] = 'M7D+O13_tLG}Rp(#8k^5KZo[$h0{Ys';
process.env['DB_NAME'] = 'mrpengu_admin';

const util = require('util');
const Model = require('./dist').Model;

class Test extends Model {
  static tableName() {
    return 'test'
  }
}


const dbg = {
  env: () => {
    console.log('Enviroment variables + .env file:');
    console.log(util.inspect(process.env));
  },
  dataRemoteDbTest: async () => {
    console.log(util.inspect(process.env));

    //const Test = require('./data/models/test').Test;
    //let testData = await Test.all()
    console.log('Remote Test[test] data:');
    //console.log(testData);


    const row7 = await Test.where({ id: 7 }).first();

    console.log(row7, util.inspect(row7), row7.name, row7.votes);

    //await Test.create({ id: 13, votes: 2 });

    data.endAdminDbConnection();

    // Test.all().then(testData => {
    //   console.log('Remote Test[test] data:');
    //   console.log(testData);

    //   console.log(util.inspect(process._getActiveRequests()));
    //   console.log(util.inspect(process._getActiveHandles()));
    // });
  }
}

dbg.dataRemoteDbTest();

// function usage() {
//   console.log('Use [--run=?] to run a debug case.');
// }

// if('run' in argv) {
//   const { run } = argv;
//   if(run in dbg) {
//     dbg[run]();
//   } else {
//     console.log(`Run case "${run}" not found.`)
//   }
// } else {
//   usage();
// }
