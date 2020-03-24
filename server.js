const express = require('express');
const path = require('path');
const port = process.env.PORT || 8081;
const app = express();
const cors = require('cors');
app.use(cors());
// the __dirname is the current directory from where the script is running
app.use(express.static(path.join(__dirname, '/dist')));
app.use(express.static(path.join(__dirname, 'src/assets')));
app.use(express.static(path.join()));
app.use(express.static(path.join(__dirname, 'index.html')));

// send the user to index html page inspite of the url
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port);


