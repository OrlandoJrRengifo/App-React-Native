export const TOKENS = {
  LocalPrefs: Symbol("LocalPrefs"),

  // --- AUTH ---
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),

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
} as const;