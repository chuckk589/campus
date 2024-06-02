import { FilterQuery } from '@mikro-orm/core';
import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
import { DtoFactory, ColumnNameResolveFunc } from 'src/types/interfaces';

export class AttemptDto extends DtoFactory<QuizAttempt>((columnName: string) => {
  return (value: any) => {
    if (columnName === 'userName') return { user: { name: value } };
    if (columnName === 'status') return { attemptStatus: value };
    return { [columnName]: value };
  };
}) {}
