export interface UserCourseParams {
  id?: string;
  userId: string;
  courseId: string;
}

export class UserCourse {
  public readonly id?: string;
  public readonly userId: string;
  public readonly courseId: string;

  constructor({ id, userId, courseId }: UserCourseParams) {
    this.id = id;
    this.userId = userId;
    this.courseId = courseId;
  }

  copyWith(params: Partial<UserCourseParams>): UserCourse {
    return new UserCourse({
      id: params.id ?? this.id,
      userId: params.userId ?? this.userId,
      courseId: params.courseId ?? this.courseId,
    });
  }

  toString(): string {
    return `UserCourse(id: ${this.id}, userId: ${this.userId}, courseId: ${this.courseId})`;
  }
}
