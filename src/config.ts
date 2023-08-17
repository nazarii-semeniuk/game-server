import { config } from 'dotenv';
import { cleanEnv, port } from 'envalid';

config();

const env = cleanEnv(process.env, {
    WEBSOCKETS_PORT: port()
});

export const WEBSOCKETS_PORT = env.WEBSOCKETS_PORT;