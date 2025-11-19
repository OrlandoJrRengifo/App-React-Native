/**
 * @fileoverview Entidad Category: Representa una categoría asociada a un curso.
 */

export type GroupingMethod = 'random' | 'self-signed';

export class Category {
  public id?: string;
  public courseId: string;
  public name: string;
  public groupingMethod: GroupingMethod;
  public maxGroupSize: number;
  public createdAt?: Date;

  constructor({
    id,
    courseId,
    name,
    groupingMethod,
    maxGroupSize,
    createdAt,
  }: {
    id?: string;
    courseId: string;
    name: string;
    groupingMethod: GroupingMethod;
    maxGroupSize: number;
    createdAt?: Date;
  }) {
    this.id = id;
    this.courseId = courseId;
    this.name = name;
    this.groupingMethod = groupingMethod;
    this.maxGroupSize = maxGroupSize;
    this.createdAt = createdAt;
  }

  /**
   * Convierte un JSON recibido de Roble a una entidad Category.
   */
  static fromJson(json: Record<string, any>): Category {
    return new Category({
      id: json['_id'] as string | undefined,
      courseId: json['course_id'] ?? '',
      name: json['name'] ?? '',
      groupingMethod: (json['grouping_method'] ?? 'random') as GroupingMethod,
      maxGroupSize: json['max_group_size'] ?? 0,
      createdAt: json['created_at'] ? new Date(json['created_at']) : undefined,
    });
  }

  /**
   * Convierte la entidad a un formato JSON listo para enviar a Roble.
   */
  toJson(): Record<string, any> {
    return {
      'course_id': this.courseId,
      'name': this.name,
      'grouping_method': this.groupingMethod,
      'max_group_size': this.maxGroupSize,
      'created_at': this.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  /**
   * Crea una copia de la categoría con valores actualizados.
   */
  copyWith({
    id,
    courseId,
    name,
    groupingMethod,
    maxGroupSize,
    createdAt,
  }: {
    id?: string;
    courseId?: string;
    name?: string;
    groupingMethod?: GroupingMethod;
    maxGroupSize?: number;
    createdAt?: Date;
  }): Category {
    return new Category({
      id: id ?? this.id,
      courseId: courseId ?? this.courseId,
      name: name ?? this.name,
      groupingMethod: groupingMethod ?? this.groupingMethod,
      maxGroupSize: maxGroupSize ?? this.maxGroupSize,
      createdAt: createdAt ?? this.createdAt,
    });
  }

  toString(): string {
    return `Category(id: ${this.id}, courseId: ${this.courseId}, name: ${this.name}, groupingMethod: ${this.groupingMethod}, maxGroupSize: ${this.maxGroupSize})`;
  }
}
