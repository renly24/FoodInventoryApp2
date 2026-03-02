import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { createDb } from "@/db"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import * as schema from "@/db/schema"
import { z } from "zod"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"

const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
    // getCloudflareContext allows us to access the runtime environment
    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);

    return {
        pages: {
            signIn: "/",
        },
        session: { strategy: "jwt" },
        adapter: DrizzleAdapter(db, {
            usersTable: schema.users,
            accountsTable: schema.accounts,
            sessionsTable: schema.sessions,
            verificationTokensTable: schema.verificationTokens,
        }),
        providers: [
            GitHub({
                clientId: process.env.AUTH_CLIENT_ID,
                clientSecret: process.env.AUTH_CLIENT_SECRET,
            }),
            Credentials({
                async authorize(credentials) {
                    const parsedCredentials = SignInSchema.safeParse(credentials)

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data
                        const { env: contextEnv } = await getCloudflareContext({ async: true });
                        const contextDb = createDb(contextEnv.DB);

                        const [user] = await contextDb.select().from(schema.users).where(eq(schema.users.email, email));

                        if (!user || !user.password) return null
                        const passwordMatch = await compare(password, user.password)

                        if (passwordMatch) return user
                    }

                    return null
                },
            }),
        ],
        callbacks: {
            authorized({ auth, request: { nextUrl } }) {
                const isLoggedIn = !!auth?.user;
                const isPublicPage = ["/", "/register"].includes(nextUrl.pathname);

                if (isPublicPage) {
                    return true;
                }

                return isLoggedIn;
            },
            jwt({ token, user }) {
                if (user) {
                    token.id = user.id;
                }
                return token;
            },
            session({ session, token }) {
                if (session.user) {
                    session.user.id = token.id as string;
                }
                return session;
            },
        },
        secret: process.env.AUTH_SECRET,
        trustHost: true,
    }
})
