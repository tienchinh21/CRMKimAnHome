// Export all database types
export * from "./user";
export * from "./group";
export * from "./group-member";
export * from "./relationships";
export * from "./role";

// Export business logic types
export * from "./project";
export * from "./apartment";
export * from "./blog";
export * from "./common";
export * from "./legal";
export * from "./team";
export * from "./dashboard";

// Re-export commonly used types
export type { User, CreateUserDto, UpdateUserDto, UserWithRoles } from "./user";
export type {
  Group,
  CreateGroupDto,
  UpdateGroupDto,
  GroupWithDetails,
} from "./group";
export type {
  GroupMember,
  GroupRole,
  CreateGroupMemberDto,
  GroupMemberWithUser,
} from "./group-member";
export type {
  UserGroupAssignment,
  UserWithGroups,
  AssignGroupDto,
  RemoveGroupAssignmentDto,
  BulkAssignGroupDto,
  UserPermissions,
  GroupLeadershipValidation,
} from "./relationships";
export type { Role, RoleResponse, CreateRoleDto, UpdateRoleDto } from "./role";
export type {
  Team,
  TeamResponse,
  TeamDetailResponse,
  TeamMember,
  MyTeamsResponse,
  TeamMemberCustomer,
  TeamMembersCustomersResponse,
} from "./team";

// Re-export business logic types
export type {
  Project,
  CreateProjectPayload,
  ProjectImage,
  ProjectInformation,
  ProjectDetail,
  Amenity,
} from "./project";
export type {
  Apartment,
  CreateApartmentDto,
  UpdateApartmentDto,
  CreateApartmentPayload,
  UpdateApartmentPayload,
  ReponseApartmentDto,
  ReponseDetailApartmentDto,
  SpecificationApartment,
} from "./apartment";
export type {
  CreateBlogDto,
  UpdateBlogDto,
  ReponseBlogDto,
  BlogCategory,
  SpecificationBlog,
} from "./blog";
export type {
  ApiResponse,
  PaginatedResponse,
  Error,
  RestResponse,
  RestResponseList,
  Pageable,
  PaginationInfo,
  PaginationResponse,
} from "./common";
