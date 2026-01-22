import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: { params: { scope: 'openid profile email' } },
      issuer: 'https://www.linkedin.com/oauth',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        await connectDB();
        
        const normalizedEmail = User.normalizeEmail(credentials.email);
        const user = await User.findOne({ normalizedEmail });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      
      const normalizedEmail = User.normalizeEmail(user.email);
      const existingUser = await User.findOne({ normalizedEmail });
      
      if (!existingUser) {
        // Create new user with normalized email
        const provider = account?.provider || 'credentials';
        await User.create({
          name: user.name,
          email: user.email.toLowerCase().trim(),
          normalizedEmail,
          image: user.image,
          linkedinProfile: "", 
          authProvider: provider,
        });
      } else {
        // Update auth provider to 'multiple' if signing in with different provider
        const currentProvider = account?.provider || 'credentials';
        if (existingUser.authProvider !== currentProvider && existingUser.authProvider !== 'multiple') {
          existingUser.authProvider = 'multiple';
          await existingUser.save();
        }
      }
      return true;
    },
    async session({ session }) {
      await connectDB();
      const normalizedEmail = User.normalizeEmail(session.user.email);
      const dbUser = await User.findOne({ normalizedEmail });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.hasVoted = dbUser.hasVoted;
        session.user.linkedinProfile = dbUser.linkedinProfile;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };