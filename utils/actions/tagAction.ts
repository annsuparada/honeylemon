const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/tag` || "http://localhost:3000/api/tag";

export async function fetchAllTags() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch tags");

        return data.tags;
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
}

// Create a new tag (or return existing if already exists)
export async function createTag(name: string, token: string) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create tag");

        return data.tag;
    } catch (error) {
        console.error("Error creating tag:", error);
        return null;
    }
}

