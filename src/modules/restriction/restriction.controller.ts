import { CreateRestrictionDto } from './dto/create-restriction.dto';
import { UpdateRestrictionDto } from './dto/update-restriction.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { RestrictionService } from './restriction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({
  path: 'restriction',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class RestrictionController {
  constructor(private readonly restrictionService: RestrictionService) {}

  @Post()
  create(@Body() createRestrictionDto: CreateRestrictionDto) {
    return this.restrictionService.create(createRestrictionDto);
  }

  @Get()
  findAll() {
    return this.restrictionService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRestrictionDto: UpdateRestrictionDto) {
    return this.restrictionService.update(+id, updateRestrictionDto);
  }

  @Delete()
  remove(@Query('ids') ids: string) {
    return this.restrictionService.remove(ids.split(',').map((id) => +id));
  }
}
