import { uploadImage } from "@/app/lib/uploadToCloudinary";
import { createMultipartImageUploadRoute } from "@honeylemon/server/routes/images";

const { POST } = createMultipartImageUploadRoute({ uploadImage });

export { POST };
