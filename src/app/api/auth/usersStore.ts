// Shared in-memory user store for demo purposes
export interface Course {
  name: string;
  grade: string;
  creditUnit: number;
}

export interface User {
  email: string;
  password: string;
  courses?: Course[];
  cgpa?: number;
}

export const users: { [email: string]: User } = {}; 