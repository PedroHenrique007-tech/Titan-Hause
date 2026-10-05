export type UserRole = "master" | "professor" | "atendente" | "aluno";
export type PaymentStatus = "pago" | "pendente" | "atrasado" | "adiantado";
export type Sex = "M" | "F" | "Outro";
export type ProfRole = "Instrutor" | "Professor" | "Atendente";
export type WorkoutLetter = "A" | "B" | "C";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  startDate: string;
  endDate: string;
  color: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  type: "payment" | "advance";
  reference: string;
  note?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  cpf: string;
  email: string;
  phone: string;
  sex: Sex;
  planId: string;
  planStartDate: string;
  planEndDate: string;
  paymentStatus: PaymentStatus;
  totalPaid: number;
  totalOwed: number;
  advanceBalance: number;
  nextPaymentDate: string;
  dueDate: string;
  trainerId?: string;
  workoutPlanId?: string;
  photo?: string;
  active: boolean;
}

export interface Professional {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  role: ProfRole;
  phone: string;
  workDays: string[];
  specialties: string[];
  photo?: string;
  active: boolean;
}

export interface Modality {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ClassSchedule {
  id: string;
  modalityId: string;
  instructorId: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: string[];
  location: string;
}

export interface Exercise {
  id: string;
  name: string;
  machine: string;
  location: string;
  reps: number;
  sets: number;
  defaultWeight: number;
  unit: string;
  tips: string[];
  muscles: string[];
}

export interface WorkoutDay {
  letter: WorkoutLetter;
  label: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  studentId: string;
  trainerId: string;
  modality: string;
  category: string;
  schedule: { day: string; workout: WorkoutLetter }[];
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}
