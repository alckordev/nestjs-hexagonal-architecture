import { InvoiceStatus } from '../enums/invoice-status.enum';

export class Invoice {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly description: string | null,
    public readonly status: InvoiceStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(data: {
    id: string;
    userId: string;
    amount: number | string | { toString(): string };
    description: string | null;
    status: InvoiceStatus | string;
    createdAt: Date;
    updatedAt: Date;
  }): Invoice {
    // Handle Prisma Decimal type
    let amountValue: number;
    if (typeof data.amount === 'number') {
      amountValue = data.amount;
    } else if (typeof data.amount === 'string') {
      amountValue = parseFloat(data.amount);
    } else {
      // Prisma Decimal object
      amountValue = parseFloat(data.amount.toString());
    }

    return new Invoice(
      data.id,
      data.userId,
      amountValue,
      data.description,
      data.status as InvoiceStatus,
      data.createdAt,
      data.updatedAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
