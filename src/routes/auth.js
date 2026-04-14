import { Router } from 'express';
import { findByUsername, findById } from '../data/users.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.service.js';
import { saveToken, isTokenValid, revokeToken } from '../services/tokenStore.js';

const router = Router();

// POST /auth/login — valida credenciais e emite os dois tokens
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = findByUsername(username);

    // Resposta genérica para não revelar se o usuário existe ou não
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

    saveToken(tokenId, user.id, expiresAt);

    return res.status(200).json({ accessToken, refreshToken });
});

// POST /auth/refresh — valida o refresh token e emite novos tokens (rotação)
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const { sub: userId, jti: tokenId } = payload;

    // Rejeita token já revogado ou não registrado no store
    if (!isTokenValid(tokenId)) {
        return res.status(401).json({ error: 'Refresh token has been revoked' });
    }

    // Busca o usuário para garantir que ele ainda existe e obter name e role atualizados
    const user = findById(userId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    // Rotação: invalida o token atual antes de emitir um novo
    revokeToken(tokenId);

    const newAccessToken = generateAccessToken(user);
    const { token: newRefreshToken, tokenId: newTokenId, expiresAt } = generateRefreshToken(userId);

    saveToken(newTokenId, userId, expiresAt);

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// POST /auth/logout — revoga o refresh token informado
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        // Token inválido ou expirado: nada a revogar, mas não é erro do cliente
        return res.status(204).send();
    }

    revokeToken(payload.jti);

    return res.status(204).send();
});

export default router;
