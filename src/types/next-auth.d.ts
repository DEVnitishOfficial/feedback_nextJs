import 'next-auth'

declare module 'next-auth' {
    interface User {
        _id?: String;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        userName?: string;

    }
    interface Session {
        user: {
            _id?: String;
            isVerified?: boolean;
            isAcceptingMessages?: boolean;
            userName?: string;

        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        _id?: String;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        userName?: string;
    }
}