import { uploadImageFromUrl } from "@/app/lib/uploadToCloudinary";
import { createImageFromUrlUploadRoute } from "@honeylemon/server/routes/images";

const { POST } = createImageFromUrlUploadRoute({ uploadImageFromUrl });

export { POST };
