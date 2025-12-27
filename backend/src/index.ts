import 'dotenv/config';
import { app } from './app.js';
import { configPlugin } from './plugins/config.plugin.js';
import { jwtPlugin } from './plugins/jwt.plugin.js';
import { corsPlugin } from './plugins/cors.plugin.js';
import { registerRoutes } from './routes/index.js';
import { dbPlugin } from './plugins/db.plugin.js';
import { redisPlugin } from './plugins/redis.plugin.js';
import { geminiPlugin } from './plugins/gemini.plugin.js';

const start = async () => {
    try {

        await app.register(configPlugin);
        await app.register(dbPlugin);
        await app.register(redisPlugin);
        await app.register(geminiPlugin);
        await app.register(corsPlugin);
        await app.register(jwtPlugin);
        
        await app.register(registerRoutes, { prefix: '/api' });
        
        const port = app.config.PORT;
        await app.listen({ port, host: '0.0.0.0' });
    } catch (error: any) {
        app.log.error(error, "Error starting server");
        process.exit(1);
    }
};

start();