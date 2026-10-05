import { useState } from "react";
import { STUDENTS, PLANS, PAYMENTS as initialPayments, PROFESSIONALS, WORKOUT_PLANS, CLASSES, MODALITIES } from "../data";
import type { SystemUser, Payment } from "../types";

interface StudentProfileProps {
  studentId: string;
  user: SystemUser;
  onBack: () => void;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_CLASSES: Record<string, string> = {
  pago: "status-pago",
  pendente: "status-pendente",
  atrasado: "status-atrasado",
  adiantado: "status-adiantado",
};

const DAY_WORKOUT: Record<string, string> = {
  Segunda: "A",
  Terça: "B",
  Quarta: "C",
  Quinta: "A",
  Sexta: "B",
  Sábado: "—",
  Domingo: "—",
};

export default function StudentProfile({ studentId, user, onBack }: StudentProfileProps) {
  const student = STUDENTS.find(s => s.id === studentId);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [tab, setTab] = useState<"overview" | "workout" | "classes" | "payments">("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [videoExercise, setVideoExercise] = useState<any>(null);
  const [workoutWeights, setWorkoutWeights] = useState<Record<string, number>>({});
  const [activeWorkout, setActiveWorkout] = useState<"A" | "B" | "C">("A");

  if (!student) {
    return (
      <div className="text-center py-20" style={{ color: "#89D7B7" }}>
        <div className="text-4xl mb-4">🔍</div>
        <div>Aluno não encontrado.</div>
        <button className="titan-btn-secondary mt-4" onClick={onBack}>← Voltar</button>
      </div>
    );
  }

  const plan = PLANS.find(p => p.id === student.planId);
  const trainer = PROFESSIONALS.find(p => p.id === student.trainerId);
  const workoutPlan = WORKOUT_PLANS.find(w => w.studentId === studentId) || WORKOUT_PLANS[0];
  const studentPayments = payments.filter(p => p.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
  const studentClasses = CLASSES.filter(c => c.enrolled.includes(studentId));
  const canEdit = user.role === "master" || user.role === "atendente" || user.role === "professor";

  const planEndDate = new Date(student.planEndDate);
  const today = new Date();
  const daysLeft = Math.ceil((planEndDate.getTime() - today.getTime()) / 86400000);

  const currentWorkoutDay = workoutPlan.days.find(d => d.letter === activeWorkout);

  const handleAddPayment = (data: { amount: number; type: "payment" | "advance"; reference: string; note: string }) => {
    const newPayment: Payment = {
      id: `pay${Date.now()}`,
      studentId,
      amount: data.amount,
      date: new Date().toISOString().split("T")[0],
      type: data.type,
      reference: data.reference,
      note: data.note,
    };
    setPayments(prev => [newPayment, ...prev]);
    setShowPaymentModal(false);
  };

  const tabs = [
    { key: "overview", label: "Visão Geral" },
    { key: "workout", label: "Treino" },
    { key: "classes", label: "Aulas" },
    { key: "payments", label: "Pagamentos" },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="titan-btn-secondary py-1.5 px-3 text-sm">← Voltar</button>
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "#FFF4E1" }}>{student.name.toUpperCase()}</h1>
          <p className="text-sm" style={{ color: "#89D7B7" }}>Perfil do Aluno</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="titan-card">
        <div className="flex flex-wrap gap-6 items-start">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #428475, #89D7B7)", color: "#1A312C" }}>
            {student.name[0]}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info label="Idade" value={`${student.age} anos`} />
            <Info label="CPF" value={student.cpf} mono />
            <Info label="Sexo" value={student.sex === "M" ? "Masculino" : student.sex === "F" ? "Feminino" : "Outro"} />
            <Info label="Telefone" value={student.phone} />
            <Info label="Email" value={student.email} />
            <Info label="Professor" value={trainer?.name || "—"} />
            <Info label="Status" value={
              <span className={`badge ${STATUS_CLASSES[student.paymentStatus]}`}>{student.paymentStatus.toUpperCase()}</span>
            } />
            <Info label="Plano" value={
              <span className="text-sm font-semibold" style={{ color: "#89D7B7" }}>{plan?.name}</span>
            } />
          </div>
        </div>
      </div>

      {/* Plan + Financial highlight */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="titan-card col-span-2" style={{ borderColor: plan?.color ? `${plan.color}40` : undefined }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#428475" }}>Plano Contratado</div>
              <h2 className="font-display text-3xl font-bold" style={{ color: plan?.color || "#89D7B7" }}>
                PLANO {plan?.name.toUpperCase()}
              </h2>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-bold" style={{ color: "#FFF4E1" }}>{fmt(plan?.price || 0)}</div>
              <div className="text-xs" style={{ color: "#89D7B7" }}>por mês</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <FinCard label="Valor Pago" value={fmt(student.totalPaid)} color="#86efac" />
            <FinCard label="Valor Devido" value={student.totalOwed > 0 ? fmt(student.totalOwed) : "—"} color={student.totalOwed > 0 ? "#fca5a5" : "#89D7B7"} />
            <FinCard label="Adiantado" value={student.advanceBalance > 0 ? fmt(student.advanceBalance) : "—"} color="#93c5fd" />
            <FinCard label="Próx. Pgto" value={new Date(student.nextPaymentDate).toLocaleDateString("pt-BR")} color="#fde68a" small />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4" style={{ borderTop: "1px solid rgba(66,132,117,0.15)" }}>
            <div>
              <div className="text-xs" style={{ color: "#428475" }}>Início do Plano</div>
              <div className="font-mono text-sm" style={{ color: "#FFF4E1" }}>{new Date(student.planStartDate).toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#428475" }}>Vencimento</div>
              <div className="font-mono text-sm" style={{ color: "#FFF4E1" }}>{new Date(student.planEndDate).toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#428475" }}>Tempo Restante</div>
              <div className="font-mono text-sm font-semibold" style={{ color: daysLeft > 30 ? "#86efac" : daysLeft > 0 ? "#fde68a" : "#fca5a5" }}>
                {daysLeft > 0 ? `${daysLeft} dias` : "Expirado"}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#428475" }}>Data de Vencimento Pgto</div>
              <div className="font-mono text-sm" style={{ color: "#FFF4E1" }}>{new Date(student.dueDate).toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        <div className="titan-card">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#428475" }}>Benefícios do Plano</div>
          <ul className="space-y-2">
            {plan?.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#FFF4E1" }}>
                <span style={{ color: "#89D7B7", flexShrink: 0 }}>✓</span>
                {b}
              </li>
            ))}
          </ul>
          {canEdit && (
            <button className="titan-btn-primary w-full mt-4 text-sm" onClick={() => setShowPaymentModal(true)}>
              + REGISTRAR PAGAMENTO
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className="font-display text-sm font-bold px-4 py-2 transition-all"
            style={{
              color: tab === t.key ? "#89D7B7" : "#428475",
              borderBottom: tab === t.key ? "2px solid #89D7B7" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="titan-card">
            <div className="font-display text-lg font-bold mb-3" style={{ color: "#FFF4E1" }}>CRONOGRAMA SEMANAL</div>
            <div className="space-y-2">
              {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map(day => {
                const w = DAY_WORKOUT[day];
                const wd = workoutPlan.days.find(d => d.letter === w);
                return (
                  <div key={day} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: "rgba(66,132,117,0.1)" }}>
                    <span className="text-sm" style={{ color: "#FFF4E1" }}>{day}</span>
                    <div className="text-right">
                      <span className="font-display font-bold text-lg" style={{ color: "#89D7B7" }}>Treino {w}</span>
                      {wd && <div className="text-xs" style={{ color: "#428475" }}>{wd.focus}</div>}
                    </div>
                  </div>
                );
              })}
              {["Sábado", "Domingo"].map(day => (
                <div key={day} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "rgba(66,132,117,0.05)" }}>
                  <span className="text-sm" style={{ color: "#428475" }}>{day}</span>
                  <span className="text-sm" style={{ color: "#428475" }}>Descanso</span>
                </div>
              ))}
            </div>
          </div>
          <div className="titan-card">
            <div className="font-display text-lg font-bold mb-3" style={{ color: "#FFF4E1" }}>AULAS MATRICULADAS</div>
            <div className="space-y-2">
              {studentClasses.length === 0 ? (
                <div className="text-sm" style={{ color: "#428475" }}>Nenhuma aula matriculada.</div>
              ) : studentClasses.map(c => {
                const mod = MODALITIES.find(m => m.id === c.modalityId);
                return (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: "rgba(66,132,117,0.1)" }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#FFF4E1" }}>{mod?.icon} {mod?.name}</div>
                      <div className="text-xs" style={{ color: "#89D7B7" }}>{c.dayOfWeek} · {c.time} · {c.location}</div>
                    </div>
                    <div className="text-xs font-mono" style={{ color: "#428475" }}>{c.duration}min</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "workout" && workoutPlan && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs mb-1" style={{ color: "#428475" }}>Professor: {trainer?.name} · Modalidade: {workoutPlan.modality} · Categoria: {workoutPlan.category}</div>
              <div className="text-xs" style={{ color: "#428475" }}>Última atualização: {new Date(workoutPlan.updatedAt).toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
          {/* Workout selector */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {workoutPlan.days.map(d => (
              <button
                key={d.letter}
                onClick={() => setActiveWorkout(d.letter)}
                className="workout-day-card flex-1 min-w-32 text-left"
                style={activeWorkout === d.letter ? { borderColor: "#89D7B7", background: "rgba(137,215,183,0.08)" } : {}}
              >
                <div className="font-display text-2xl font-bold" style={{ color: activeWorkout === d.letter ? "#89D7B7" : "#428475" }}>
                  TREINO {d.letter}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#89D7B7" }}>{d.focus}</div>
              </button>
            ))}
          </div>

          {/* Weekly schedule */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {workoutPlan.schedule.map(s => (
              <div key={s.day} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>
                {s.day} → <span style={{ color: "#FFF4E1" }}>Treino {s.workout}</span>
              </div>
            ))}
          </div>

          {/* Exercises */}
          {currentWorkoutDay && (
            <div className="space-y-3">
              <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>
                {currentWorkoutDay.label} — {currentWorkoutDay.focus}
              </div>
              {currentWorkoutDay.exercises.map((ex, idx) => {
                const currentWeight = workoutWeights[ex.id] ?? ex.defaultWeight;
                return (
                  <div key={ex.id} className="titan-card" style={{ padding: "16px 20px" }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="font-display text-3xl font-bold w-10 text-center" style={{ color: "#428475" }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-display text-lg font-bold" style={{ color: "#FFF4E1" }}>{ex.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#89D7B7" }}>
                            📍 {ex.location} · {ex.machine}
                          </div>
                          <div className="flex gap-3 mt-2 flex-wrap">
                            <Chip label="Séries" value={`${ex.sets}x`} />
                            <Chip label="Repetições" value={`${ex.reps} reps`} />
                            <Chip label="Músculos" value={ex.muscles.join(", ")} small />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-xs mb-1 text-center" style={{ color: "#428475" }}>Carga</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setWorkoutWeights(w => ({ ...w, [ex.id]: Math.max(0, currentWeight - (ex.unit === "kg" ? 2.5 : 1)) }))}
                              className="w-7 h-7 rounded-lg font-bold transition-all"
                              style={{ background: "rgba(66,132,117,0.3)", color: "#89D7B7" }}
                            >−</button>
                            <div className="text-center w-20">
                              <div className="font-mono text-xl font-bold" style={{ color: "#FFF4E1" }}>{currentWeight}</div>
                              <div className="text-xs" style={{ color: "#428475" }}>{ex.unit}</div>
                            </div>
                            <button
                              onClick={() => setWorkoutWeights(w => ({ ...w, [ex.id]: currentWeight + (ex.unit === "kg" ? 2.5 : 1) }))}
                              className="w-7 h-7 rounded-lg font-bold transition-all"
                              style={{ background: "rgba(66,132,117,0.3)", color: "#89D7B7" }}
                            >+</button>
                          </div>
                        </div>
                        <button
                          onClick={() => setVideoExercise(ex)}
                          className="titan-btn-secondary py-2 px-3 text-xs"
                        >
                          ▶ Vídeo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "classes" && (
        <div>
          <div className="font-display text-xl font-bold mb-4" style={{ color: "#FFF4E1" }}>AULAS DO ALUNO</div>
          {studentClasses.length === 0 ? (
            <div className="titan-card text-center py-12 text-sm" style={{ color: "#428475" }}>
              Nenhuma aula matriculada.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {studentClasses.map(c => {
                const mod = MODALITIES.find(m => m.id === c.modalityId);
                const inst = PROFESSIONALS.find(p => p.id === c.instructorId);
                return (
                  <div key={c.id} className="titan-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>
                          {mod?.icon} {mod?.name}
                        </div>
                        <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>
                          {c.dayOfWeek} às {c.time} · {c.duration}min · {c.location}
                        </div>
                        <div className="text-xs mt-1" style={{ color: "#428475" }}>Instrutor: {inst?.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold" style={{ color: "#89D7B7" }}>
                          {c.enrolled.length}/{c.capacity}
                        </div>
                        <div className="text-xs" style={{ color: "#428475" }}>vagas</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "payments" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>HISTÓRICO DE PAGAMENTOS</div>
            {canEdit && (
              <button className="titan-btn-primary" onClick={() => setShowPaymentModal(true)}>
                + REGISTRAR PAGAMENTO
              </button>
            )}
          </div>
          <div className="titan-card p-0 overflow-hidden">
            <table className="titan-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Data</th>
                  <th>Referência</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {studentPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ paddingLeft: 20 }} className="font-mono text-xs">{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                    <td className="text-sm">{p.reference}</td>
                    <td>
                      <span className={`badge ${p.type === "advance" ? "status-adiantado" : "status-pago"}`}>
                        {p.type === "advance" ? "ADIANTAMENTO" : "PAGAMENTO"}
                      </span>
                    </td>
                    <td className="font-mono font-semibold" style={{ color: "#86efac" }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {studentPayments.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: "#428475" }}>Nenhum pagamento registrado.</div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          studentName={student.name}
          planPrice={plan?.price || 0}
          onSave={handleAddPayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Video Modal */}
      {videoExercise && (
        <VideoModal exercise={videoExercise} onClose={() => setVideoExercise(null)} />
      )}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#428475" }}>{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? "font-mono" : ""}`} style={{ color: "#FFF4E1" }}>{value}</div>
    </div>
  );
}

function FinCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(26,49,44,0.6)" }}>
      <div className="text-xs mb-1" style={{ color: "#428475" }}>{label}</div>
      <div className={`font-mono font-bold ${small ? "text-sm" : "text-lg"}`} style={{ color }}>{value}</div>
    </div>
  );
}

function Chip({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className={`px-2 py-1 rounded-md ${small ? "text-xs" : "text-xs"}`}
      style={{ background: "rgba(66,132,117,0.15)", color: "#89D7B7" }}>
      <span style={{ color: "#428475" }}>{label}: </span>{value}
    </div>
  );
}

function PaymentModal({ studentName, planPrice, onSave, onClose }: {
  studentName: string; planPrice: number;
  onSave: (data: any) => void; onClose: () => void;
}) {
  const [amount, setAmount] = useState(planPrice.toString());
  const [type, setType] = useState<"payment" | "advance">("payment");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ amount: parseFloat(amount), type, reference, note });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>REGISTRAR PAGAMENTO</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(137,215,183,0.08)" }}>
            <span style={{ color: "#89D7B7" }}>Aluno: </span>
            <span style={{ color: "#FFF4E1" }}>{studentName}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Tipo</label>
            <select className="titan-select" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="payment">Pagamento Regular</option>
              <option value="advance">Adiantamento</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Valor (R$)</label>
            <input className="titan-input font-mono" type="number" min="0" step="0.01" required
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Referência</label>
            <input className="titan-input" placeholder="Ex: Out/2026" required value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Observação</label>
            <input className="titan-input" placeholder="Opcional" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">CONFIRMAR</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VideoModal({ exercise, onClose }: { exercise: any; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>{exercise.name}</h2>
            <div className="text-xs" style={{ color: "#89D7B7" }}>{exercise.location} · {exercise.machine}</div>
          </div>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        {/* Fake video player */}
        <div
          className="relative cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0a1a14 0%, #1A312C 50%, #243F38 100%)", aspectRatio: "16/9" }}
          onClick={() => setPlaying(!playing)}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {!playing ? (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "rgba(137,215,183,0.2)", border: "2px solid #89D7B7" }}>
                  <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
                </div>
                <div className="font-display text-lg font-bold" style={{ color: "#FFF4E1" }}>
                  {exercise.name}
                </div>
                <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>Clique para reproduzir</div>
              </>
            ) : (
              <>
                {/* Animated "playing" indicator */}
                <div className="flex gap-1 items-end mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-2 rounded-sm" style={{
                      background: "#89D7B7",
                      height: `${20 + Math.sin(i * 1.3) * 15}px`,
                      animation: `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                </div>
                <div className="font-display text-2xl font-bold" style={{ color: "#89D7B7" }}>
                  EM REPRODUÇÃO
                </div>
                <div className="text-sm mt-1" style={{ color: "#FFF4E1" }}>Tutorial: {exercise.name}</div>
                <div className="text-xs mt-2 opacity-60" style={{ color: "#89D7B7" }}>Clique para pausar</div>
              </>
            )}
          </div>
          {/* Progress bar fake */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="h-1 rounded-full" style={{ background: "rgba(66,132,117,0.3)" }}>
              <div className="h-1 rounded-full transition-all duration-1000" style={{ width: playing ? "35%" : "0%", background: "#89D7B7" }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-xs" style={{ color: "#89D7B7" }}>0:00</span>
              <span className="font-mono text-xs" style={{ color: "#428475" }}>2:34</span>
            </div>
          </div>
        </div>
        {/* Exercise info */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center px-3 py-2 rounded-lg" style={{ background: "rgba(66,132,117,0.15)" }}>
              <div className="font-mono text-xl font-bold" style={{ color: "#89D7B7" }}>{exercise.sets}x</div>
              <div className="text-xs" style={{ color: "#428475" }}>Séries</div>
            </div>
            <div className="text-center px-3 py-2 rounded-lg" style={{ background: "rgba(66,132,117,0.15)" }}>
              <div className="font-mono text-xl font-bold" style={{ color: "#89D7B7" }}>{exercise.reps}</div>
              <div className="text-xs" style={{ color: "#428475" }}>Repetições</div>
            </div>
            <div className="text-center px-3 py-2 rounded-lg" style={{ background: "rgba(66,132,117,0.15)" }}>
              <div className="font-mono text-xl font-bold" style={{ color: "#89D7B7" }}>{exercise.defaultWeight}</div>
              <div className="text-xs" style={{ color: "#428475" }}>{exercise.unit}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#89D7B7" }}>Dicas de Execução</div>
            <ul className="space-y-1.5">
              {exercise.tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#FFF4E1" }}>
                  <span style={{ color: "#89D7B7", flexShrink: 0 }}>•</span>{tip}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#89D7B7" }}>Músculos Trabalhados</div>
            <div className="flex flex-wrap gap-1">
              {exercise.muscles.map((m: string) => (
                <span key={m} className="badge" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
