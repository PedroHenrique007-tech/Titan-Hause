import { useState } from "react";
import { CLASSES as initialClasses, MODALITIES, PROFESSIONALS, STUDENTS } from "../data";
import type { ClassSchedule } from "../types";
import type { SystemUser } from "../types";

interface ClassesProps {
  user: SystemUser;
}

const DAYS_ORDER = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function Classes({ user }: ClassesProps) {
  const [classes, setClasses] = useState<ClassSchedule[]>(initialClasses);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedModality, setSelectedModality] = useState("all");

  const canEdit = user.role === "master" || user.role === "atendente";

  const myStudentId = user.role === "aluno" ? STUDENTS.find(s => s.email === user.email)?.id || "s1" : null;

  const filtered = classes.filter(c => {
    const matchDay = selectedDay === "all" || c.dayOfWeek === selectedDay;
    const matchMod = selectedModality === "all" || c.modalityId === selectedModality;
    return matchDay && matchMod;
  });

  const groupedByDay = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = filtered.filter(c => c.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {} as Record<string, ClassSchedule[]>);

  const handleEnroll = (classId: string) => {
    if (!myStudentId) return;
    setClasses(prev => prev.map(c => {
      if (c.id !== classId) return c;
      const isEnrolled = c.enrolled.includes(myStudentId);
      return {
        ...c,
        enrolled: isEnrolled
          ? c.enrolled.filter(id => id !== myStudentId)
          : c.enrolled.length < c.capacity ? [...c.enrolled, myStudentId] : c.enrolled,
      };
    }));
  };

  const handleSave = (data: Partial<ClassSchedule>) => {
    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...data } : c));
    } else {
      setClasses(prev => [...prev, {
        id: `c${Date.now()}`,
        modalityId: data.modalityId || "mod1",
        instructorId: data.instructorId || "p1",
        dayOfWeek: data.dayOfWeek || "Segunda",
        time: data.time || "07:00",
        duration: data.duration || 60,
        capacity: data.capacity || 20,
        enrolled: [],
        location: data.location || "Sala 1",
      }]);
    }
    setShowModal(false);
    setEditingClass(null);
  };

  const handleDelete = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>AULAS</h1>
          <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>Grade de aulas e modalidades</p>
        </div>
        {canEdit && (
          <button className="titan-btn-primary" onClick={() => { setEditingClass(null); setShowModal(true); }}>
            + NOVA AULA
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="titan-select" style={{ maxWidth: 160 }} value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
          <option value="all">Todos os Dias</option>
          {DAYS_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="titan-select" style={{ maxWidth: 200 }} value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
          <option value="all">Todas as Modalidades</option>
          {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_ORDER.map(day => {
          const dayClasses = groupedByDay[day] || [];
          return (
            <div key={day} className="titan-card">
              <div className="font-display text-lg font-bold mb-3" style={{ color: "#FFF4E1" }}>
                {day}
                <span className="font-mono text-sm font-normal ml-2" style={{ color: "#428475" }}>
                  {dayClasses.length} aula(s)
                </span>
              </div>
              <div className="space-y-2">
                {dayClasses.length === 0 ? (
                  <div className="text-xs py-4 text-center" style={{ color: "#428475" }}>Sem aulas neste dia</div>
                ) : dayClasses.map(c => {
                  const mod = MODALITIES.find(m => m.id === c.modalityId);
                  const inst = PROFESSIONALS.find(p => p.id === c.instructorId);
                  const spots = c.capacity - c.enrolled.length;
                  const isFull = spots === 0;
                  const isEnrolled = myStudentId ? c.enrolled.includes(myStudentId) : false;

                  return (
                    <div key={c.id} className="p-3 rounded-xl"
                      style={{
                        background: "rgba(26,49,44,0.7)",
                        border: `1px solid ${isEnrolled ? "#89D7B7" : "rgba(66,132,117,0.2)"}`,
                      }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 18 }}>{mod?.icon}</span>
                            <span className="font-display text-base font-bold" style={{ color: "#FFF4E1" }}>{mod?.name}</span>
                          </div>
                          <div className="text-xs mt-1" style={{ color: "#89D7B7" }}>
                            {c.time} · {c.duration}min · {c.location}
                          </div>
                          <div className="text-xs" style={{ color: "#428475" }}>{inst?.name}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono text-sm font-bold" style={{ color: isFull ? "#fca5a5" : spots < 5 ? "#fde68a" : "#89D7B7" }}>
                            {spots} vagas
                          </div>
                          <div className="text-xs" style={{ color: "#428475" }}>{c.enrolled.length}/{c.capacity}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {user.role === "aluno" && (
                          <button
                            onClick={() => handleEnroll(c.id)}
                            disabled={isFull && !isEnrolled}
                            className="text-xs px-3 py-1 rounded-lg font-semibold transition-all flex-1"
                            style={isEnrolled
                              ? { background: "#89D7B7", color: "#1A312C" }
                              : isFull
                                ? { background: "rgba(127,29,29,0.3)", color: "#fca5a5", cursor: "not-allowed" }
                                : { background: "rgba(66,132,117,0.3)", color: "#89D7B7" }}
                          >
                            {isEnrolled ? "✓ Matriculado" : isFull ? "Turma Cheia" : "Matricular"}
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => { setEditingClass(c); setShowModal(true); }}
                              className="text-xs px-2 py-1 rounded-lg transition-all"
                              style={{ background: "rgba(66,132,117,0.2)", color: "#89D7B7" }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="text-xs px-2 py-1 rounded-lg transition-all"
                              style={{ background: "rgba(127,29,29,0.2)", color: "#fca5a5" }}
                            >
                              Remover
                            </button>
                          </>
                        )}
                      </div>

                      {/* Enrolled students mini list */}
                      {canEdit && c.enrolled.length > 0 && (
                        <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(66,132,117,0.1)" }}>
                          <div className="text-xs" style={{ color: "#428475" }}>
                            Alunos: {c.enrolled.map(id => STUDENTS.find(s => s.id === id)?.name.split(" ")[0]).join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <ClassModal
          cls={editingClass}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingClass(null); }}
        />
      )}
    </div>
  );
}

function ClassModal({ cls, onSave, onClose }: { cls: ClassSchedule | null; onSave: (d: Partial<ClassSchedule>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    modalityId: cls?.modalityId || "mod1",
    instructorId: cls?.instructorId || "p1",
    dayOfWeek: cls?.dayOfWeek || "Segunda",
    time: cls?.time || "07:00",
    duration: cls?.duration || 60,
    capacity: cls?.capacity || 20,
    location: cls?.location || "Sala 1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const instructors = PROFESSIONALS.filter(p => p.role !== "Atendente");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(66,132,117,0.2)" }}>
          <h2 className="font-display text-2xl font-bold" style={{ color: "#FFF4E1" }}>{cls ? "EDITAR AULA" : "NOVA AULA"}</h2>
          <button onClick={onClose} style={{ color: "#428475", fontSize: 22 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Modalidade</label>
            <select className="titan-select" value={form.modalityId} onChange={e => setForm(f => ({ ...f, modalityId: e.target.value }))}>
              {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.icon} {m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Instrutor</label>
            <select className="titan-select" value={form.instructorId} onChange={e => setForm(f => ({ ...f, instructorId: e.target.value }))}>
              {instructors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Dia</label>
              <select className="titan-select" value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}>
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Horário</label>
              <input className="titan-input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Duração (min)</label>
              <input className="titan-input" type="number" min={15} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Capacidade</label>
              <input className="titan-input" type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Local</label>
            <input className="titan-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="titan-btn-primary flex-1">{cls ? "SALVAR" : "CRIAR AULA"}</button>
            <button type="button" className="titan-btn-secondary flex-1" onClick={onClose}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
