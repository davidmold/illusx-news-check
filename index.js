
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"
import s3m from './s3-manager.js'
// Set the AWS Region.
const REGION = "us-east-1" //e.g. "us-east-1"
// Create an Amazon DynamoDB service client object.
const client = new DynamoDBClient({ region: REGION })



async function countAll(params) {
  let results = []
  let mcount = 0
  let items
  do {
      items = await runQuery(params)
      mcount += items.Count
      items.Items.forEach((item) => results.push(taggifyString(item.tags)))
      params.ExclusiveStartKey  = items.LastEvaluatedKey
  } while (typeof items.LastEvaluatedKey != 'undefined')
  return { count: mcount, tags: results }
}

function taggifyString(str) {
  let res = str.S.split('#')
  if(res) {
    return res.filter(e => e)
  }
  return []
}

async function getAllTags() {
  const parms = {
    KeyConditionExpression: 'pk = :q',
    ExpressionAttributeValues: { 
      ':q': { 'S': 'tag' }
    },
    TableName: 'news'
  }
  let results = []
  let items
  do {
    items = await runQuery(parms)
    items.Items.forEach((item) => {
      results.push(item.tag.S.toLowerCase())
    })
    parms.ExclusiveStartKey  = items.LastEvaluatedKey
  } while (typeof items.LastEvaluatedKey != 'undefined')
  return results
}

async function runQuery (params) {
  return await client.send(new QueryCommand(params));
}

async function getAllNewsItems() {
  const parms = {
    KeyConditionExpression: 'pk = :q',
    ExpressionAttributeValues: { 
      ':q': { 'S': 'news' }
    },
    TableName: 'news'
  }
  return await countAll(parms)
}

function getTagCount(items, tag) {
  let count = 0
  
  for(let item of items) {
    if(item.includes(tag)) {
      count++
    }
  }
  return count
}

async function main () {
  try {
    let res = await getAllNewsItems()
    const solved = {
      'all': res.count
    }
    let tags = await getAllTags()
    for(let tag of tags) {
      let ct = getTagCount(res.tags, tag.toLowerCase())
      solved[tag] = ct
    }
    console.log(JSON.stringify(solved))
    await s3m.storeJsonString('illusx-demo','news-index.json', solved)
    await s3m.storeJsonString('illusx-demo-x1a','news-index.json', solved)
    console.log('posted')
  } catch (err) {
    console.error(err)
  }
}

main().then(() => {
  console.log('done')
})

