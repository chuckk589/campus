import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtChromeStrategy } from './strategies/jwt-chrome.strategy';
import { LocalVersionStrategy } from './strategies/local-version.strategy';
import { UserStatusStrategy } from './strategies/user-status.strategy';
import { SessionSerializer } from './session.serializer';

@Global()
@Module({
  imports: [
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.get<string>('jwt_secret'),
      }),
    }),
  ],
  providers: [SessionSerializer, LocalStrategy, JwtChromeStrategy, LocalVersionStrategy, AuthService, UserStatusStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
