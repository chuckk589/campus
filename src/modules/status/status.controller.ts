import { Body, Controller, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UpdateConfigDto } from './dto/update-config.dto';
import { StatusService } from './status.service';

@Controller({
  path: 'status',
  version: '1',
})
// @UseGuards(JwtAuthGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  findAll() {
    return this.statusService.findAll();
  }

  // @Get('session')
  // session(@Body() retrieveSessionDto: RetrieveSessionDto) {
  //   return this.statusService.getSession(retrieveSessionDto);
  // }

  @Get('/configs')
  findConfigs() {
    return this.statusService.findConfigs();
  }

  @Put('/configs/:id')
  updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
    return this.statusService.updateConfig(+id, updateConfigDto);
  }
  @Get('/version/')
  getCurrentVersion(@Res() res: Response) {
    res.attachment();
    return this.statusService.getCurrentVersion(res);
  }
}
