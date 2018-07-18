const express = require('express');
const path = require('path');
const app = express();

app.get('/api/project', (req, res) => {
    const options = {
        root: __dirname,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return res.sendFile('/data/project.json', options);
});

app.get('/api/videos', (req, res) => {
    const options = {
        root: __dirname,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return res.sendFile('/data/videos.json', options);
});

app.get('/api/schema', (req, res) => {
    const options = {
        root: __dirname,
        headers: {
            'Content-Type': 'text'
        }
    };
    return res.sendFile('schema.graphqls', options);
});

app.use(express.static('dist'));
app.listen(3000, () => console.log('Example app listening on port 3000!'));