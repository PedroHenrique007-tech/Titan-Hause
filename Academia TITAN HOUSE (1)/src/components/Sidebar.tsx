import type { SystemUser } from "../types";
import { TitanLogo } from "../pages/Login";

type Page =
  | "dashboard"
  | "students"
  | "professionals"
  | "plans"
  | "workouts"
  | "classes"
  | "services"
  | "users"
  | "student-profile"
  | "my-profile"
  | "my-workout";

interface SidebarProps {
  user: SystemUser;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: {
  page: Page;
  label: string;
  icon: string;
  roles: string[];
}[] = [
  { page: "dashboard", label: "Dashboard", icon: "⊞", roles: ["master", "professor", "atendente"] },
  { page: "users", label: "Usuários", icon: "👥", roles: ["master"] },
  { page: "students", label: "Alunos", icon: "🎯", roles: ["master", "professor", "atendente"] },
  { page: "professionals", label: "Profissionais", icon: "🏋️", roles: ["master"] },
  { page: "plans", label: "Planos", icon: "📋", roles: ["master", "atendente"] },
  { page: "workouts", label: "Treinos", icon: "💪", roles: ["master", "professor"] },
  { page: "classes", label: "Aulas", icon: "📅", roles: ["master", "professor", "atendente"] },
  { page: "services", label: "Serviços", icon: "⭐", roles: ["master", "atendente"] },
  { page: "my-profile", label: "Meu Perfil", icon: "👤", roles: ["aluno"] },
  { page: "my-workout", label: "Meu Treino", icon: "💪", roles: ["aluno"] },
  { page: "classes", label: "Aulas", icon: "📅", roles: ["aluno"] },
  { page: "services", label: "Serviços", icon: "⭐", roles: ["aluno"] },
];

const roleLabels: Record<string, string> = {
  master: "MASTER",
  professor: "PROFESSOR",
  atendente: "ATENDENTE",
  aluno: "ALUNO",
};

export default function Sidebar({ user, currentPage, onNavigate, onLogout, collapsed, onToggle }: SidebarProps) {
  const items = navItems.filter(n => n.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onToggle}
        />
      )}

      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: "#0f2420",
          borderRight: "1px solid rgba(66,132,117,0.2)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(66,132,117,0.15)" }}>
          {!collapsed && (
            <div style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
              <TitanLogo size="sm" />
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="10" fill="#89D7B7" />
                <rect x="6" y="19" width="32" height="6" rx="3" fill="#1A312C" />
                <rect x="4" y="14" width="8" height="16" rx="3" fill="#1A312C" />
                <rect x="32" y="14" width="8" height="16" rx="3" fill="#1A312C" />
              </svg>
            </div>
          )}
          <button onClick={onToggle} className="ml-auto" style={{ color: "#428475", fontSize: 18, lineHeight: 1 }}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.page + item.label}
              onClick={() => onNavigate(item.page)}
              className={`sidebar-link w-full text-left ${currentPage === item.page ? "active" : ""}`}
              style={collapsed ? { justifyContent: "center", padding: "10px 0" } : {}}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(66,132,117,0.15)" }}>
          {!collapsed && (
            <div className="mb-3 px-2">
              <div className="text-xs font-semibold truncate" style={{ color: "#FFF4E1" }}>{user.name}</div>
              <span className="badge text-xs mt-1" style={{ background: "rgba(137,215,183,0.15)", color: "#89D7B7" }}>
                {roleLabels[user.role]}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="sidebar-link w-full text-left"
            style={{ color: "#fca5a5", ...(collapsed ? { justifyContent: "center", padding: "10px 0" } : {}) }}
            title={collapsed ? "Sair" : undefined}
          >
            <span style={{ fontSize: 16 }}>⇦</span>
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export type { Page };
