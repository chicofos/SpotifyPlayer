var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.end('hello world')
});

app.listen(port, () =>{
    console.log(` Server running on port ${port}`);
});