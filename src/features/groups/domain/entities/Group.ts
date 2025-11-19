/**
 * @fileoverview Entidad Group: Representa un grupo asociado a una categoría.
 */

export class Group {
  public id?: string;
  public categoryId: string;
  public numeration: number;
  public capacity: number;

  constructor({
    id,
    categoryId,
    numeration,
    capacity,
  }: {
    id?: string;
    categoryId: string;
    numeration: number;
    capacity: number;
  }) {
    this.id = id;
    this.categoryId = categoryId;
    this.numeration = numeration;
    this.capacity = capacity;
  }

  /**
   * Convierte un JSON recibido de Roble a una entidad Group.
   */
  static fromJson(json: Record<string, any>): Group {
    return new Group({
      id: json['_id'] as string | undefined,
      categoryId: json['category_id'] ?? '',
      numeration: json['numeration'] ?? 0,
      capacity: json['capacity'] ?? 0,
    });
  }

  /**
   * Convierte la entidad a un formato JSON listo para enviar a Roble.
   */
  toJson(): Record<string, any> {
    return {
      'category_id': this.categoryId,
      'numeration': this.numeration,
      'capacity': this.capacity,
    };
  }

  /**
   * Crea una copia del grupo con valores actualizados.
   */
  copyWith({
    id,
    categoryId,
    numeration,
    capacity,
  }: {
    id?: string;
    categoryId?: string;
    numeration?: number;
    capacity?: number;
  }): Group {
    return new Group({
      id: id ?? this.id,
      categoryId: categoryId ?? this.categoryId,
      numeration: numeration ?? this.numeration,
      capacity: capacity ?? this.capacity,
    });
  }

  toString(): string {
    return `Group(id: ${this.id}, categoryId: ${this.categoryId}, numeration: ${this.numeration}, capacity: ${this.capacity})`;
  }
}
