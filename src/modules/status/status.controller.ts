import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UpdateConfigDto } from './dto/update-config.dto';
import { StatusService } from './status.service';
import { Roles } from '../auth/guards/role.guard';

@Controller({
  path: 'status',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  findAll() {
    return this.statusService.findAll();
  }

  @Get('/configs')
  @Roles(['admin'])
  findConfigs() {
    return this.statusService.findConfigs();
  }

  @Put('/configs/:id')
  @Roles(['admin'])
  updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
    return this.statusService.updateConfig(+id, updateConfigDto);
  }
  @Get('/version/')
  @Roles(['admin'])
  getCurrentVersion(@Res() res: Response) {
    res.attachment();
    return this.statusService.getCurrentVersion(res);
  }
  @Delete('/drop/')
  @Roles(['admin'])
  drop() {
    return this.statusService.drop();
  }
}
