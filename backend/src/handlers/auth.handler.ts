import type { LoginBody } from "../types.js"
import type { RouteHandler } from "fastify";

export const loginHandler: RouteHandler<{Body: LoginBody}> = async(request, reply) => {
    const { email, password } = request.body;
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = request.server.config;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = request.server.jwt.sign({email}, {expiresIn: '24h'});

        return reply.status(200).send({
            success: true,
            data: {token, email}
        });
    }

    return reply.status(401).send({
        success: false,
        error: 'Invalid credentials'
    })
}