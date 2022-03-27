const mongodb = require('mongodb')
require('dotenv').config()

const connectionString = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DATABASE_NAME
const fixedPoolSize = +process.env.MONGODB_POOL_SIZE || 5

const client = new mongodb.MongoClient(connectionString, {
  maxPoolSize: fixedPoolSize,
  minPoolSize: fixedPoolSize
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