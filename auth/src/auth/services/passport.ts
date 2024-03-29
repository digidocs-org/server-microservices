/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NativeError } from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User, { IUser } from 'auth/models';
import { generateToken } from 'auth/utils';
import { UserPayload, BadRequestError } from '@digidocs/guardian';
import { UserCreatedPublisher } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line no-shadow
    interface User {
      accessToken?: string;
      refreshToken?: string;
    }
  }
}

export default function passportInit(): void {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (cred: Express.User, done) => {
    try {
      const decoded = jwt.verify(
        cred?.accessToken!,
        process.env.ACCESS_TOKEN_SECRET!
      ) as UserPayload;
      await User.findById(decoded.id, (err: NativeError, user: IUser) => {
        if (user) {
          return done(null, user);
        }
        throw new BadRequestError('Some error occured in google auth!!');
      });
    } catch (error) {
      throw new BadRequestError('Some error occured in google auth!!');
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        if (profile.emails) {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = await User.create({
              firstname: profile?.name?.givenName,
              lastname: profile?.name?.familyName,
              googleId: profile?.id,
              email: profile?.emails![0]?.value,
              isEmailVerified: true,
            });
            new UserCreatedPublisher(natsWrapper.client).publish({
              id: user.id,
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              mobile: user.mobile,
              isBlocked: user.isBlocked,
              isPremium: user.isPremium,
              profileImage: user.profileImage,
              notificationId: user.notificationId,
              deviceId: user.deviceId,
              version: user.version,
            });
          }
          const payload = {
            id: user.id,
          };
          const newAccessToken = generateToken(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            process.env.ACCESS_TOKEN_EXP!
          );
          const newRefreshToken = generateToken(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            process.env.REFRESH_TOKEN_EXP!
          );
          return done(null, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        }
        const newUser = await User.create({
          firstname: profile?.name?.givenName,
          lastname: profile?.name?.familyName,
          googleId: profile?.id,
          email: profile?.emails![0]?.value,
          isEmailVerified: true,
        });
        new UserCreatedPublisher(natsWrapper.client).publish({
          id: newUser.id,
          email: newUser.email,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          mobile: newUser.mobile,
          isBlocked: newUser.isBlocked,
          isPremium: newUser.isPremium,
          profileImage: newUser.profileImage,
          notificationId: newUser.notificationId,
          deviceId: newUser.deviceId,
          version: newUser.version,
        });
        const payload = {
          id: newUser.id,
        };
        const newAccessToken = generateToken(
          payload,
          process.env.ACCESS_TOKEN_SECRET!,
          process.env.ACCESS_TOKEN_EXP!
        );
        const newRefreshToken = generateToken(
          payload,
          process.env.REFRESH_TOKEN_SECRET!,
          process.env.REFRESH_TOKEN_EXP!
        );
        done(null, {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    )
  );
}
