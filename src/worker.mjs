import {plugins} from './engine.mjs';
self.onmessage=({data})=>{try{const plugin=plugins.get(data.language);if(!plugin)throw Error('Runtime adapter unavailable');postMessage(plugin.trace(data.source));}catch(e){postMessage({events:[],error:e.message});}};
