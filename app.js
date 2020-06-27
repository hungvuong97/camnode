const { Client } = require('@elastic/elasticsearch')
const cassandra = require('cassandra-driver');
const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
const esClient = new Client({ node: 'http://192.168.151.11:9200' })
const client = new cassandra.Client({
    contactPoints: ["192.168.151.11"],
    localDataCenter: 'datacenter1',
    keyspace: "traffic",
    protocolOptions: {
        port: 9042
    },
});

app.get('/es-search', async (req, res) => {
    const { body } = await esClient.search(
        {
            index: 'metromind-raw-day*',
            from: 20,
            size: 100, 
            body: {
                query: {
                    match: {
                        track_type: 1,
                    }
                }
            },
        })
    // console.log(body.hits.hits)
    let result = body.hits.hits
    return res.json(result)
})

app.get('/cassandra', (req, res) => {
    let queryObject = {};
    queryObject['query'] = 'SELECT * FROM traffic.config';
    client.execute(queryObject['query'], queryObject['params'], { prepare: true })
        .then(result => {
            res.json(result.rows)
        }).catch(error => {
            console.log(error);
        });
})

app.listen(5001)