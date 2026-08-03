import NodeCache from 'node-cache';
import logger from './logger.js';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

logger.info('cache_initialized', { msg: 'In-memory tactical cache initialized.' });

export default cache;
