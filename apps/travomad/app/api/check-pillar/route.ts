import { checkPillarExists } from "@/utils/helpers/pillarPageHelpers";
import { createCheckPillarApiHandlers } from "@honeylemon/server/routes/check-pillar";

export const dynamic = "force-dynamic";

const { GET } = createCheckPillarApiHandlers({ checkPillarExists });

export { GET };
