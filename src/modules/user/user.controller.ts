import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { LoggedInGuard } from '../auth/guards/loggedin.guard';
import { RequestWithUser } from 'src/types/interfaces';

@Controller({
  path: 'user',
  version: '1',
})
@UseGuards(LoggedInGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.userService.findAll(req.user);
  }

  // // @Get(':id')
  // // findOne(@Param('id') id: string) {
  // //   return this.userService.findOne(+id);
  // // }
  // @Get('/banned')
  // findAllBanned() {
  //   return this.userService.findAllBanned();
  // }

  // @Put('/banned/:id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.updateBannedUser(+id, updateUserDto);
  // }

  // @Post('/banned/')
  // banUser(@Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.banUser(updateUserDto);
  // }
}
