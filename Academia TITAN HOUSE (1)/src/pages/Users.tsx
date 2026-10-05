import { useState } from "react";
import { USERS as initialUsers } from "../data";
import type { SystemUser, UserRole } from "../types";

interface UsersProps {
  user: SystemUser;
}

const ROLE_LABELS: Record<UserRole, string> = {
  master: "MASTER",
  professor: "PROFESSOR",
  atendente: "ATENDENTE",
  aluno: "ALUNO",
};

const ROLE_COLORS: Record<UserRole, string> = {
  master: "#fde68a",
  professor: "#89D7B7",
  atendente: "#93c5fd",
  aluno: "#428475",
};

export default function Users({ user }: UsersProps) {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  if (user.role !== "master") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="font-display text-2xl font-bold" style={{ color: "#fca5a5" }}>ACESSO RESTRITO</div>
          <div className="text-sm mt-2" style={{ color: "#428475" }}>Apenas o usuário MASTER pode gerenciar usuários.</div>
        </div>
      </div>
    );
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSave = (data: Partial<SystemUser>) => {
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...data } : u));
    } else {
      setUsers(prev => [...prev, {
        id: `u${Date.now()}`,
        name: data.name || "",
        email: data.email || "",
        password: data.password || "123456",
        role: data.role || "atendente",
        active: true,
      }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (id === user.id) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggle = (id: string) => {
    if (id === user.id) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>USUÁRIOS DO SISTEMA</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>{filtered.length} usuário(s) · Acesso MASTER</p>
        </div>
        <button className="titan-btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + NOVO USUÁRIO
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input className="titan-input" style={{ maxWidth: 240 }} placeholder="🔍 Buscar por nome ou email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="titan-select" style={{ maxWidth: 180 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">Todos os Perfis</option>
          <option value="master">Master</option>
          <option value="professor">Professor</option>
          <option value="atendente">Atendente</option>
          <option value="aluno">Aluno</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["master", "professor", "atendente", "aluno"] as UserRole[]).map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="titan-card py-3 text-center">
              <div className="font-mono text-2xl font-bold" style={{ color: ROLE_COLORS[role] }}>{count}</div>
              <div className="text-xs mt-1" style={{ color: "#428475" }}>{ROLE_LABELS[role]}</div>
            </div>
          );
        })}
      </div>

      <div className="titan-card p-0 overflow-hidden">
        <table className="titan-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Usuário</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ opacity: u.active ? 1 : 0.5 }}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] }}>
                      {u.name[0]}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "#FFF4E1" }}>{u.name}</span>
                    {u.id === user.id && (
                      <span className="badge" style={{ background: "rgba(137,215,183,0.2)", color: "#89D7B7" }}>Você</span>
                    )}
                  </div>
                </td>
                <td className="text-sm" style={{ color: "#89D7B7" }}>{u.email}</td>
                <td>
                  <span className="badge" style={{ background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.active ? "status-pago" : "status-atrasado"}`}>
                    {u.active ? "ATIVO" : "INATIVO"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(u); setShowModal(true); }}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}
                    >
                      Editar
                    </button>
                    {u.id !== user.id && (
                      <>
                        <button
                          onClick={() => handleToggle(u.id)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: u.active ? "rgba(113,63,18,0.3)" : "rgba(22,101,52,0.3)", color: u.active ? "#fde68a" : "#86efac" }}
                        >
                          {u.active ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: "rgba(127,29,29,0.3)", color: "#fca5a5" }}
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: "#428475" }}>Nenhum usuário encontrado.</div>
        )}
      </div>

      {showModal && (
        <UserModal user_={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box p-8 max-w-sm">
            <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#fca5a5" }}>CONFIRMAR EXCLUSÃO</h3>
            <p className="text-sm mb-6" style={{ color: "#89D7B7" }}>Esta ação removerá o acesso do usuário ao sistema.</p>
            <div className="flex gap-3">
              <button className="titan-btn-danger flex-1" onClick={() => handleDelete(deleteConfirm)}>Excluir</button>
              <button className="titan-btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserModal({ user_, onSave, onClose }: { user_: SystemUser | null; onSave: (d: Partial<SystemUser>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: user_?.name || "",
    email: user_?.email || "",
    password: "",
    role: (user_?.role || "atendente") as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<SystemUser> = { name: form.name, email: form.email, role: form.role };
    if (form.password) data.password = form.password;
    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>{user_ ? "EDITAR USUÁRIO" : "NOVO USUÁRIO"}</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Nome Completo</label>
            <input className="titan-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Email</label>
            <input className="titan-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>
              {user_ ? "Nova Senha (deixe em branco para manter)" : "Senha"}
            </label>
            <input className="titan-input" type="password" placeholder="••••••••"
              required={!user_} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Perfil de Acesso</label>
            <select className="titan-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
              <option value="master">Master (Acesso Total)</option>
              <option value="professor">Professor</option>
              <option value="atendente">Atendente</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>
          <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(66,132,117,0.1)", color: "#89D7B7" }}>
            <strong>Perfis:</strong><br />
            • <strong>Master</strong>: Acesso total ao sistema<br />
            • <strong>Professor</strong>: Gerencia treinos e alunos<br />
            • <strong>Atendente</strong>: Cadastros, planos e pagamentos<br />
            • <strong>Aluno</strong>: Visualiza perfil, treinos e aulas
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">{user_ ? "SALVAR" : "CRIAR USUÁRIO"}</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
