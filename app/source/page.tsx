import { permanentRedirect } from "next/navigation";
import { SOURCE_REPOSITORY_URL } from "../../lib/source-info";
export default function SourcePage() {
  permanentRedirect(SOURCE_REPOSITORY_URL);
}
