import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TestService } from './test.service';
import { IsNumber } from 'class-validator';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  // @Post()
  // create(@Body() createTestDto: CreateTestDto) {
  //   return this.testService.create(createTestDto);
  // }

  // @Get()
  // findAll(@Query() query: { limit: number; offset: number }) {
  //   return this.testService.findAll(query);
  // }

  // @Get('sample')
  // getSample() {
  //   return this.testService.getSample();
  // }

  // @Post('sample')
  // getSampleResult(@Body() body: any) {
  //   return this.testService.getSampleResult(body);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
  //   return this.testService.update(+id, updateTestDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.testService.remove(+id);
  // }
}
