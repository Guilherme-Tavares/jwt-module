// Valida as variáveis de ambiente obrigatórias na inicialização
const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

export const env = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
