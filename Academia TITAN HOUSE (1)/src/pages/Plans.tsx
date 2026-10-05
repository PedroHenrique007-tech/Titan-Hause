import { useState } from "react";
import { PLANS as initialPlans, STUDENTS } from "../data";
import type { Plan } from "../types";
import type { SystemUser } from "../types";

interface PlansProps {
  user: SystemUser;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Plans({ user }: PlansProps) {
  const [plans] = useState<Plan[]>(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const canEdit = user.role === "master";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>PLANOS & BENEFÍCIOS</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>Gerencie os planos oferecidos pela academia</p>
        </div>
        {canEdit && (
          <button className="titan-btn-primary" onClick={() => { setEditingPlan(null); setShowModal(true); }}>
            + NOVO PLANO
          </button>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const studentCount = STUDENTS.filter(s => s.planId === plan.id).length;
          const colors = ["#428475", "#89D7B7", "#FFF4E1"];
          const bgs = ["rgba(66,132,117,0.1)", "rgba(137,215,183,0.08)", "rgba(255,244,225,0.06)"];
          const c = colors[idx] || "#89D7B7";
          const bg = bgs[idx] || "rgba(66,132,117,0.08)";

          return (
            <div key={plan.id} className="titan-card relative overflow-hidden" style={{ borderColor: `${c}40` }}>
              {idx === 2 && (
                <div className="absolute top-4 right-4">
                  <span className="badge" style={{ background: `${c}20`, color: c }}>MAIS COMPLETO</span>
                </div>
              )}
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#428475" }}>
                  Plano
                </div>
                <h2 className="font-display text-4xl font-bold" style={{ color: c }}>{plan.name.toUpperCase()}</h2>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-mono text-3xl font-bold" style={{ color: "#FFF4E1" }}>
                  {fmt(plan.price)}
                </span>
                <span className="text-sm" style={{ color: "#89D7B7" }}>/mês</span>
              </div>

              <p className="text-sm mb-4" style={{ color: "#89D7B7" }}>{plan.description}</p>

              <div className="p-3 rounded-lg mb-4" style={{ background: bg }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#428475" }}>Benefícios Inclusos</div>
                <ul className="space-y-2">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#FFF4E1" }}>
                      <span style={{ color: c, flexShrink: 0 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid rgba(66,132,117,0.15)" }}>
                <div>
                  <div className="font-mono text-xl font-bold" style={{ color: c }}>{studentCount}</div>
                  <div className="text-xs" style={{ color: "#428475" }}>alunos ativos</div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "#428475" }}>Vigência</div>
                  <div className="text-xs font-mono" style={{ color: "#89D7B7" }}>
                    {new Date(plan.startDate).toLocaleDateString("pt-BR")} →{" "}
                    {new Date(plan.endDate).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              {canEdit && (
                <button
                  className="titan-btn-secondary w-full mt-3 text-sm"
                  onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                >
                  Editar Plano
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan comparison table */}
      <div className="titan-card">
        <h2 className="font-display text-2xl font-bold mb-6" style={{ color: "#FFF4E1" }}>COMPARATIVO DE PLANOS</h2>
        <div className="overflow-x-auto">
          <table className="titan-table">
            <thead>
              <tr>
                <th>Recurso</th>
                {plans.map(p => <th key={p.id} style={{ color: p.color, textAlign: "center" }}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Sala de Musculação", true, true, true],
                ["Todos os Equipamentos", true, true, true],
                ["Orientação Inicial", true, true, true],
                ["Aulas de Zumba", false, true, true],
                ["Aulas de Box", false, true, true],
                ["Spinning/Bicicleta", false, true, true],
                ["Camisa Oficial", false, false, true],
                ["Avaliação Física Mensal", false, false, true],
                ["Consultoria Nutricional", false, false, true],
              ].map(([feature, ...vals]) => (
                <tr key={feature as string}>
                  <td className="text-sm" style={{ color: "#FFF4E1" }}>{feature as string}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="text-center">
                      <span style={{ fontSize: 18, color: v ? "#89D7B7" : "#428475" }}>
                        {v ? "✓" : "✗"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="font-semibold text-sm" style={{ color: "#FFF4E1" }}>Mensalidade</td>
                {plans.map(p => (
                  <td key={p.id} className="text-center font-mono font-bold" style={{ color: p.color }}>
                    {fmt(p.price)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <PlanModal plan={editingPlan} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function PlanModal({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const [form, setForm] = useState({
    name: plan?.name || "",
    price: plan?.price?.toString() || "",
    description: plan?.description || "",
    benefits: plan?.benefits?.join("\n") || "",
    startDate: plan?.startDate || "",
    endDate: plan?.endDate || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-6" style={{ background: "#1F3D36", borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>{plan ? "EDITAR PLANO" : "NOVO PLANO"}</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Nome do Plano</label>
            <input className="titan-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Preço Mensal (R$)</label>
            <input className="titan-input font-mono" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Descrição</label>
            <textarea className="titan-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Benefícios (um por linha)</label>
            <textarea className="titan-input" rows={5} value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Data Inicial</label>
              <input className="titan-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Data Final</label>
              <input className="titan-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">{plan ? "SALVAR" : "CRIAR PLANO"}</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
