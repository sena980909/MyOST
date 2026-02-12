import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const supabase = getAdminClient();
        const { data: user } = await supabase
          .from("users")
          .select("id, email, name, image, password_hash")
          .eq("email", email)
          .eq("provider", "credentials")
          .single();

        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      // Credentials users are already in DB (created via signup API)
      if (account.provider === "credentials") return true;

      try {
        const supabase = getAdminClient();
        const { error } = await supabase.from("users").upsert(
          {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "provider,provider_account_id" }
        );

        if (error) {
          console.error("User upsert error:", JSON.stringify(error));
        }
      } catch (err) {
        console.error("SignIn callback exception:", err);
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // For credentials login, user object has the DB id directly
      if (account?.provider === "credentials" && user?.id) {
        token.userId = user.id;
      }

      // For OAuth login, look up the DB id
      if (account && account.provider !== "credentials") {
        const supabase = getAdminClient();
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("provider", account.provider)
          .eq("provider_account_id", account.providerAccountId)
          .single();

        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
