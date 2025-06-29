import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('FACEBOOK_APP_ID', 'dummy-app-id'),
      clientSecret: configService.get('FACEBOOK_APP_SECRET', 'dummy-app-secret'),
      callbackURL: configService.get('FACEBOOK_CALLBACK_URL', '/api/v1/auth/facebook/callback'),
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails } = profile;
    
    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}