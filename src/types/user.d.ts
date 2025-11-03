// User table types
export interface User {
  id: string; 
  full_name: string; 
  birth_day: Date | null; 
  gender: string | null; 
  phone_number: string | null; 
  email: string | null; 
  password: string; 
  avatar_url: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// User creation DTO (without id, timestamps)
export interface CreateUserDto {
  full_name: string;
  birth_day?: Date | null;
  gender?: string | null;
  phone_number?: string | null;
  email?: string | null;
  password: string;
  avatar_url?: string | null;
}

export interface UpdateUserDto {
  id: string;
  full_name?: string;
  birth_day?: Date | null;
  gender?: string | null;
  phone_number?: string | null;
  email?: string | null;
  password?: string;
  avatar_url?: string | null;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegisterDto {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  birth_day?: Date;
  gender?: string;
}
