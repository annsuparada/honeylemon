const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/login`;

export async function loginUser(email: string, password: string) {
    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        return { success: false, message: errorData.message };
    }

    const data = await res.json();
    localStorage.setItem("token", data.token); // Store token
    localStorage.setItem("user", JSON.stringify(data.user)); // Store token
    window.dispatchEvent(new Event("storage")); // Force navigation update
    return { success: true, token: data.token };
}
