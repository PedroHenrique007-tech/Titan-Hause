import { useState } from "react";
import type { SystemUser } from "./types";
import { STUDENTS } from "./data";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Professionals from "./pages/Professionals";
import Plans from "./pages/Plans";
import Workouts from "./pages/Workouts";
import Classes from "./pages/Classes";
import Services from "./pages/Services";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import type { Page } from "./components/Sidebar";

export default function App() {
  const [authUser, setAuthUser] = useState<SystemUser | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogin = (user: SystemUser) => {
    setAuthUser(user);
    if (user.role === "aluno") {
      setCurrentPage("my-profile");
    } else {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentPage("dashboard");
    setStudentProfileId(null);
  };

  const handleNavigate = (page: Page, extra?: any) => {
    if (page === "student-profile" && extra) {
      setStudentProfileId(extra);
      setCurrentPage("student-profile");
    } else {
      setCurrentPage(page);
      if (page !== "student-profile") setStudentProfileId(null);
    }
  };

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  const myStudentId = authUser.role === "aluno" ? authUser.studentId || null : null;

  const renderPage = () => {
    if (authUser.role === "aluno") {
      const studentId = myStudentId || STUDENTS[0].id;
      switch (currentPage) {
        case "my-profile":
          return (
            <StudentProfile
              studentId={studentId}
              user={authUser}
              onBack={() => {}}
            />
          );
        case "my-workout":
          return (
            <StudentProfile
              studentId={studentId}
              user={authUser}
              onBack={() => {}}
            />
          );
        case "classes":
          return <Classes user={authUser} />;
        case "services":
          return <Services user={authUser} />;
        default:
          return (
            <StudentProfile
              studentId={studentId}
              user={authUser}
              onBack={() => {}}
            />
          );
      }
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={authUser} onNavigate={handleNavigate} />;
      case "users":
        return <Users user={authUser} />;
      case "students":
        return (
          <Students
            user={authUser}
            onViewProfile={(id) => handleNavigate("student-profile", id)}
          />
        );
      case "student-profile":
        return studentProfileId ? (
          <StudentProfile
            studentId={studentProfileId}
            user={authUser}
            onBack={() => setCurrentPage("students")}
          />
        ) : (
          <Students
            user={authUser}
            onViewProfile={(id) => handleNavigate("student-profile", id)}
          />
        );
      case "professionals":
        return <Professionals user={authUser} />;
      case "plans":
        return <Plans user={authUser} />;
      case "workouts":
        return <Workouts user={authUser} />;
      case "classes":
        return <Classes user={authUser} />;
      case "services":
        return <Services user={authUser} />;
      default:
        return <Dashboard user={authUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#1A312C" }}>
      <Sidebar
        user={authUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top header */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
          style={{
            background: "rgba(26,49,44,0.95)",
            borderBottom: "1px solid rgba(66,132,117,0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarCollapsed(c => !c)}
              style={{ color: "#89D7B7", fontSize: 22 }}
            >
              ☰
            </button>
            <div>
              <span className="font-display text-sm font-bold" style={{ color: "#FFF4E1" }}>
                {getPageTitle(currentPage)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold" style={{ color: "#FFF4E1" }}>{authUser.name}</div>
              <div className="text-xs font-mono" style={{ color: "#89D7B7" }}>
                {authUser.role.toUpperCase()}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "#428475", color: "#1A312C" }}>
              {authUser.name[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(page: Page): string {
  const titles: Partial<Record<Page, string>> = {
    dashboard: "Dashboard",
    students: "Alunos",
    "student-profile": "Perfil do Aluno",
    professionals: "Profissionais",
    plans: "Planos & Benefícios",
    workouts: "Treinos",
    classes: "Aulas",
    services: "Serviços & Modalidades",
    users: "Usuários do Sistema",
    "my-profile": "Meu Perfil",
    "my-workout": "Meu Treino",
  };
  return titles[page] || "TITAN HOUSE";
}
