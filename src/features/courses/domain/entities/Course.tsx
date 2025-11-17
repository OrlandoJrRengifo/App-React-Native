export interface CourseParams {
  id?: string;
  name: string;
  code: string;
  teacherId: string;
  maxStudents: number;
  createdAt?: Date;
}

export class Course {
  public readonly id?: string;
  public readonly name: string;
  public readonly code: string;
  public readonly teacherId: string;
  public readonly maxStudents: number;
  public readonly createdAt?: Date;

  constructor({ id, name, code, teacherId, maxStudents, createdAt }: CourseParams) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.teacherId = teacherId;
    this.maxStudents = maxStudents;
    this.createdAt = createdAt;
  }
  
  copyWith(params: Partial<CourseParams>): Course {
    return new Course({
      id: params.id ?? this.id,
      name: params.name ?? this.name,
      code: params.code ?? this.code,
      teacherId: params.teacherId ?? this.teacherId,
      maxStudents: params.maxStudents ?? this.maxStudents,
      createdAt: params.createdAt ?? this.createdAt,
    });
  }

  toString(): string {
    return `Course(id: ${this.id}, name: ${this.name}, code: ${this.code}, teacherId: ${this.teacherId}, maxStudents: ${this.maxStudents})`;
  }
}