import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { LoggedInGuard } from '../auth/guards/loggedin.guard';
import { ResultsService } from './results.service';
import { RequestWithUser } from 'src/types/interfaces';

@Controller({
  path: 'results',
  version: '1',
})
@UseGuards(LoggedInGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.resultsService.findAll(req.user);
  }
}
