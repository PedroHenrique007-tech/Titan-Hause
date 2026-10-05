import { STUDENTS, PLANS, PROFESSIONALS, PAYMENTS, CLASSES, MODALITIES } from "../data";
import type { SystemUser } from "../types";

interface DashboardProps {
  user: SystemUser;
  onNavigate: (page: any, extra?: any) => void;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pago: "status-pago",
    pendente: "status-pendente",
    atrasado: "status-atrasado",
    adiantado: "status-adiantado",
  };
  const labels: Record<string, string> = {
    pago: "PAGO",
    pendente: "PENDENTE",
    atrasado: "ATRASADO",
    adiantado: "ADIANTADO",
  };
  return <span className={`badge ${map[status] || ""}`}>{labels[status] || status}</span>;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const atrasados = STUDENTS.filter(s => s.paymentStatus === "atrasado");
  const pendentes = STUDENTS.filter(s => s.paymentStatus === "pendente");
  const adiantados = STUDENTS.filter(s => s.paymentStatus === "adiantado");
  const totalOwed = STUDENTS.reduce((acc, s) => acc + s.totalOwed, 0);

  const today = new Date();
  const upcomingClasses = CLASSES.filter(c => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const todayName = days[today.getDay()];
    const tomorrowName = days[(today.getDay() + 1) % 7];
    return c.dayOfWeek === todayName || c.dayOfWeek === tomorrowName;
  }).slice(0, 5);

  if (user.role === "professor") {
    return <ProfessorDashboard user={user} onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>
          DASHBOARD
        </h1>
        <p className="text-sm mt-1" style={{ color: "#89D7B7" }}>
          Visão geral do sistema · {today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Alunos" value={STUDENTS.length.toString()} sub={`${STUDENTS.filter(s => s.active).length} ativos`} color="#89D7B7" icon="🎯" />
        <StatCard label="Pagamentos Atrasados" value={atrasados.length.toString()} sub={`${fmt(totalOwed)} devidos`} color="#fca5a5" icon="⚠️" alert />
        <StatCard label="Pendentes" value={pendentes.length.toString()} sub="aguardando pagamento" color="#fde68a" icon="⏳" />
        <StatCard label="Adiantados" value={adiantados.length.toString()} sub="crédito no sistema" color="#93c5fd" icon="✅" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Atrasados */}
        <div className="lg:col-span-2 titan-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>
              ⚠️ PAGAMENTOS EM ATRASO
            </h2>
            <button onClick={() => onNavigate("students")} className="text-xs" style={{ color: "#89D7B7" }}>
              Ver todos →
            </button>
          </div>
          {atrasados.length === 0 ? (
            <div className="text-sm py-8 text-center" style={{ color: "#428475" }}>Nenhum pagamento em atraso</div>
          ) : (
            <div className="space-y-2">
              {atrasados.map(s => {
                const plan = PLANS.find(p => p.id === s.planId);
                const daysLate = Math.floor((today.getTime() - new Date(s.dueDate).getTime()) / 86400000);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                    style={{ background: "rgba(127,29,29,0.15)", border: "1px solid rgba(252,165,165,0.2)" }}
                    onClick={() => onNavigate("student-profile", s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "#428475", color: "#1A312C" }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#FFF4E1" }}>{s.name}</div>
                        <div className="text-xs" style={{ color: "#fca5a5" }}>
                          {daysLate > 0 ? `${daysLate} dias em atraso` : "Vence hoje"} · {plan?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold" style={{ color: "#fca5a5" }}>{fmt(s.totalOwed)}</div>
                      <StatusBadge status={s.paymentStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pendentes */}
          {pendentes.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(66,132,117,0.15)" }}>
              <div className="font-display text-base font-bold mb-3" style={{ color: "#fde68a" }}>⏳ PENDENTES</div>
              <div className="space-y-2">
                {pendentes.map(s => {
                  const plan = PLANS.find(p => p.id === s.planId);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                      style={{ background: "rgba(113,63,18,0.15)", border: "1px solid rgba(253,230,138,0.15)" }}
                      onClick={() => onNavigate("student-profile", s.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "#428475", color: "#1A312C" }}>
                          {s.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#FFF4E1" }}>{s.name}</div>
                          <div className="text-xs" style={{ color: "#fde68a" }}>Vence: {new Date(s.dueDate).toLocaleDateString("pt-BR")} · {plan?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-semibold" style={{ color: "#fde68a" }}>{fmt(s.totalOwed)}</div>
                        <StatusBadge status={s.paymentStatus} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Aulas de hoje/amanhã */}
          <div className="titan-card">
            <h2 className="font-display text-base font-bold mb-3" style={{ color: "#FFF4E1" }}>📅 PRÓXIMAS AULAS</h2>
            <div className="space-y-2">
              {upcomingClasses.length === 0 ? (
                <div className="text-xs" style={{ color: "#428475" }}>Nenhuma aula programada</div>
              ) : upcomingClasses.map(c => {
                const mod = MODALITIES.find(m => m.id === c.modalityId);
                const spots = c.capacity - c.enrolled.length;
                return (
                  <div key={c.id} className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid rgba(66,132,117,0.1)" }}>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "#FFF4E1" }}>
                        {mod?.icon} {mod?.name}
                      </div>
                      <div className="text-xs" style={{ color: "#89D7B7" }}>
                        {c.dayOfWeek} {c.time} · {c.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold" style={{ color: spots < 5 ? "#fca5a5" : "#89D7B7" }}>
                        {spots} vagas
                      </div>
                      <div className="text-xs" style={{ color: "#428475" }}>{c.enrolled.length}/{c.capacity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Planos */}
          <div className="titan-card">
            <h2 className="font-display text-base font-bold mb-3" style={{ color: "#FFF4E1" }}>📊 ALUNOS POR PLANO</h2>
            {PLANS.map(plan => {
              const count = STUDENTS.filter(s => s.planId === plan.id).length;
              const pct = Math.round((count / STUDENTS.length) * 100);
              return (
                <div key={plan.id} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#FFF4E1" }}>{plan.name}</span>
                    <span style={{ color: "#89D7B7" }}>{count} alunos</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(66,132,117,0.2)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: plan.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alunos adiantados */}
          {adiantados.length > 0 && (
            <div className="titan-card">
              <h2 className="font-display text-base font-bold mb-3" style={{ color: "#93c5fd" }}>✅ ADIANTADOS</h2>
              <div className="space-y-2">
                {adiantados.map(s => (
                  <div key={s.id} className="flex items-center justify-between"
                    onClick={() => onNavigate("student-profile", s.id)}
                    style={{ cursor: "pointer" }}>
                    <div className="text-xs" style={{ color: "#FFF4E1" }}>{s.name}</div>
                    <div className="font-mono text-xs" style={{ color: "#93c5fd" }}>+{fmt(s.advanceBalance)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent students table */}
      <div className="titan-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>ALUNOS RECENTES</h2>
          <button onClick={() => onNavigate("students")} className="titan-btn-secondary text-sm py-1 px-3">
            Ver Todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="titan-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Plano</th>
                <th>Vencimento</th>
                <th>Valor Devido</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.slice(0, 6).map(s => {
                const plan = PLANS.find(p => p.id === s.planId);
                return (
                  <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("student-profile", s.id)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "#428475", color: "#1A312C" }}>
                          {s.name[0]}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#89D7B7" }}>{plan?.name}</td>
                    <td className="font-mono text-xs">{new Date(s.dueDate).toLocaleDateString("pt-BR")}</td>
                    <td className="font-mono">{s.totalOwed > 0 ? fmt(s.totalOwed) : "—"}</td>
                    <td><StatusBadge status={s.paymentStatus} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, alert }: {
  label: string; value: string; sub: string; color: string; icon: string; alert?: boolean;
}) {
  return (
    <div className="stat-card" style={alert ? { borderColor: "rgba(252,165,165,0.3)" } : {}}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#428475" }}>{label}</div>
          <div className="font-display text-4xl font-bold" style={{ color }}>{value}</div>
          <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>{sub}</div>
        </div>
        <span style={{ fontSize: 24, opacity: 0.6 }}>{icon}</span>
      </div>
    </div>
  );
}

function ProfessorDashboard({ user, onNavigate }: { user: SystemUser; onNavigate: (page: any, extra?: any) => void }) {
  const myStudents = STUDENTS.filter(s => s.trainerId === "p1");
  const atrasados = myStudents.filter(s => s.paymentStatus === "atrasado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>
          DASHBOARD · PROFESSOR
        </h1>
        <p className="text-sm mt-1" style={{ color: "#89D7B7" }}>Bem-vindo de volta, {user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Meus Alunos" value={myStudents.length.toString()} sub="sob orientação" color="#89D7B7" icon="🎯" />
        <StatCard label="Atrasados" value={atrasados.length.toString()} sub="alertas de pagamento" color="#fca5a5" icon="⚠️" alert />
        <StatCard label="Treinos Ativos" value="3" sub="planos em andamento" color="#93c5fd" icon="💪" />
      </div>

      <div className="titan-card">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "#FFF4E1" }}>MEUS ALUNOS</h2>
        <div className="overflow-x-auto">
          <table className="titan-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Plano</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(s => {
                const plan = PLANS.find(p => p.id === s.planId);
                return (
                  <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("student-profile", s.id)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "#428475", color: "#1A312C" }}>
                          {s.name[0]}
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td style={{ color: "#89D7B7" }}>{plan?.name}</td>
                    <td><span className={`badge ${s.paymentStatus === "atrasado" ? "status-atrasado" : s.paymentStatus === "pendente" ? "status-pendente" : "status-pago"}`}>{s.paymentStatus.toUpperCase()}</span></td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); onNavigate("workouts"); }} className="text-xs" style={{ color: "#89D7B7" }}>Ver Treino →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
