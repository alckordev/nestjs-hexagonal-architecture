export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
    public readonly isActive: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(data: {
    id: string;
    email: string;
    name: string;
    password: string;
    isActive: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.password,
      data.isActive,
      data.deletedAt || null,
      data.createdAt,
      data.updatedAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      isActive: this.isActive,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
