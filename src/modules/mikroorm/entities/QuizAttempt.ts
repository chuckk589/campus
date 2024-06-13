import { Collection, Entity, Enum, Filter, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Code } from './Code';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAttemptAnswer } from './QuizAttemptAnswer';
import { QuizResult } from './QuizResult';
import { User } from './User';
// import { compare, hash } from 'bcrypt';
export enum AttemptStatus {
  FINISHED = 'finished',
  IN_PROGRESS = 'in_progress',
  INITIATED = 'initiated',
}

export enum AttemptParsingState {
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  ABORTED = 'aborted',
  DEFAULT = 'default',
}
@Entity()
export class QuizAttempt extends CustomBaseEntity {
  // [EntityRepositoryType]?: QuizAttemptRepository;
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  attemptId?: string;

  @Property({ default: 0 })
  questionAmount?: number;

  @Enum({ items: () => AttemptStatus, default: AttemptStatus.INITIATED })
  attemptStatus!: AttemptStatus;

  @Property({ nullable: true })
  cmid?: string;

  @Property({ nullable: true, type: 'text' })
  path?: string;

  @ManyToOne({ entity: () => User, nullable: true })
  user?: User;

  @OneToOne({ entity: () => Code })
  code?: Code;

  @OneToMany(() => QuizAttemptAnswer, (item) => item.attempt, { orphanRemoval: true })
  attemptAnswers = new Collection<QuizAttemptAnswer>(this);

  @OneToOne({
    entity: () => QuizResult,
    mappedBy: 'attempt',
    orphanRemoval: true,
  })
  result?: QuizResult;

  @Enum({ items: () => AttemptParsingState, default: AttemptParsingState.DEFAULT })
  parsingState!: AttemptParsingState;

  @Property({ default: false })
  isProctoring?: boolean;

  @Property({ default: false })
  editable?: boolean;

  @Property({ persist: false })
  unanswered: number;
}
//TODO:
// export class QuizAttemptRepository extends EntityRepository<QuizAttempt> {
//   async findAllProtected(user: ReqUser, body: IServerSideGetRowsRequest) {

//   }
// }
