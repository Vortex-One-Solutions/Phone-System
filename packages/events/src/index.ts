import { randomUUID } from 'node:crypto';
import type { DomainEvent } from '@platform/domain/types';

export function createEvent<T>(
  input: Omit<DomainEvent<T>, 'id' | 'occurred_at'> & { occurred_at?: string },
): DomainEvent<T> {
  return {
    ...input,
    id: randomUUID(),
    occurred_at: input.occurred_at ?? new Date().toISOString(),
  };
}
