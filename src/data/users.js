// Usuários mockados — em produção, substituir por consulta ao banco de dados
export const users = [
    { id: 1, username: 'alice', password: 'admin123', role: 'admin',      name: 'Alice Admin' },
    { id: 2, username: 'bob',   password: 'user456',  role: 'usuario',    name: 'Bob User' },
    { id: 3, username: 'carol', password: 'mod789',   role: 'moderador',  name: 'Carol Mod' },
];

export function findByUsername(username) {
    return users.find(u => u.username === username) ?? null;
}

export function findById(id) {
    return users.find(u => u.id === id) ?? null;
}
