import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
import { AGColumn } from 'src/types/agGridORM';
import { BaseDto } from 'src/types/interfaces';
@AGColumn('userName', (value: any) => ({ user: { name: value } }))
@AGColumn('status', (value: any) => ({ attemptStatus: value }))
@AGColumn('unanswered', (value: any) => ({ unanswered: value }), true)
export class AttemptDto extends BaseDto {}
