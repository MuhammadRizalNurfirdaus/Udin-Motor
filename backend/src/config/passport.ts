import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Local Strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return done(null, false, { message: 'Email tidak terdaftar' });
            }

            if (!user.password) {
                return done(null, false, { message: 'Akun ini menggunakan Google login' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Password salah' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Google Strategy
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth callback received for:', profile.displayName);
            const email = profile.emails?.[0]?.value;

            if (!email) {
                console.error('No email from Google profile');
                return done(new Error('Email not provided by Google'));
            }

            console.log('Looking up user with googleId:', profile.id, 'or email:', email);
            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

            if (!user) {
                user = await prisma.user.findUnique({ where: { email } });

                if (user) {
                    // Link existing account with Google
                    console.log('Linking existing user to Google:', user.email);
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId: profile.id }
                    });
                } else {
                    // Create new user
                    console.log('Creating new user:', email);
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName || email.split('@')[0],
                            googleId: profile.id,
                            role: 'USER'
                        }
                    });
                }
            }

            console.log('Google auth successful for user:', user.email, 'role:', user.role);
            return done(null, user);
        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error as Error);
        }
    }
));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
