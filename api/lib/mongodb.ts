import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbAdi = process.env.MONGODB_DB || 'lsms'

declare global {
  // Serverless cold-start'lar arasinda baglantiyi yeniden kullanmak icin
  var _lsmsMongoClient: Promise<MongoClient> | undefined
}

function clientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI ortam degiskeni tanimli degil.')
  }
  if (!globalThis._lsmsMongoClient) {
    globalThis._lsmsMongoClient = new MongoClient(uri).connect()
  }
  return globalThis._lsmsMongoClient
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise()
  return client.db(dbAdi)
}
