/**
 * CHAINTRACE // API Route: POST /api/vasp/import
 * Safe VASP intelligence import endpoint supporting JSON and CSV.
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalVaspImportService } from '@/lib/vasp/importService';
import { VaspImportRecord } from '@/lib/vasp/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let records: Partial<VaspImportRecord>[] = [];
    let allowOverwrite = false;

    if (contentType.includes('text/csv')) {
      const csvText = await req.text();
      const rawRows = globalVaspImportService.parseCsv(csvText);
      records = rawRows.map((row) => ({
        vasp: row.vasp || row.vaspName || row.name,
        chain: row.chain || row.network,
        address: row.address,
        addressType: (row.addressType || row.type || 'deposit') as any,
        source: row.source || 'CSV Import',
        sourceType: (row.sourceType as any) || 'internal_intelligence',
        confidence: row.confidence ? parseFloat(row.confidence) : 0.90,
        verificationStatus: (row.verificationStatus as any) || 'verified',
        clusterName: row.clusterName || row.cluster,
        notes: row.notes,
      }));
    } else {
      const body = await req.json();
      allowOverwrite = Boolean(body.allowOverwrite);

      if (body.csvText) {
        const rawRows = globalVaspImportService.parseCsv(body.csvText);
        records = rawRows.map((row) => ({
          vasp: row.vasp || row.vaspName || row.name,
          chain: row.chain || row.network,
          address: row.address,
          addressType: (row.addressType || row.type || 'deposit') as any,
          source: row.source || 'CSV Text Import',
          sourceType: (row.sourceType as any) || 'internal_intelligence',
          confidence: row.confidence ? parseFloat(row.confidence) : 0.90,
          verificationStatus: (row.verificationStatus as any) || 'verified',
          clusterName: row.clusterName || row.cluster,
          notes: row.notes,
        }));
      } else if (Array.isArray(body.records)) {
        records = body.records;
      } else if (Array.isArray(body)) {
        records = body;
      } else {
        return NextResponse.json(
          { error: 'Invalid import payload. Expected array of records or csvText field.' },
          { status: 400 }
        );
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No intelligence records found in submitted payload.' },
        { status: 400 }
      );
    }

    const report = await globalVaspImportService.importRecords(records, {
      allowOverwrite,
    });

    return NextResponse.json(report, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Import processing failed' },
      { status: 500 }
    );
  }
}
