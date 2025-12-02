export const TOKENS = {
  LocalPrefs: Symbol("LocalPrefs"),

  // --- AUTH ---
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),

  // --- FAKE_USERS ---
  FakeUserRepo: Symbol("FakeUserRepo"),

  // --- COURSE ---
  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  CreateCourseUC: Symbol("CreateCourseUC"),
  UpdateCourseUC: Symbol("UpdateCourseUC"),
  DeleteCourseUC: Symbol("DeleteCourseUC"),
  ListCoursesByTeacherUC: Symbol("ListCoursesByTeacherUC"),
  GetCourseByIdUC: Symbol("GetCourseByIdUC"),
  GetCourseByCodeUC: Symbol("GetCourseByCodeUC"),
  CanCreateMoreUC: Symbol("CanCreateMoreUC"),
  
  // --- USER_COURSES (Inscripciones) ---
  UserCourseRepo: Symbol("UserCourseRepo"),
  EnrollUserUC: Symbol("EnrollUserUC"), 
  GetUserCoursesUC: Symbol("GetUserCoursesUC"),
  GetCourseStudentsUC: Symbol("GetCourseStudentsUC"),

  // --- CATEGORIES ---
  CategoryDataSource: Symbol("CategoryDataSource"),
  CategoryRepo: Symbol("CategoryRepo"),
  CategoryUseCases: Symbol("CategoryUseCases"),

  // --- GROUPS ---
  GroupDataSource: Symbol("GroupDataSource"),
  GroupRepo: Symbol("GroupRepo"),
  GroupUseCases: Symbol("GroupUseCases"),
  CreateCategoryWithGroupsUC: Symbol("CreateCategoryWithGroupsUC"),

  // --- USER_GROUPS ---
  UserGroupDataSource: Symbol("UserGroupDataSource"),
  UserGroupRepo: Symbol("UserGroupRepo"),
  UserGroupUseCases: Symbol("UserGroupUseCases"),
  
  // --- ACTIVITIES ---  
  ActivityDataSource: Symbol("ActivityDataSource"),
  ActivityRepo: Symbol("ActivityRepo"),
  ActivityUseCases: Symbol("ActivityUseCases"),

  // --- ASSESSMENTS ---
  AssessmentDataSource: Symbol("AssessmentDataSource"),
  AssessmentRepo: Symbol("AssessmentRepo"),
  AssessmentUseCases: Symbol("AssessmentUseCases"),

  // --- FAKE_USER_USECASES ---
  FakeUserDataSource: Symbol("FakeUserDataSource"),
  FakeUserUseCases: Symbol("FakeUserUseCases"),
} as const;

export const FakeUserRepoToken = TOKENS.FakeUserRepo;

export const UserGroupDataSourceToken = TOKENS.UserGroupDataSource;
export const UserGroupRepoToken = TOKENS.UserGroupRepo;
export const UserGroupUseCasesToken = TOKENS.UserGroupUseCases;