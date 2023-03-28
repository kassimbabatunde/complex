const keys = require('./keys');

// Express App setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5000
const app = express()
app.use(cors());
app.use(bodyParser.json());

// Postgres Client setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connected', (client )=> {
    client
    .query("CREATE TABLE IF NO EXISTS values (number INT)")
    .catch(err => console.log(`Lost PG connection: ${err}`))
});

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req,res) =>{
    res.send('Hello World...');
});

app.get('/values/all', async (req, res) =>{
    const values = await pgClient.query('SELECT * FROM values');
    res.send(JSON.stringify(values.rows));
});

app.get('/values/current', async (req, res) =>{
    redisClient.hgetall('values', (err, values) =>{
        res.send(JSON.stringify(values));
    });
});

app.post('/values', async(req, res) =>{
    const index = req.body.index;
    if(parseInt(index) > 40){
        return res.status(422).send('Index too high');
    }
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query(`INSERT INTO values(number) VALUES(${index})`);
    res.send({ working: true });
})

app.listen(port, () =>{
    console.log(`Listening on port ${port}...`)
})