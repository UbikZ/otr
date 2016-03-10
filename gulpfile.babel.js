'use strict';

// Base
import config from './config.json';
import GulpApplication from './gulp/GulpApplication';

config.env.debug = !~['staging', 'production'].indexOf(process.env.NODE_ENV);

const app = new GulpApplication(config);
app.initialize();
