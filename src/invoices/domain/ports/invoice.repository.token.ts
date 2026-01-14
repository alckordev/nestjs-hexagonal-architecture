import { InjectionToken } from '@nestjs/common';
import type { IInvoiceRepository } from './invoice.repository.port';

export const INVOICE_REPOSITORY_TOKEN: InjectionToken<IInvoiceRepository> =
  'IInvoiceRepository';
