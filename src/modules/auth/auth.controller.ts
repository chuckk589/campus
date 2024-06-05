import { Body, Controller, Get, HttpException, Post, Req, Session, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ReqUser, RequestWithUser } from 'src/types/interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<ReqUser & { token: string }> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() payload: { username: string; password: string }): Promise<{ id: number; role: string; token: string }> {
    throw new HttpException('Not implemented', 501);
    return this.authService.register(payload);
  }

  @Get('logout')
  async logout(@Session() session: Record<string, any>) {
    session.destroy();
    return { status: 'ok' };
  }
}
