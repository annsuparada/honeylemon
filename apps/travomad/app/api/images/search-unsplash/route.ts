import { searchImages } from "@/lib/unsplash";
import { createUnsplashSearchRoute } from "@honeylemon/server/routes/images";

const { POST } = createUnsplashSearchRoute({ searchImages });

export { POST };
