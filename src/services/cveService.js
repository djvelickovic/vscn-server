const dbo = require('../db/conn')
const { MONGO_CVE_COLLECTION } = require('../constants/constants')

module.exports.getCVEs = async (cveList) => dbo.getDb()
  .collection(MONGO_CVE_COLLECTION)
  .find({ id: { $in: cveList } })
  .toArray()

