import { NextResponse } from 'next/server';

// Simple placeholder discount logic; replace with real validation
const CODES: Record<string, { type: 'percentage' | 'amount'; value: number }> = {
  TJ20: { type: 'percentage', value: 20 },
  LAUNCH10: { type: 'amount', value: 1000 }, // £10.00 in pence
};

export async function POST(req: Request) {
  try {
    const { code, amount } = await req.json();
    if (!code || typeof amount !== 'number') return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const entry = CODES[code.toUpperCase()];
    if (!entry) return NextResponse.json({ error: 'Invalid code' }, { status: 404 });

    const originalAmount = amount;
    const discountAmount = entry.type === 'percentage' ? Math.round((entry.value / 100) * originalAmount) : entry.value;
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    const savings = discountAmount;

    return NextResponse.json({
      discountCode: {
        code: code.toUpperCase(),
        description: entry.type === 'percentage' ? `${entry.value}% off` : `£${(entry.value / 100).toFixed(2)} off`,
        discountType: entry.type,
        discountValue: entry.value,
        discountAmount,
        originalAmount,
        finalAmount,
        savings,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}


