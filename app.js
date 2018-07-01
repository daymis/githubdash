const express = require('express');
const app = express();
const routes = require('./routes');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const nunjucks = require('nunjucks');
const compression = require('compression');

module.exports = app;

app.use(compression());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('/public'));

app.set('view-engine', 'html');
app.engine('html', nunjucks.render);

nunjucks.configure('views', { noCache: true });
nunjucks.render('index.html');

// app.use('/', routes);
app.use('/', routes);

// app.use(express.static(path.join(__dirname, '..', 'public')));
// app.use('*', (req, res) => res.sendFile(path.join(__dirname, '..', '/views/index.html')));

app.listen(3000, () => console.log(`LISTENING IN ON PORT 3000`));