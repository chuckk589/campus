import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CodeService } from './code.service';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';

@Controller({ version: '1', path: 'code' })
@UseGuards(JwtAuthGuard)
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post()
  create(@Body() createCodeDto: CreateCodeDto) {
    return this.codeService.create(createCodeDto);
  }

  @Get()
  findAll() {
    return this.codeService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.codeService.findOne(+id);
  // }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCodeDto: UpdateCodeDto) {
    return this.codeService.update(+id, updateCodeDto);
  }

  @Delete()
  remove(@Query('ids') ids: string) {
    return this.codeService.remove(ids.split(',').map((id) => +id));
  }
}
