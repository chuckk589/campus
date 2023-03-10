import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttemptService } from './attempt.service';

@Controller({ version: '1', path: 'attempt' })
@UseGuards(JwtAuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  // @Post()
  // create(@Body() createAttemptDto: CreateAttemptDto) {
  //   return this.attemptService.create(createAttemptDto);
  // }

  @Get()
  findAll() {
    return this.attemptService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.attemptService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAttemptDto: UpdateAttemptDto) {
  //   return this.attemptService.update(+id, updateAttemptDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.attemptService.remove(+id);
  // }
}
