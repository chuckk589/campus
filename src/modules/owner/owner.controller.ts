import { UpdateOwnerDto } from './dto/update-owner.dto';
import { RetrieveOwnerDto } from './dto/retrieve-owner.dto';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/role.guard';

@Controller({
  path: 'owner',
  version: '1',
})
@Roles(['admin'])
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Get()
  findAll(): Promise<RetrieveOwnerDto> {
    return this.ownerService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerService.update(+id, updateOwnerDto);
  }

  @Delete()
  remove(@Query('ids') ids: string) {
    return this.ownerService.remove(ids.split(',').map((id) => +id));
  }
}
