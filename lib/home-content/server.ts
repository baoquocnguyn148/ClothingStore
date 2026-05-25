import { isSupabaseMode } from '@/lib/api/response';
import { HomeContentService } from '@/lib/server/content/home-content.service';
import {
  DEFAULT_HOME_CONTENT_MAP,
  mergeHomeContent,
  type HomeContentMap,
} from './defaults';

export async function getHomeContentMap(): Promise<HomeContentMap> {
  if (!isSupabaseMode()) {
    return DEFAULT_HOME_CONTENT_MAP;
  }

  try {
    return await new HomeContentService().getContentMap();
  } catch {
    return mergeHomeContent();
  }
}
