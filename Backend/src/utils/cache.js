import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

console.log('[Cache] In-memory tactical cache initialized.');

export default cache;
