import { Module } from '@nestjs/common';
import { RestrictionService } from './restriction.service';
import { RestrictionController } from './restriction.controller';

@Module({
  controllers: [RestrictionController],
  providers: [RestrictionService],
})
export class RestrictionModule {}
