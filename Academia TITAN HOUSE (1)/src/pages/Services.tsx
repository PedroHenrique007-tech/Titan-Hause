import { MODALITIES, CLASSES, PROFESSIONALS } from "../data";
import type { SystemUser } from "../types";

interface ServicesProps {
  user: SystemUser;
}

export default function Services({ user }: ServicesProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold" style={{ color: "#FFF4E1" }}>SERVIÇOS & MODALIDADES</h1>
        <p className="text-sm mt-0.5" style={{ color: "#89D7B7" }}>Conheça tudo que a TITAN HOUSE oferece</p>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=300&fit=crop&auto=format"
          alt="Academia TITAN HOUSE"
          className="w-full object-cover"
          style={{ height: 220 }}
        />
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(26,49,44,0.85) 0%, rgba(26,49,44,0.6) 100%)" }}>
          <div className="text-center">
            <h2 className="font-display text-5xl font-bold" style={{ color: "#89D7B7" }}>TITAN HOUSE</h2>
            <p className="text-base mt-2" style={{ color: "#FFF4E1" }}>Força · Performance · Resultado</p>
          </div>
        </div>
      </div>

      {/* Modalities */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "#FFF4E1" }}>MODALIDADES DISPONÍVEIS</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODALITIES.map(mod => {
            const modClasses = CLASSES.filter(c => c.modalityId === mod.id);
            const totalSpots = modClasses.reduce((acc, c) => acc + c.capacity, 0);
            const enrolledTotal = modClasses.reduce((acc, c) => acc + c.enrolled.length, 0);
            return (
              <div key={mod.id} className="titan-card text-center" style={{ borderColor: `${mod.color}30` }}>
                <div className="text-5xl mb-3">{mod.icon}</div>
                <div className="font-display text-xl font-bold mb-2" style={{ color: mod.color }}>{mod.name}</div>
                <p className="text-xs mb-3" style={{ color: "#89D7B7" }}>{mod.description}</p>
                <div className="flex justify-center gap-3 py-3" style={{ borderTop: "1px solid rgba(66,132,117,0.15)" }}>
                  <div>
                    <div className="font-mono text-lg font-bold" style={{ color: "#FFF4E1" }}>{modClasses.length}</div>
                    <div className="text-xs" style={{ color: "#428475" }}>Turmas</div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-bold" style={{ color: "#FFF4E1" }}>{totalSpots - enrolledTotal}</div>
                    <div className="text-xs" style={{ color: "#428475" }}>Vagas</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructors */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "#FFF4E1" }}>NOSSA EQUIPE</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROFESSIONALS.map(prof => (
            <div key={prof.id} className="titan-card flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #428475, #89D7B7)", color: "#1A312C" }}>
                {prof.name[0]}
              </div>
              <div>
                <div className="font-display text-lg font-bold" style={{ color: "#FFF4E1" }}>{prof.name}</div>
                <div className="text-xs" style={{ color: "#89D7B7" }}>{prof.role}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prof.specialties.slice(0, 2).map(s => (
                    <span key={s} className="badge text-xs" style={{ background: "rgba(66,132,117,0.2)", color: "#428475" }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule overview */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "#FFF4E1" }}>GRADE HORÁRIA</h2>
        <div className="titan-card overflow-x-auto p-0">
          <table className="titan-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20 }}>Modalidade</th>
                <th>Instrutor</th>
                <th>Dia</th>
                <th>Horário</th>
                <th>Local</th>
                <th>Duração</th>
                <th>Vagas</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.sort((a, b) => {
                const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
                return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek) || a.time.localeCompare(b.time);
              }).map(c => {
                const mod = MODALITIES.find(m => m.id === c.modalityId);
                const inst = PROFESSIONALS.find(p => p.id === c.instructorId);
                const spots = c.capacity - c.enrolled.length;
                return (
                  <tr key={c.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <span>{mod?.icon} {mod?.name}</span>
                    </td>
                    <td className="text-sm">{inst?.name}</td>
                    <td className="text-sm">{c.dayOfWeek}</td>
                    <td className="font-mono text-sm">{c.time}</td>
                    <td className="text-sm">{c.location}</td>
                    <td className="font-mono text-sm">{c.duration}min</td>
                    <td>
                      <span className="font-mono text-sm font-semibold" style={{ color: spots === 0 ? "#fca5a5" : spots < 5 ? "#fde68a" : "#89D7B7" }}>
                        {spots}/{c.capacity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* About */}
      <div className="titan-card" style={{ background: "linear-gradient(135deg, #1F3D36, #243F38)" }}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold mb-3" style={{ color: "#89D7B7" }}>SOBRE A TITAN HOUSE</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#FFF4E1" }}>
              A TITAN HOUSE é uma academia premium focada em musculação, força e performance.
              Com equipamentos de última geração, profissionais altamente qualificados e um ambiente
              motivador, aqui você encontra tudo o que precisa para atingir seus objetivos.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "500+", label: "m² de área" },
                { value: "100+", label: "equipamentos" },
                { value: "5", label: "anos de mercado" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold" style={{ color: "#89D7B7" }}>{value}</div>
                  <div className="text-xs" style={{ color: "#428475" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ height: 200 }}>
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format"
              alt="Sala de musculação"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
