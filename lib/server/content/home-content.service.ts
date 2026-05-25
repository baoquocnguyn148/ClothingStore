import { createAdminClient } from '@/lib/supabase/admin';
import {
  DEFAULT_HOME_CONTENT_MAP,
  HOME_CONTENT_BY_KEY,
  HOME_CONTENT_DEFAULTS,
  type HomeContentBlock,
  type HomeContentMap,
  mergeHomeContent,
} from '@/lib/home-content/defaults';

interface DbHomeContentBlock {
  key: string;
  section: string;
  label: string;
  value: string;
  type: HomeContentBlock['type'];
  sort_order: number;
}

interface DbCmsHomeContentPage {
  html_content: string | null;
}

const CMS_HOME_CONTENT_SLUG = 'home-content';

function mapBlock(row: DbHomeContentBlock): HomeContentBlock {
  return {
    key: row.key,
    section: row.section,
    label: row.label,
    value: row.value,
    type: row.type,
    sortOrder: row.sort_order,
  };
}

function isMissingHomeContentTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === 'string' ? candidate.code : '';
  const message = typeof candidate.message === 'string' ? candidate.message : '';

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST200' ||
    message.includes('home_content_blocks')
  );
}

function parseCmsContent(raw: string | null | undefined): HomeContentMap {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([key]) => Boolean(HOME_CONTENT_BY_KEY[key]))
        .map(([key, value]) => [key, String(value ?? '')])
    );
  } catch {
    return {};
  }
}

function blocksFromContentMap(content: HomeContentMap): HomeContentBlock[] {
  return HOME_CONTENT_DEFAULTS.map((defaultBlock) => ({
    ...defaultBlock,
    value: content[defaultBlock.key] ?? defaultBlock.value,
  }));
}

export class HomeContentService {
  private db = createAdminClient();

  async listBlocks(): Promise<HomeContentBlock[]> {
    return this.listBlocksFromHomeContentTable();
  }

  private async listBlocksFromHomeContentTable(): Promise<HomeContentBlock[]> {
    const { data, error } = await this.db
      .from('home_content_blocks')
      .select('key, section, label, value, type, sort_order')
      .order('sort_order', { ascending: true });

    if (error) {
      if (isMissingHomeContentTableError(error)) {
        return this.listBlocksFromCmsPage();
      }

      throw error;
    }

    const rowsByKey = new Map((data ?? []).map((row) => [row.key, row as DbHomeContentBlock]));

    return HOME_CONTENT_DEFAULTS.map((defaultBlock) => {
      const saved = rowsByKey.get(defaultBlock.key);
      return saved ? mapBlock(saved) : defaultBlock;
    });
  }

  private async listBlocksFromCmsPage(): Promise<HomeContentBlock[]> {
    const content = await this.readCmsContentMap();
    return blocksFromContentMap(mergeHomeContent(content));
  }

  private async readCmsContentMap(): Promise<HomeContentMap> {
    const { data, error } = await this.db
      .from('cms_pages')
      .select('html_content')
      .eq('slug', CMS_HOME_CONTENT_SLUG)
      .maybeSingle();

    if (error) throw error;

    return parseCmsContent((data as DbCmsHomeContentPage | null)?.html_content);
  }

  async getContentMap(): Promise<HomeContentMap> {
    const blocks = await this.listBlocks();
    return mergeHomeContent(Object.fromEntries(blocks.map((block) => [block.key, block.value])));
  }

  async updateValues(values: HomeContentMap): Promise<HomeContentBlock[]> {
    const rows = Object.entries(values).map(([key, value]) => {
      const definition = HOME_CONTENT_BY_KEY[key];
      if (!definition) {
        throw new Error(`Unsupported home content key: ${key}`);
      }

      return {
        key,
        section: definition.section,
        label: definition.label,
        value: String(value ?? ''),
        type: definition.type,
        sort_order: definition.sortOrder,
        updated_at: new Date().toISOString(),
      };
    });

    if (rows.length === 0) {
      return this.listBlocks();
    }

    const { error } = await this.db
      .from('home_content_blocks')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      if (isMissingHomeContentTableError(error)) {
        return this.updateValuesInCmsPage(values);
      }

      throw error;
    }

    return this.listBlocksFromHomeContentTable();
  }

  private async updateValuesInCmsPage(values: HomeContentMap): Promise<HomeContentBlock[]> {
    const current = await this.readCmsContentMap();
    const content = mergeHomeContent({ ...current, ...values });
    const { error } = await this.db
      .from('cms_pages')
      .upsert(
        {
          slug: CMS_HOME_CONTENT_SLUG,
          title: 'Home Content',
          html_content: JSON.stringify(content),
          published: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

    if (error) throw error;
    return blocksFromContentMap(content);
  }

  async ensureDefaults(): Promise<void> {
    await this.updateValues(DEFAULT_HOME_CONTENT_MAP);
  }
}
