/**
 * CHAINTRACE // API Route: GET & POST /api/vasp
 * Registry of Virtual Asset Service Providers with provenance metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalVaspRepository } from '@/lib/vasp/repository';
import { VaspEntity } from '@/lib/vasp/types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const registrationStatus = searchParams.get('registrationStatus') || undefined;

    const vasps = await globalVaspRepository.getAllVasps({
      status,
      registrationStatus,
    });

    // Enrich with address counts and cluster counts
    const enriched = await Promise.all(
      vasps.map(async (v) => {
        const addresses = await globalVaspRepository.getAddressesByVasp(v.id);
        const clusters = await globalVaspRepository.getClustersByVasp(v.id);
        return {
          ...v,
          totalVerifiedAddresses: addresses.filter((a) => a.verificationStatus === 'verified').length,
          totalAddresses: addresses.length,
          totalClusters: clusters.length,
        };
      })
    );

    return NextResponse.json({
      total: enriched.length,
      vasps: enriched,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Failed to retrieve VASP registry' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.legalName || !body.regulatoryIdentifier) {
      return NextResponse.json(
        { error: 'name, legalName, and regulatoryIdentifier are required fields.' },
        { status: 400 }
      );
    }

    const id = body.id || `vasp-${body.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const vaspInput: Omit<VaspEntity, 'createdAt' | 'updatedAt'> = {
      id,
      name: body.name.trim(),
      legalName: body.legalName.trim(),
      country: body.country || 'India',
      jurisdiction: body.jurisdiction || 'India',
      registrationStatus: body.registrationStatus || 'REGISTERED',
      regulatoryIdentifier: body.regulatoryIdentifier.trim(),
      website: body.website,
      status: body.status || 'ACTIVE',
      riskLevel: body.riskLevel || 'LOW',
      source: body.source || 'Investigator Verification',
      sourceType: body.sourceType || 'investigator_verified',
    };

    const created = await globalVaspRepository.createVasp(vaspInput);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Failed to create VASP entity' },
      { status: 500 }
    );
  }
}
