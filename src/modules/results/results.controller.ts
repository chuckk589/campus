import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResultsService } from './results.service';
import { RequestWithUser } from 'src/types/interfaces';

@Controller({
  path: 'results',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.resultsService.findAll(req.user);
  }
}
