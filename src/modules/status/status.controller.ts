import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetrieveSessionDto } from './dto/retrieve-session.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { StatusService } from './status.service';

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

  @Get('session')
  session(@Body() retrieveSessionDto: RetrieveSessionDto) {
    return this.statusService.getSession(retrieveSessionDto);
  }

  @Get('/configs')
  findConfigs() {
    return this.statusService.findConfigs();
  }

  @Put('/configs/:id')
  updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
    return this.statusService.updateConfig(+id, updateConfigDto);
  }
}
