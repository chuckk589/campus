import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtChromeStrategy } from './strategies/jwt-chrome.strategy';
import { LocalVersionStrategy } from './strategies/local-version.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.get<string>('jwt_secret'),
      }),
    }),
  ],
  providers: [LocalStrategy, JwtStrategy, JwtChromeStrategy, LocalVersionStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
