/**
 * @fileoverview Entidad FakeUser: Representa el usuario de la base de datos Roble,
 * separado del usuario de autenticación (AuthUser).
 * Incluye lógica para mapear desde/hacia JSON.
 */

export class FakeUser {
  /**
   * Identificador único de Roble (se genera en el backend).
   */
  public id?: string;
  /**
   * ID del usuario de autenticación de Roble (AuthUser.id).
   */
  public authId: string;
  public email: string;
  public name: string;

  constructor({ id, authId, email, name }: { id?: string; authId: string; email: string; name: string }) {
    this.id = id;
    this.authId = authId;
    this.email = email;
    this.name = name;
  }

  /**
   * Convierte un JSON recibido de Roble a una entidad FakeUser.
   */
  static fromJson(json: Record<string, any>): FakeUser {
    // console.log("👀 JSON recibido en FakeUser.fromJson:", json);
    return new FakeUser({
      id: json['_id'] as string | undefined, // Roble usa '_id'
      authId: json['auth_id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
    });
  }

  /**
   * Convierte la entidad a un formato JSON listo para enviar a Roble.
   * Excluye el 'id' ya que Roble lo genera.
   */
  toJson(): Record<string, any> {
    return {
      'auth_id': this.authId,
      'email': this.email,
      'name': this.name,
    };
  }
}