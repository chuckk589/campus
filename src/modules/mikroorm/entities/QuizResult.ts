import { Collection, Entity, Enum, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { summaryData } from 'src/modules/quiz/dto/finish-quiz.dto';
import { Code } from './Code';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttempt } from './QuizAttempt';
import { QuizAttemptAnswer } from './QuizAttemptAnswer';
import { User } from './User';
// import { compare, hash } from 'bcrypt';
export enum AttemptStatus {
  FINISHED = 'finished',
  IN_PROGRESS = 'in_progress',
  INITIATED = 'initiated',
}

@Entity()
export class QuizResult extends CustomBaseEntity {
  constructor(summary: summaryData) {
    super();
    this.startedAt = summary['Тест начат'];
    this.finishedAt = summary['Завершен'];
    this.status = summary['Состояние'];
    this.timeElapsed = summary['Прошло времени'];
    this.points = summary['Баллы'];
    this.mark = summary['Оценка'];
    this.feedback = summary['Отзыв'];
  }
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  startedAt?: string;

  @Property({ nullable: true })
  finishedAt?: string;

  @Property({ nullable: true })
  status?: string;

  @Property({ nullable: true })
  timeElapsed?: string;

  @Property({ nullable: true })
  points?: string;

  @Property({ nullable: true })
  mark?: string;

  @Property({ nullable: true })
  feedback?: string;

  @OneToOne({
    entity: () => QuizAttempt,
  })
  attempt: QuizAttempt;
}
