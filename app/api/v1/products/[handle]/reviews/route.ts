import { NextRequest, NextResponse } from 'next/server';
import { mockReviews, genericReviews } from '@/data/mock/reviews';
import { z } from 'zod';

const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(1000),
  author: z.string().min(2).max(80),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_handle', handle)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Supabase not available — fall through to mock
  }

  const reviews =
    (mockReviews[handle] ?? []).length > 0
      ? mockReviews[handle]
      : genericReviews.map((r) => ({ ...r, product_handle: handle }));

  return NextResponse.json(reviews);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_handle: handle,
        rating: parsed.data.rating,
        body: parsed.data.body,
        author: parsed.data.author,
        approved: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, review: data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: true, pending: true }, { status: 201 });
  }
}
