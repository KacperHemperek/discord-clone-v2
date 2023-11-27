import { DefaultError } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

export type MutationHookOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>;
