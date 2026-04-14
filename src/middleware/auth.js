import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../services/jwt.service.js';

// Verifica o Access Token enviado no header Authorization: Bearer <token>
export function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.slice(7); // remove o prefixo "Bearer "

    try {
        const payload = verifyAccessToken(token);
        req.user = payload; // disponibiliza os dados do usuário para a rota
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Access token expired' });
        }
        return res.status(401).json({ error: 'Invalid access token' });
    }
}

// Verifica se o usuário autenticado possui um dos perfis permitidos
export function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}
