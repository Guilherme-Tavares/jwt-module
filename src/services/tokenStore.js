// Armazenamento em memória dos refresh tokens válidos
// Em produção, substituir por Redis ou tabela no banco de dados
const store = new Map(); // tokenId -> { userId, expiresAt }

// Registra um novo refresh token no store
export function saveToken(tokenId, userId, expiresAt) {
    store.set(tokenId, { userId, expiresAt });
}

// Verifica se um token existe e ainda não expirou
export function isTokenValid(tokenId) {
    const entry = store.get(tokenId);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
        store.delete(tokenId); // remove token expirado ao encontrá-lo
        return false;
    }

    return true;
}

// Revoga um refresh token específico (logout simples ou rotação)
export function revokeToken(tokenId) {
    store.delete(tokenId);
}

// Revoga todos os tokens de um usuário (logout global ou comprometimento de sessão)
export function revokeAllUserTokens(userId) {
    for (const [tokenId, entry] of store.entries()) {
        if (entry.userId === userId) {
            store.delete(tokenId);
        }
    }
}
