const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/user`;

/**
 * Fetch a user by ID or all users
 */
export async function fetchUser(userId?: string) {
    try {
        const url = userId ? `${API_URL}?id=${userId}` : API_URL;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch user(s)");
        return await response.json();
    } catch (error) {
        console.error("Error fetching user(s):", error);
        return null;
    }
}

/**
 * Create a new user
 */
export async function createUser(data: {
    name?: string;
    lastName?: string;
    username: string;
    email: string;
    password: string;
    profilePicture?: string;
    bio?: string;
    role?: string;
}) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return await response.json();
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

/**
 * Update a user by ID
 */
export async function updateUser(id: string, data: {
    name?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    profilePicture?: string;
    bio?: string;
    role?: string;
}) {
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        });
        if (!response.ok) throw new Error("Failed to update user");
        return await response.json();
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}
