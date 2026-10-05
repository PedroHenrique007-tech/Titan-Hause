import { useState } from "react";
import { PROFESSIONALS as initialProfessionals } from "../data";
import type { Professional, Sex, ProfRole } from "../types";
import type { SystemUser } from "../types";

interface ProfessionalsProps {
  user: SystemUser;
}

const WORK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function Professionals({ user }: ProfessionalsProps) {
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const canEdit = user.role === "master";

  const filtered = professionals.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || p.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSave = (data: Partial<Professional>) => {
    if (editing) {
      setProfessionals(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p));
    } else {
      const newProf: Professional = {
        id: `p${Date.now()}`,
        name: data.name || "",
        age: data.age || 25,
        sex: data.sex || "M",
        role: data.role || "Atendente",
        phone: data.phone || "",
        workDays: data.workDays || [],
        specialties: data.specialties || [],
        active: true,
      };
      setProfessionals(prev => [...prev, newProf]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const roleColor: Record<string, string> = {
    Professor: "#89D7B7",
    Instrutor: "#93c5fd",
    Instrutora: "#93c5fd",
    Atendente: "#fde68a",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>PROFISSIONAIS</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>{filtered.length} profissional(is)</p>
        </div>
        {canEdit && (
          <button className="titan-btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            + NOVO PROFISSIONAL
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input className="titan-input" style={{ maxWidth: 240 }} placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="titan-select" style={{ maxWidth: 180 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">Todos os Cargos</option>
          <option value="Professor">Professor</option>
          <option value="Instrutor">Instrutor</option>
          <option value="Atendente">Atendente</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prof => (
          <div key={prof.id} className="titan-card">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1A312C, #243F38)", border: "2px solid #428475", color: "#89D7B7" }}>
                {prof.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display text-lg font-bold truncate" style={{ color: "#FFF4E1" }}>{prof.name}</div>
                  <span className="badge flex-shrink-0" style={{ background: "rgba(66,132,117,0.2)", color: roleColor[prof.role] || "#89D7B7" }}>
                    {prof.role.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>📞 {prof.phone}</div>
                <div className="text-xs mt-0.5" style={{ color: "#428475" }}>
                  {prof.sex === "M" ? "Masculino" : prof.sex === "F" ? "Feminino" : "Outro"} · {prof.age} anos
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#428475" }}>Dias Trabalhados</div>
              <div className="flex flex-wrap gap-1">
                {WORK_DAYS.map(day => (
                  <span key={day} className="text-xs px-2 py-0.5 rounded"
                    style={prof.workDays.includes(day)
                      ? { background: "#428475", color: "#FFF4E1" }
                      : { background: "rgba(66,132,117,0.1)", color: "#428475" }}>
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>

            {prof.specialties.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#428475" }}>Especialidades</div>
                <div className="flex flex-wrap gap-1">
                  {prof.specialties.map(s => (
                    <span key={s} className="badge" style={{ background: "rgba(137,215,183,0.1)", color: "#89D7B7" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {canEdit && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setEditing(prof); setShowModal(true); }}
                  className="titan-btn-secondary flex-1 text-sm py-1.5"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(prof.id)}
                  className="titan-btn-danger flex-1 text-sm py-1.5"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="titan-card text-center py-12 text-sm" style={{ color: "#428475" }}>
          Nenhum profissional encontrado.
        </div>
      )}

      {showModal && (
        <ProfModal prof={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box p-8 max-w-sm">
            <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#fca5a5" }}>CONFIRMAR EXCLUSÃO</h3>
            <p className="text-sm mb-6" style={{ color: "#89D7B7" }}>Deseja excluir este profissional?</p>
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

function ProfModal({ prof, onSave, onClose }: { prof: Professional | null; onSave: (d: Partial<Professional>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: prof?.name || "",
    age: prof?.age || 25,
    sex: (prof?.sex || "M") as Sex,
    role: (prof?.role || "Atendente") as ProfRole,
    phone: prof?.phone || "",
    workDays: prof?.workDays || [] as string[],
    specialties: prof?.specialties?.join(", ") || "",
  });

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      workDays: f.workDays.includes(day) ? f.workDays.filter(d => d !== day) : [...f.workDays, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      specialties: form.specialties.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-6" style={{ background: "#1F3D36", borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>{prof ? "EDITAR PROFISSIONAL" : "NOVO PROFISSIONAL"}</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Nome</label>
              <input className="titan-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Idade</label>
              <input className="titan-input" type="number" min={18} required value={form.age} onChange={e => setForm(f => ({ ...f, age: +e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Sexo</label>
              <select className="titan-select" value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as Sex }))}>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Cargo</label>
              <select className="titan-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as ProfRole }))}>
                <option value="Instrutor">Instrutor</option>
                <option value="Professor">Professor</option>
                <option value="Atendente">Atendente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Telefone</label>
              <input className="titan-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Especialidades (separadas por vírgula)</label>
              <input className="titan-input" placeholder="Ex: Musculação, Funcional" value={form.specialties} onChange={e => setForm(f => ({ ...f, specialties: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Dias Trabalhados</label>
              <div className="flex flex-wrap gap-2">
                {WORK_DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={form.workDays.includes(day)
                      ? { background: "#428475", color: "#FFF4E1" }
                      : { background: "rgba(66,132,117,0.15)", color: "#89D7B7", border: "1px solid rgba(66,132,117,0.3)" }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">{prof ? "SALVAR" : "CADASTRAR"}</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
