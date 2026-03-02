import { signIn, signOut } from "@/auth"

export function SignIn({
    provider,
    children,
    ...props
}: { provider?: string } & React.ComponentPropsWithRef<"button">) {
    return (
        <form
            action={async () => {
                "use server"
                await signIn(provider)
            }}
        >
            <button {...props}>{children || "ログイン"}</button>
        </form>
    )
}

export function SignOut(props: React.ComponentPropsWithRef<"button">) {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
            className="w-full"
        >
            <button {...props}>
                ログアウト
            </button>
        </form>
    )
}
