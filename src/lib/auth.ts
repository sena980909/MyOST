import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getAdminClient } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

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

    async jwt({ token, account }) {
      if (account) {
        const supabase = getAdminClient();
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("provider", account.provider)
          .eq("provider_account_id", account.providerAccountId)
          .single();

        if (user) {
          token.userId = user.id;
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
