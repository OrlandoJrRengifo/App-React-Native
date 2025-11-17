import { Course, CourseParams } from '../../domain/entities/Course';

export class CourseModel extends Course {
  constructor(params: CourseParams) {
    super(params);
  }

  /**
   * Parsea un mapa (JSON) de Roble a un CourseModel.
   * Maneja la conversión de tipos (ej. max_students a número).
   */
  static fromMap(m: Record<string, any>): CourseModel {
    // Manejo robusto de 'max_students' (puede ser string o número)
    const parsedMax = m['max_students'] != null
      ? parseInt(m['max_students'].toString(), 10) || 0
      : 0;

    // Manejo de 'created_at' (puede ser string o nulo)
    const parsedDate = m['created_at'] && m['created_at'] !== "null"
      ? new Date(m['created_at'])
      : undefined;

    // console.log(`📦 fromMap → name=${m['name']} | max_students=${m['max_students']} | parsed=${parsedMax}`);

    return new CourseModel({
      id: m['_id']?.toString(), // Roble usa '_id'
      name: m['name'] as string,
      code: m['code'] as string,
      teacherId: m['teacher_id'] as string, // Roble usa 'teacher_id'
      maxStudents: parsedMax,
      createdAt: parsedDate,
    });
  }

  /**
   * Convierte la entidad a un mapa (JSON) listo para Roble.
   * Usado principalmente por el Datasource en `create` y `update`.
   * (No estaba en el CourseModel de Flutter, pero es necesario aquí para la lógica de 'create')
   */
  toMap(): Record<string, any> {
    return {
      // Roble no espera '_id' en la creación
      'name': this.name,
      'code': this.code,
      'teacher_id': this.teacherId,
      'max_students': this.maxStudents,
      'created_at': this.createdAt?.toISOString(),
    };
  }

  /**
   * Helper para convertir una Entidad Course pura a un CourseModel.
   */
  static fromEntity(course: Course): CourseModel {
    return new CourseModel({ ...course });
  }

  /**
   * Equivalente al copyWith de Dart, necesario para el modelo.
   */
  override copyWith(params: Partial<CourseParams>): CourseModel {
    return new CourseModel({
      id: params.id ?? this.id,
      name: params.name ?? this.name,
      code: params.code ?? this.code,
      teacherId: params.teacherId ?? this.teacherId,
      maxStudents: params.maxStudents ?? this.maxStudents,
      createdAt: params.createdAt ?? this.createdAt,
    });
  }
}