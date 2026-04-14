import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

// Gera um Access Token com dados públicos do usuário (id, nome, perfil)
export function generateAccessToken(user) {
    const payload = {
        sub:  user.id,
        name: user.name,
        role: user.role,
    };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// Gera um Refresh Token com ID único (jti) para controle de revogação
export function generateRefreshToken(userId) {
    const tokenId = randomUUID();
    const payload = { sub: userId, jti: tokenId };
    const token = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

    // Decodifica para obter o timestamp de expiração gerado pelo jwt.sign
    const decoded = jwt.decode(token);

    return { token, tokenId, expiresAt: decoded.exp * 1000 };
}

// Verifica e retorna o payload do Access Token; lança erro se inválido ou expirado
export function verifyAccessToken(token) {
    return jwt.verify(token, env.jwtSecret);
}

// Verifica e retorna o payload do Refresh Token; lança erro se inválido ou expirado
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.jwtRefreshSecret);
}
