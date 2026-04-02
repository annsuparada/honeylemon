export interface Author {
    id: string;
    bio?: string;
    name: string;
    lastName?: string;
    email?: string;
    username: string;
    profilePicture?: string;
    role?: string;
}

export interface AuthorUpdateData extends Partial<Author> {
    newPassword?: string;
    confirmPassword?: string;
}

