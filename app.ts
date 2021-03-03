import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import loginRouter from './routes/login';
import imagesRouter from './routes/images';
import searchRouter from './routes/search';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);
app.use('/images', imagesRouter);
app.use('/search', searchRouter);

export default app;
