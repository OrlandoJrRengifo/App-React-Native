/**
 * @fileoverview Entidad Activity: Representa una actividad asociada a una categoría.
 */

export class Activity {
  public id?: string;
  public categoryId: string;
  public name: string;
  public activated: boolean;

  constructor({
    id,
    categoryId,
    name,
    activated = false,
  }: {
    id?: string;
    categoryId: string;
    name: string;
    activated?: boolean;
  }) {
    this.id = id;
    this.categoryId = categoryId;
    this.name = name;
    this.activated = activated;
  }

  /**
   * Convierte un JSON recibido de Roble a una entidad Activity.
   */
  static fromJson(json: Record<string, any>): Activity {
    return new Activity({
      id: json['_id'] as string | undefined,
      categoryId: json['category_id'] ?? '',
      name: json['name'] ?? '',
      activated: json['activated'] ?? false,
    });
  }

  /**
   * Alias para mantener consistencia con el código de Flutter.
   * @deprecated Use fromJson instead
   */
  static fromMap(map: Record<string, any>): Activity {
    return Activity.fromJson(map);
  }

  /**
   * Convierte la entidad a un formato JSON listo para enviar a Roble.
   */
  toJson(): Record<string, any> {
    const json: Record<string, any> = {
      category_id: this.categoryId,
      name: this.name,
      activated: this.activated,
    };
    
    // Incluir el id solo si existe (para actualizaciones)
    if (this.id) {
      json['_id'] = this.id;
    }
    
    return json;
  }

  /**
   * Alias para mantener consistencia con el código de Flutter.
   * @deprecated Use toJson instead
   */
  toMap(): Record<string, any> {
    return this.toJson();
  }

  /**
   * Crea una copia de la actividad con valores actualizados.
   */
  copyWith({
    id,
    categoryId,
    name,
    activated,
  }: {
    id?: string;
    categoryId?: string;
    name?: string;
    activated?: boolean;
  }): Activity {
    return new Activity({
      id: id ?? this.id,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      activated: activated ?? this.activated,
    });
  }

  toString(): string {
    return `Activity(id: ${this.id}, categoryId: ${this.categoryId}, name: ${this.name}, activated: ${this.activated})`;
  }
}