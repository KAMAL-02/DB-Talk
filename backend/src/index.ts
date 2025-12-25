import 'dotenv/config';
import { app } from './app.js';
import { configPlugin } from './plugins/config.js';
import { jwtPlugin } from './plugins/jwt.js';
import { corsPlugin } from './plugins/cors.js';
import { registerRoutes } from './routes/index.js';

const start = async () => {
    try {

        await app.register(configPlugin);
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