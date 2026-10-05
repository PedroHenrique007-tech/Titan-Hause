import { useState } from "react";
import type { SystemUser } from "../types";
import { USERS } from "../data";

interface LoginProps {
  onLogin: (user: SystemUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password && u.active);
      if (user) {
        onLogin(user);
      } else {
        setError("Email ou senha inválidos.");
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      master: { email: "admin@titanhouse.com", password: "titan2024" },
      professor: { email: "joao@titanhouse.com", password: "123456" },
      atendente: { email: "maria@titanhouse.com", password: "123456" },
      aluno: { email: "carlos@titanhouse.com", password: "123456" },
    };
    const d = demos[role];
    if (d) {
      setEmail(d.email);
      setPassword(d.password);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#1A312C" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2420 0%, #1A312C 40%, #243F38 100%)" }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2" style={{ borderColor: "#89D7B7" }} />
          <div className="absolute top-40 left-40 w-96 h-96 rounded-full border" style={{ borderColor: "#428475" }} />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full border-2" style={{ borderColor: "#89D7B7" }} />
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: "#428475" }} />
        <div className="absolute top-1/3 right-10 w-4 h-32 rounded-full opacity-30" style={{ background: "#89D7B7" }} />
        <div className="absolute top-1/2 right-20 w-2 h-20 rounded-full opacity-20" style={{ background: "#89D7B7" }} />

        {/* Logo */}
        <div className="relative z-10">
          <TitanLogo size="lg" />
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h2 className="font-display text-6xl font-900 leading-none mb-4" style={{ color: "#FFF4E1", letterSpacing: "-1px" }}>
            FORÇA.<br />
            <span style={{ color: "#89D7B7" }}>DISCIPLINA.</span><br />
            RESULTADO.
          </h2>
          <p className="text-sm font-light mt-6" style={{ color: "#89D7B7", maxWidth: 320 }}>
            Plataforma completa de gestão para academia de alto desempenho.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          <div>
            <div className="font-display text-3xl font-bold" style={{ color: "#89D7B7" }}>8+</div>
            <div className="text-xs mt-1" style={{ color: "#428475" }}>Alunos Ativos</div>
          </div>
          <div style={{ width: 1, background: "#428475" }} />
          <div>
            <div className="font-display text-3xl font-bold" style={{ color: "#89D7B7" }}>5</div>
            <div className="text-xs mt-1" style={{ color: "#428475" }}>Profissionais</div>
          </div>
          <div style={{ width: 1, background: "#428475" }} />
          <div>
            <div className="font-display text-3xl font-bold" style={{ color: "#89D7B7" }}>3</div>
            <div className="text-xs mt-1" style={{ color: "#428475" }}>Planos</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col justify-center items-center p-8" style={{ background: "#1F3D36" }}>
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <TitanLogo size="md" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-4xl font-bold mb-1" style={{ color: "#FFF4E1" }}>BEM-VINDO</h2>
            <p className="text-sm" style={{ color: "#89D7B7" }}>Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="titan-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#89D7B7" }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="titan-input"
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(127,29,29,0.3)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="titan-btn-primary w-full py-3 text-base"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "ACESSANDO..." : "ACESSAR SISTEMA"}
            </button>
          </form>

          {/* Quick Access Demos */}
          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: "#428475" }}>
              Acesso Rápido (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "master", label: "MASTER", icon: "👑" },
                { role: "professor", label: "PROFESSOR", icon: "🏋️" },
                { role: "atendente", label: "ATENDENTE", icon: "💼" },
                { role: "aluno", label: "ALUNO", icon: "🎯" },
              ].map(({ role, label, icon }) => (
                <button
                  key={role}
                  onClick={() => quickLogin(role)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(66,132,117,0.15)",
                    border: "1px solid rgba(66,132,117,0.3)",
                    color: "#89D7B7",
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "rgba(66,132,117,0.3)")}
                  onMouseOut={e => (e.currentTarget.style.background = "rgba(66,132,117,0.15)")}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TitanLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "lg" ? 1.5 : size === "sm" ? 0.7 : 1;
  return (
    <div className="flex items-center gap-3" style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="10" fill="#89D7B7" />
        {/* Dumbbell icon */}
        <rect x="6" y="19" width="32" height="6" rx="3" fill="#1A312C" />
        <rect x="4" y="14" width="8" height="16" rx="3" fill="#1A312C" />
        <rect x="32" y="14" width="8" height="16" rx="3" fill="#1A312C" />
        <rect x="7" y="17" width="5" height="10" rx="2" fill="#428475" />
        <rect x="32" y="17" width="5" height="10" rx="2" fill="#428475" />
      </svg>
      <div>
        <div className="font-display font-900 leading-none" style={{ fontSize: 22, color: "#FFF4E1", letterSpacing: 2, fontWeight: 900 }}>
          TITAN HOUSE
        </div>
        <div className="font-mono" style={{ fontSize: 9, color: "#89D7B7", letterSpacing: 3 }}>
          PERFORMANCE GYM
        </div>
      </div>
    </div>
  );
}

export { TitanLogo };
