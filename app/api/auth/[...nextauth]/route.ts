import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers as needed
  ],
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },
  // Add any additional NextAuth.js options here
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
