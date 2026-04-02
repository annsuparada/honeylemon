import { uploadImage } from "@/app/lib/uploadToCloudinary";
import { createLegacyImageFieldUploadRoute } from "@honeylemon/server/routes/images";

const { POST } = createLegacyImageFieldUploadRoute({ uploadImage });

export { POST };
