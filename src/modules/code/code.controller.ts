import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Put, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CodeService } from './code.service';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { ReqUser } from 'src/types/interfaces';

@Controller({ version: '1', path: 'code' })
@UseGuards(JwtAuthGuard)
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post()
  create(@Req() request: Request & { user: ReqUser }, @Body() createCodeDto: CreateCodeDto) {
    return this.codeService.create(request.user, createCodeDto);
  }

  @Get()
  findAll(@Req() request: Request & { user: ReqUser }) {
    return this.codeService.findAll(request.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCodeDto: UpdateCodeDto) {
    return this.codeService.update(+id, updateCodeDto);
  }

  @Delete()
  remove(@Query('ids') ids: string) {
    return this.codeService.remove(ids.split(',').map((id) => +id));
  }
}
