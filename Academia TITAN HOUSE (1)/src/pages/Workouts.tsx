import { useState } from "react";
import { WORKOUT_PLANS, STUDENTS, PROFESSIONALS, PLANS } from "../data";
import type { SystemUser, WorkoutPlan } from "../types";

interface WorkoutsProps {
  user: SystemUser;
}

export default function Workouts({ user }: WorkoutsProps) {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(WORKOUT_PLANS[0]);
  const [activeWorkout, setActiveWorkout] = useState<"A" | "B" | "C">("A");
  const [workoutWeights, setWorkoutWeights] = useState<Record<string, number>>({});
  const [videoExercise, setVideoExercise] = useState<any>(null);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  const canEdit = user.role === "master" || user.role === "professor";

  const currentDay = selectedPlan?.days.find(d => d.letter === activeWorkout);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>TREINOS</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>Planos de treino e cronogramas</p>
        </div>
        {canEdit && (
          <button className="titan-btn-primary" onClick={() => setShowNewPlanModal(true)}>
            + NOVO PLANO
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Plan list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#428475" }}>Planos de Treino</div>
          {WORKOUT_PLANS.map(wp => {
            const student = STUDENTS.find(s => s.id === wp.studentId);
            const trainer = PROFESSIONALS.find(p => p.id === wp.trainerId);
            const isSelected = selectedPlan?.id === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => { setSelectedPlan(wp); setActiveWorkout("A"); }}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? "rgba(137,215,183,0.1)" : "rgba(66,132,117,0.08)",
                  border: `1px solid ${isSelected ? "#89D7B7" : "rgba(66,132,117,0.2)"}`,
                }}
              >
                <div className="font-semibold text-sm" style={{ color: "#FFF4E1" }}>{student?.name}</div>
                <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>Prof: {trainer?.name}</div>
                <div className="flex gap-2 mt-2">
                  <span className="badge" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>{wp.modality}</span>
                  <span className="badge" style={{ background: "rgba(66,132,117,0.15)", color: "#428475" }}>{wp.category}</span>
                </div>
                <div className="text-xs mt-2" style={{ color: "#428475" }}>
                  Atualizado: {new Date(wp.updatedAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Workout detail */}
        {selectedPlan && (
          <div className="lg:col-span-3 space-y-4">
            {/* Plan header */}
            {(() => {
              const student = STUDENTS.find(s => s.id === selectedPlan.studentId);
              const trainer = PROFESSIONALS.find(p => p.id === selectedPlan.trainerId);
              const plan = PLANS.find(p => p.id === student?.planId);
              return (
                <div className="titan-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>
                        {student?.name}
                      </div>
                      <div className="text-sm mt-1" style={{ color: "#89D7B7" }}>
                        Prof: {trainer?.name} · Plano: {plan?.name} · Modalidade: {selectedPlan.modality} · Categoria: {selectedPlan.category}
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: "#428475" }}>
                      Criado: {new Date(selectedPlan.createdAt).toLocaleDateString("pt-BR")}<br />
                      Atualizado: {new Date(selectedPlan.updatedAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  {/* Weekly schedule */}
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#428475" }}>Cronograma Semanal</div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPlan.schedule.map(s => (
                        <div key={s.day} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>
                          {s.day} → <span style={{ color: "#FFF4E1" }}>Treino {s.workout}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Workout tabs */}
            <div className="flex gap-3">
              {selectedPlan.days.map(d => (
                <button
                  key={d.letter}
                  onClick={() => setActiveWorkout(d.letter)}
                  className="workout-day-card flex-1"
                  style={activeWorkout === d.letter ? { borderColor: "#89D7B7", background: "rgba(137,215,183,0.08)" } : {}}
                >
                  <div className="font-display text-2xl font-bold" style={{ color: activeWorkout === d.letter ? "#89D7B7" : "#428475" }}>
                    TREINO {d.letter}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#89D7B7" }}>{d.focus}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#428475" }}>{d.exercises.length} exercícios</div>
                </button>
              ))}
            </div>

            {/* Exercises */}
            {currentDay && (
              <div className="space-y-3">
                <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>
                  {currentDay.label} — {currentDay.focus}
                </div>
                {currentDay.exercises.map((ex, idx) => {
                  const currentWeight = workoutWeights[ex.id] ?? ex.defaultWeight;
                  return (
                    <div key={ex.id} className="titan-card" style={{ padding: "16px 20px" }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="font-display text-4xl font-bold w-12 text-center flex-shrink-0"
                            style={{ color: "rgba(66,132,117,0.5)", lineHeight: 1 }}>
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div className="flex-1">
                            <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>{ex.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs font-mono" style={{ color: "#428475" }}>📍 {ex.location}</span>
                              <span className="text-xs" style={{ color: "#428475" }}>·</span>
                              <span className="text-xs" style={{ color: "#89D7B7" }}>{ex.machine}</span>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span className="badge" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>
                                {ex.sets} séries
                              </span>
                              <span className="badge" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>
                                {ex.reps} reps
                              </span>
                              {ex.muscles.slice(0, 2).map(m => (
                                <span key={m} className="badge" style={{ background: "rgba(66,132,117,0.1)", color: "#428475" }}>{m}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs mb-1" style={{ color: "#428475" }}>Carga</div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setWorkoutWeights(w => ({ ...w, [ex.id]: Math.max(0, currentWeight - 2.5) }))}
                                className="w-7 h-7 rounded-lg font-bold"
                                style={{ background: "rgba(66,132,117,0.3)", color: "#89D7B7" }}
                              >−</button>
                              <div className="text-center px-2">
                                <div className="font-mono text-lg font-bold" style={{ color: "#FFF4E1" }}>{currentWeight}</div>
                                <div className="text-xs" style={{ color: "#428475" }}>{ex.unit}</div>
                              </div>
                              <button
                                onClick={() => setWorkoutWeights(w => ({ ...w, [ex.id]: currentWeight + 2.5 }))}
                                className="w-7 h-7 rounded-lg font-bold"
                                style={{ background: "rgba(66,132,117,0.3)", color: "#89D7B7" }}
                              >+</button>
                            </div>
                          </div>
                          <button
                            onClick={() => setVideoExercise(ex)}
                            className="titan-btn-secondary py-1.5 px-3 text-xs"
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
      </div>

      {/* Video modal inline */}
      {videoExercise && (
        <div className="modal-overlay" onClick={() => setVideoExercise(null)}>
          <div className="modal-box max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>{videoExercise.name}</h2>
                <div className="text-xs" style={{ color: "#89D7B7" }}>{videoExercise.location} · {videoExercise.machine}</div>
              </div>
              <button onClick={() => setVideoExercise(null)} style={{ color: "#428475", fontSize: 22 }}>✕</button>
            </div>
            <div
              className="relative"
              style={{ background: "linear-gradient(135deg, #0a1a14 0%, #1A312C 50%, #243F38 100%)", aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "rgba(137,215,183,0.2)", border: "2px solid #89D7B7" }}>
                  <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
                </div>
                <div className="font-display text-xl font-bold" style={{ color: "#FFF4E1" }}>{videoExercise.name}</div>
                <div className="text-sm mt-1" style={{ color: "#89D7B7" }}>Tutorial em vídeo · 2:34</div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#89D7B7" }}>Dicas</div>
                <ul className="space-y-1">
                  {videoExercise.tips.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#FFF4E1" }}>
                      <span style={{ color: "#89D7B7" }}>•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-1">
                {videoExercise.muscles.map((m: string) => (
                  <span key={m} className="badge" style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewPlanModal && (
        <NewPlanModal onClose={() => setShowNewPlanModal(false)} />
      )}
    </div>
  );
}

function NewPlanModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    studentId: STUDENTS[0].id,
    trainerId: PROFESSIONALS[0].id,
    modality: "Musculação",
    category: "Hipertrofia",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>NOVO PLANO DE TREINO</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Aluno</label>
            <select className="titan-select" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
              {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Professor/Instrutor</label>
            <select className="titan-select" value={form.trainerId} onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))}>
              {PROFESSIONALS.filter(p => p.role !== "Atendente").map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Modalidade</label>
            <select className="titan-select" value={form.modality} onChange={e => setForm(f => ({ ...f, modality: e.target.value }))}>
              <option>Musculação</option>
              <option>Funcional</option>
              <option>Crossfit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Categoria</label>
            <select className="titan-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option>Hipertrofia</option>
              <option>Força</option>
              <option>Condicionamento</option>
              <option>Emagrecimento</option>
              <option>Resistência</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">CRIAR PLANO</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
