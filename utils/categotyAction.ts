const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/category` || "http://localhost:3000/api/category";
export async function fetchAllCategories() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch categories");

        return data.categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Fetch a category by slug
export async function fetchCategoryBySlug(slug: string) {
    try {
        const response = await fetch(`${API_URL}?slug=${slug}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch category");

        return data.category || null;
    } catch (error) {
        console.error("Error fetching category by slug:", error);
        return null;
    }
}

// Create a new category
export async function createCategory(name: string, token: string) {
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
        if (!response.ok) throw new Error(data.error || "Failed to create category");

        return data.category;
    } catch (error) {
        console.error("Error creating category:", error);
        return null;
    }
}

// Update a category
export async function updateCategory(categoryId: string, newName: string, token: string) {
    try {
        const response = await fetch(API_URL, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: categoryId, name: newName, slug: newName.toLowerCase().replace(/\s+/g, "-") }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update category");

        return data.category;
    } catch (error) {
        console.error("Error updating category:", error);
        return null;
    }
}

// Delete a category
export async function deleteCategory(categoryId: string, token: string) {
    try {
        const response = await fetch(API_URL, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: categoryId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to delete category");

        return true; // Successfully deleted
    } catch (error) {
        console.error("Error deleting category:", error);
        return false;
    }
}
