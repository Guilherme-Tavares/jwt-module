import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Todas as rotas deste módulo exigem autenticação
router.use(authenticate);

// GET /usuarios — restrito a admin e moderador
router.get('/usuarios', authorize('admin', 'moderador'), (_req, res) => {
    const users = [
        { id: 1, name: 'Alice Admin',  role: 'admin'     },
        { id: 2, name: 'Bob User',     role: 'usuario'   },
        { id: 3, name: 'Carol Mod',    role: 'moderador' },
    ];

    return res.status(200).json({ data: users });
});

// POST /dados — acessível a todos os perfis autenticados; resposta varia pelo perfil
router.post('/dados', (req, res) => {
    const { role, name } = req.user;

    const responses = {
        admin: {
            message: `Welcome, ${name}. You have full access.`,
            data: {
                systemStats:  { users: 3, activeTokens: 12, uptime: process.uptime() },
                recentEvents: ['User bob logged in', 'Token refreshed for carol', 'Config updated'],
            },
        },
        moderador: {
            message: `Welcome, ${name}. You have moderation access.`,
            data: {
                pendingReviews: ['Post #42', 'Comment #87'],
                recentFlags:    ['Report #5 — spam', 'Report #6 — inappropriate content'],
            },
        },
        usuario: {
            message: `Welcome, ${name}.`,
            data: {
                profile:      { name, role },
                recentOrders: ['Order #101 — delivered', 'Order #102 — in transit'],
            },
        },
    };

    return res.status(200).json(responses[role] ?? { message: 'Access granted', data: {} });
});

export default router;
