"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login"); // Redirect if no token
            return;
        }

        try {
            //Decode the JWT token 
            const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            if (decodedToken.exp < currentTime) {
                localStorage.removeItem("token"); //Remove expired token
                router.push("/login"); // Redirect to login
                return;
            }

            setIsAuthenticated(true);
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token"); //Handle invalid token
            router.push("/login");
        }
    }, [router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900">
                <span className="loading loading-bars loading-lg mb-4"></span>
                <h1 className="text-2xl font-semibold">Loading, please wait...</h1>
            </div>
        ); // Show loading while checking auth
    }

    return <>{children}</>; // Render protected content
}
