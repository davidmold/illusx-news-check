
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
const s3 = new S3Client({ region: 'us-east-1'})

export default {
  async downloadJsonFile (bucket, keyName) {
    let params = { Bucket: bucket, Key: keyName };
    const data = await s3.send(new GetObjectCommand(params))
    let mdata = data.Body.toString('utf-8');
    return JSON.parse(mdata);
  },
  async storeJsonString (bucket, keyname, data) {
    try {
      let str = JSON.stringify(data)
      const uploadParams = {
        Bucket: bucket,
        Key: keyname,
        ContentType: 'text/plain',
        Body: Buffer.from(str, 'utf-8')
      }
      await s3.send(new PutObjectCommand(uploadParams));
    }
    catch(err) {
      console.log(err)
    }
  },
  async storeFile (bucket, keyname, buffer, mimetype) {
    try {
      const uploadParams = {
        Bucket: bucket,
        Key: keyname,
        ContentType: mimetype,
        Body: buffer
      }
      await s3.send(new PutObjectCommand(uploadParams));
    }
    catch(err) {
      console.log(err)
    }
    
  }
}