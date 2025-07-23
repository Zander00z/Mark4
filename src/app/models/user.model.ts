export interface User {
  id: string;
  email: string;
  role: 'coach' | 'employee';
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}