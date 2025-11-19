export class UserGroup {
  id?: string;
  userId: string;
  groupId: string;

  constructor(data: { id?: string; userId: string; groupId: string }) {
    this.id = data.id;
    this.userId = data.userId;
    this.groupId = data.groupId;
  }

  static fromJson(json: any): UserGroup {
    return new UserGroup({
      id: json._id || json.id,
      userId: json.user_id,
      groupId: json.group_id,
    });
  }

  toJson(): any {
    return {
      _id: this.id,
      user_id: this.userId,
      group_id: this.groupId,
    };
  }

  copyWith(data: Partial<{ id: string; userId: string; groupId: string }>): UserGroup {
    return new UserGroup({
      id: data.id ?? this.id,
      userId: data.userId ?? this.userId,
      groupId: data.groupId ?? this.groupId,
    });
  }

  toString(): string {
    return `UserGroup(id: ${this.id}, userId: ${this.userId}, groupId: ${this.groupId})`;
  }
}
