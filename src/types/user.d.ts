// User table types
export interface User {
  id: string; // BINARY(16) - Primary Key
  full_name: string; // NVARCHAR(60)
  birth_day: Date | null; // DATE - nullable
  gender: string | null; // BINARY(16) - nullable, foreign key to gender table
  phone_number: string | null; // VARCHAR(20) - nullable, unique
  email: string | null; // VARCHAR(20) - nullable, unique
  password: string; // VARCHAR(255) - not null
  avatar_url: string | null; // VARCHAR(255) - nullable
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

// User update DTO (all fields optional except id)
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

// User with roles (for API responses)
export interface UserWithRoles extends User {
  roles: Role[];
}

// User login DTO
export interface UserLoginDto {
  email: string;
  password: string;
}

// User registration DTO
export interface UserRegisterDto {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  birth_day?: Date;
  gender?: string;
}
