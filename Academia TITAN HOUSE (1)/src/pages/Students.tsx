import { useState } from "react";
import { STUDENTS as initialStudents, PLANS, PROFESSIONALS } from "../data";
import type { Student, Sex, PaymentStatus } from "../types";
import type { SystemUser } from "../types";

interface StudentsProps {
  user: SystemUser;
  onViewProfile: (studentId: string) => void;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    pago: "status-pago",
    pendente: "status-pendente",
    atrasado: "status-atrasado",
    adiantado: "status-adiantado",
  };
  return <span className={`badge ${map[status]}`}>{status.toUpperCase()}</span>;
}

export default function Students({ user, onViewProfile }: StudentsProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const canEdit = user.role === "master" || user.role === "atendente";

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cpf.includes(search) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.paymentStatus === filterStatus;
    const matchPlan = filterPlan === "all" || s.planId === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  const handleSave = (data: Partial<Student>) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...data } : s));
    } else {
      const newStudent: Student = {
        id: `s${Date.now()}`,
        name: data.name || "",
        age: data.age || 18,
        cpf: data.cpf || "",
        email: data.email || "",
        phone: data.phone || "",
        sex: data.sex || "M",
        planId: data.planId || "plan1",
        planStartDate: data.planStartDate || new Date().toISOString().split("T")[0],
        planEndDate: data.planEndDate || "",
        paymentStatus: "pendente",
        totalPaid: 0,
        totalOwed: PLANS.find(p => p.id === data.planId)?.price || 0,
        advanceBalance: 0,
        nextPaymentDate: data.planStartDate || new Date().toISOString().split("T")[0],
        dueDate: data.planStartDate || new Date().toISOString().split("T")[0],
        active: true,
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>ALUNOS</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>{filtered.length} aluno(s) encontrado(s)</p>
        </div>
        {canEdit && (
          <button className="titan-btn-primary" onClick={() => { setEditingStudent(null); setShowModal(true); }}>
            + NOVO ALUNO
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="titan-input"
          style={{ maxWidth: 240 }}
          placeholder="🔍 Buscar por nome, CPF ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="titan-select" style={{ maxWidth: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos os Status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado</option>
          <option value="adiantado">Adiantado</option>
        </select>
        <select className="titan-select" style={{ maxWidth: 160 }} value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="all">Todos os Planos</option>
          {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="titan-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="titan-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20 }}>Aluno</th>
                <th>CPF</th>
                <th>Plano</th>
                <th>Pago</th>
                <th>Deve</th>
                <th>Vencimento</th>
                <th>Status</th>
                {canEdit && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const plan = PLANS.find(p => p.id === s.planId);
                return (
                  <tr key={s.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewProfile(s.id)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "#428475", color: "#1A312C" }}>
                          {s.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm hover:underline" style={{ color: "#FFF4E1" }}>{s.name}</div>
                          <div className="text-xs" style={{ color: "#89D7B7" }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{s.cpf}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>
                        {plan?.name}
                      </span>
                    </td>
                    <td className="font-mono text-sm" style={{ color: "#86efac" }}>{fmt(s.totalPaid)}</td>
                    <td className="font-mono text-sm" style={{ color: s.totalOwed > 0 ? "#fca5a5" : "#89D7B7" }}>
                      {s.totalOwed > 0 ? fmt(s.totalOwed) : "—"}
                    </td>
                    <td className="font-mono text-xs">{new Date(s.dueDate).toLocaleDateString("pt-BR")}</td>
                    <td><StatusBadge status={s.paymentStatus} /></td>
                    {canEdit && (
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onViewProfile(s.id)}
                            className="text-xs px-2 py-1 rounded transition-all"
                            style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => { setEditingStudent(s); setShowModal(true); }}
                            className="text-xs px-2 py-1 rounded transition-all"
                            style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}
                          >
                            Editar
                          </button>
                          {user.role === "master" && (
                            <button
                              onClick={() => setDeleteConfirm(s.id)}
                              className="text-xs px-2 py-1 rounded transition-all"
                              style={{ background: "rgba(127,29,29,0.3)", color: "#fca5a5" }}
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: "#428475" }}>
              Nenhum aluno encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingStudent(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box p-8 max-w-sm">
            <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#fca5a5" }}>CONFIRMAR EXCLUSÃO</h3>
            <p className="text-sm mb-6" style={{ color: "#89D7B7" }}>
              Esta ação é irreversível. Deseja excluir este aluno?
            </p>
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

function StudentModal({
  student,
  onSave,
  onClose,
}: {
  student: Student | null;
  onSave: (data: Partial<Student>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: student?.name || "",
    age: student?.age || 18,
    cpf: student?.cpf || "",
    email: student?.email || "",
    phone: student?.phone || "",
    sex: (student?.sex || "M") as Sex,
    planId: student?.planId || "plan1",
    planStartDate: student?.planStartDate || new Date().toISOString().split("T")[0],
    planEndDate: student?.planEndDate || "",
  });

  const selectedPlan = PLANS.find(p => p.id === form.planId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const endDate = new Date(form.planStartDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    onSave({ ...form, planEndDate: endDate.toISOString().split("T")[0] });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-6" style={{ background: "#1F3D36", borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>
            {student ? "EDITAR ALUNO" : "NOVO ALUNO"}
          </h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Nome Completo</label>
              <input className="titan-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Idade</label>
              <input className="titan-input" type="number" min={14} max={99} required value={form.age} onChange={e => setForm(f => ({ ...f, age: +e.target.value }))} />
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
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>CPF</label>
              <input className="titan-input" placeholder="000.000.000-00" required value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Telefone</label>
              <input className="titan-input" placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Email</label>
              <input className="titan-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Plano</label>
              <select className="titan-select" value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))}>
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Início do Plano</label>
              <input className="titan-input" type="date" value={form.planStartDate} onChange={e => setForm(f => ({ ...f, planStartDate: e.target.value }))} />
            </div>
          </div>

          {selectedPlan && (
            <div className="p-3 rounded-lg" style={{ background: "rgba(137,215,183,0.08)", border: "1px solid rgba(137,215,183,0.2)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: "#89D7B7" }}>Plano Selecionado: {selectedPlan.name}</div>
              <div className="font-mono text-lg font-bold" style={{ color: "#FFF4E1" }}>
                {selectedPlan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}<span className="text-xs font-normal" style={{ color: "#89D7B7" }}>/mês</span>
              </div>
              <div className="text-xs mt-1" style={{ color: "#428475" }}>{selectedPlan.description}</div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">
              {student ? "SALVAR ALTERAÇÕES" : "CADASTRAR ALUNO"}
            </button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
