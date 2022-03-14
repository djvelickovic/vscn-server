const mongodb = require('mongodb')
require('dotenv').config()

const connectionString = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DATABASE_NAME

const client = new mongodb.MongoClient(connectionString, {
  maxPoolSize: 5,
  minPoolSize: 5
})

let dbConnection

module.exports.connectToServer = async () => {
  const db = await client.connect()
  dbConnection = db.db(databaseName)
  console.log('Successfully connected to the MongoDB')
}

/**
 * @return {mongodb.Db}
 */
module.exports.getDb = () => dbConnection