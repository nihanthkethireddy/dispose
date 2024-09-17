import { Router, Request, Response } from 'express';
import { S3Client, ListBucketsCommand, ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import {Client} from "pg";
import { Signer } from '@aws-sdk/rds-signer'
const { Kafka } = require('kafkajs')
const { generateAuthToken } = require('aws-msk-iam-sasl-signer-js')

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {EachMessagePayload} from "kafkajs";



const router = Router();
const client = new S3Client({ region: "us-east-1" });

router.get('/', async (req: Request, res: Response) => {
  res.send("Hello world!")


});

router.get('/dbTest', async (req: Request, res: Response) => {

  try {
    const client = new STSClient({region: 'us-east-1'});

    let cic = new GetCallerIdentityCommand({})

    let resp = client.send(cic).then((r) => {
      console.log(r)
    });

    let user = process.env.DB_USER || 'ordernegotiation';
    console.log("user", user)
    let signer = new Signer({
      region: 'us-east-1',
      hostname: 'cci-web-dev.cdytq7ggxjhh.us-east-1.rds.amazonaws.com',
      port: 5432,
      username: user
    });


    const token = await signer.getAuthToken();
    const pgClient = new Client({
      user: user,
      password: token,
      host: 'cci-web-dev.cdytq7ggxjhh.us-east-1.rds.amazonaws.com',
      port: 5432,
      database: 'steptracker',
      ssl: {
        rejectUnauthorized: false
      }
    })
    await pgClient.connect()
    let dbres = await pgClient.query("SELECT * from public.sttest")
    console.log(dbres)
    res.send(JSON.stringify(dbres))
  }
  catch (e) {
    console.log(e)
    res.send('error')
  }
});

router.get('/kafkaTest', async (req: Request, res: Response) => {

  const kafka = new Kafka({
    clientId: 'som-dev-sean',
    brokers: ['b-2.cciapinonprod.eldqm1.c8.kafka.us-east-1.amazonaws.com:9098','b-1.cciapinonprod.eldqm1.c8.kafka.us-east-1.amazonaws.com:9098'],
    ssl: true,
    sasl: {
      mechanism: 'oauthbearer',
      oauthBearerProvider: () => oauthBearerTokenProvider('us-east-1')
    }
  })

  // const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'som-dev-sean' })

  // Producing
  // await producer.connect()
  // await producer.send({
  //   topic: 'test-topic',
  //   messages: [
  //     { value: 'Hello KafkaJS user!' },
  //   ],
  // })

  // Consuming
  await consumer.connect()
  await consumer.subscribe({ topic: 'som-dev-test-2', fromBeginning: true })

  await consumer.run({

    eachMessage: async (payload: EachMessagePayload) => {
      let topic = payload.topic;
      let partition = payload.partition;
      let message = payload.message;
      console.log({
        partition,
        offset: message.offset,
        value: message.value ? message.value.toString() : 'no message',
      })
    },
  })

});

async function oauthBearerTokenProvider(region: String) {
  // Uses AWS Default Credentials Provider Chain to fetch credentials
  const authTokenResponse = await generateAuthToken({ region });
  return {
    value: authTokenResponse.token
  }
}

router.get('/s3test', async (req: Request, res: Response) => {
  const bucket = (typeof req.query.bucket === "string") ? req.query.bucket : "";

  if (bucket) {
    let key = Math.random() * 1000000;


    const input = {
      "Body": "HappyFace.jpg",
      "Bucket": "ccitmpsom",
      "Key": "test" + key + ".txt"
    };

    const command = new ListObjectsCommand({ Bucket: bucket });
    let baseData = JSON.stringify(process.env) + "\n"
    try {
      const data = await client.send(command);
      const writeCommand = new PutObjectCommand(input)
      await client.send(writeCommand);
      res.send(baseData + JSON.stringify(data))
      // process data.
    } catch (error) {
      res.send(baseData + JSON.stringify(error))
      // error handling.
    } finally {
      // finally.
    }
  }
  else {
    res.send("pass a bucket param to test connectivity")
  }

});

export default router;
