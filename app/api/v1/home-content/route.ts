import { jsonOk, isSupabaseMode } from '@/lib/api/response';
import { DEFAULT_HOME_CONTENT_MAP, mergeHomeContent } from '@/lib/home-content/defaults';
import { HomeContentService } from '@/lib/server/content/home-content.service';

export async function GET() {
  if (!isSupabaseMode()) {
    return jsonOk({ content: DEFAULT_HOME_CONTENT_MAP });
  }

  try {
    const content = await new HomeContentService().getContentMap();
    return jsonOk({ content });
  } catch {
    return jsonOk({ content: mergeHomeContent() });
  }
}
