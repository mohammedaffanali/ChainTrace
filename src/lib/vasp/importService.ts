/**
 * CHAINTRACE // Safe VASP Intelligence Import Engine
 * Supports JSON arrays and CSV text with strict schema and blockchain validation.
 */

import {
  VaspImportRecord,
  ImportReport,
  ImportValidationError,
  VaspAddressEntity,
  VaspAddressType,
  ProvenanceSourceType,
} from './types';
import { VaspRepository, globalVaspRepository } from './repository';
import { normalizeChainName } from '../blockchain/registry';
import { EthereumProvider } from '../blockchain/providers/ethereumProvider';
import { TronProvider } from '../blockchain/providers/tronProvider';
import { PolygonProvider } from '../blockchain/providers/polygonProvider';
import { BitcoinProvider, SolanaProvider, BscProvider } from '../blockchain/providers/stubs';

const VALID_ADDRESS_TYPES = new Set<VaspAddressType>([
  'deposit',
  'hot_wallet',
  'cold_wallet',
  'withdrawal',
  'treasury',
  'operational',
  'unknown',
]);

const VALID_SOURCE_TYPES = new Set<ProvenanceSourceType>([
  'verified_public_source',
  'licensed_intelligence_provider',
  'investigator_verified',
  'internal_intelligence',
  'demo_dataset',
]);

export class VaspImportService {
  private repo: VaspRepository;

  private ethValidator = new EthereumProvider();
  private tronValidator = new TronProvider();
  private polyValidator = new PolygonProvider();
  private bscValidator = new BscProvider();
  private btcValidator = new BitcoinProvider();
  private solValidator = new SolanaProvider();

  constructor(repo?: VaspRepository) {
    this.repo = repo || globalVaspRepository;
  }

  /**
   * Validates blockchain address according to the specific network protocol.
   */
  public validateChainAddress(address: string, chain: string): boolean {
    const clean = (address || '').trim();
    if (!clean) return false;

    const normChain = normalizeChainName(chain);
    switch (normChain) {
      case 'ethereum':
        return this.ethValidator.validateAddress(clean);
      case 'tron':
        return this.tronValidator.validateAddress(clean);
      case 'polygon':
        return this.polyValidator.validateAddress(clean);
      case 'bsc':
        return this.bscValidator.validateAddress(clean);
      case 'bitcoin':
        return this.btcValidator.validateAddress(clean);
      case 'solana':
        return this.solValidator.validateAddress(clean);
      default:
        return false;
    }
  }

  /**
   * Parses CSV string into raw record objects.
   */
  public parseCsv(csvText: string): Record<string, string>[] {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const records: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle standard comma split (with basic quotes handling)
      const values: string[] = [];
      let inQuotes = false;
      let current = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.replace(/^["']|["']$/g, '') || '';
      });
      records.push(row);
    }

    return records;
  }

  /**
   * Imports VASP intelligence records (from parsed JSON or mapped CSV).
   */
  public async importRecords(
    records: Partial<VaspImportRecord>[],
    options?: { allowOverwrite?: boolean; autoProvisionVasp?: boolean }
  ): Promise<ImportReport> {
    const report: ImportReport = {
      success: true,
      totalSubmitted: records.length,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      importedAddresses: [],
    };

    for (let index = 0; index < records.length; index++) {
      const rowNum = index + 1;
      const raw = records[index];

      // 1. Required fields validation
      const vaspKey = raw.vasp || raw.vaspId;
      if (!vaspKey) {
        report.errorCount++;
        const msg = 'VASP identifier or name is required.';
        report.errors.push({ rowNumber: rowNum, field: 'vasp', error: msg, reason: msg });
        continue;
      }

      if (!raw.chain) {
        report.errorCount++;
        const msg = 'Blockchain network is required.';
        report.errors.push({ rowNumber: rowNum, field: 'chain', error: msg, reason: msg });
        continue;
      }

      if (!raw.address) {
        report.errorCount++;
        const msg = 'Address is required.';
        report.errors.push({ rowNumber: rowNum, field: 'address', error: msg, reason: msg });
        continue;
      }

      const chain = (raw.chain || '').trim().toLowerCase();
      const normChain = normalizeChainName(chain);

      // 2. Chain validation
      if (!normChain) {
        report.errorCount++;
        const msg = `Unsupported chain network '${raw.chain}'.`;
        report.errors.push({
          rowNumber: rowNum,
          field: 'chain',
          error: msg,
          reason: msg,
        });
        continue;
      }

      // 3. Address syntax validation
      const cleanAddr = raw.address.trim();
      if (!this.validateChainAddress(cleanAddr, normChain)) {
        report.errorCount++;
        const msg = `Invalid ${normChain} address '${cleanAddr}'.`;
        report.errors.push({
          rowNumber: rowNum,
          field: 'address',
          address: cleanAddr,
          error: msg,
          reason: msg,
        });
        continue;
      }

      // 4. AddressType validation
      const addressType = (raw.addressType || 'deposit').toLowerCase() as VaspAddressType;
      if (!VALID_ADDRESS_TYPES.has(addressType)) {
        report.errorCount++;
        const msg = `Invalid addressType '${raw.addressType}'. Supported: ${Array.from(VALID_ADDRESS_TYPES).join(', ')}.`;
        report.errors.push({
          rowNumber: rowNum,
          field: 'addressType',
          error: msg,
          reason: msg,
        });
        continue;
      }

      // 5. Confidence range validation (0.0 to 1.0)
      let confidence = 0.90;
      if (raw.confidence !== undefined && raw.confidence !== null) {
        const parsedConf = typeof raw.confidence === 'number' ? raw.confidence : parseFloat(String(raw.confidence));
        if (isNaN(parsedConf) || parsedConf < 0.0 || parsedConf > 1.0) {
          report.errorCount++;
          const msg = `Confidence '${raw.confidence}' is invalid. Must be between 0.0 and 1.0.`;
          report.errors.push({
            rowNumber: rowNum,
            field: 'confidence',
            error: msg,
            reason: msg,
          });
          continue;
        }
        confidence = parsedConf;
      }

      // 6. Source & SourceType validation
      const source = (raw.source || 'Imported Forensic Intelligence').trim();
      let sourceType: ProvenanceSourceType = 'internal_intelligence';
      if (raw.sourceType && VALID_SOURCE_TYPES.has(raw.sourceType as ProvenanceSourceType)) {
        sourceType = raw.sourceType as ProvenanceSourceType;
      }

      // 7. Resolve or check VASP entity
      let vasp = await this.repo.getVaspByNameOrId(vaspKey);
      if (!vasp) {
        if (options?.autoProvisionVasp) {
          const vaspId = `vasp-${vaspKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          vasp = await this.repo.createVasp({
            id: vaspId,
            name: vaspKey,
            legalName: vaspKey,
            country: 'Unspecified',
            jurisdiction: 'Unspecified',
            registrationStatus: 'PENDING',
            regulatoryIdentifier: 'PENDING_VERIFICATION',
            status: 'ACTIVE',
            riskLevel: 'MEDIUM',
            source,
            sourceType,
          });
        } else {
          report.errorCount++;
          const msg = `Referenced VASP '${vaspKey}' does not exist in repository.`;
          report.errors.push({
            rowNumber: rowNum,
            field: 'vasp',
            error: msg,
            reason: msg,
          });
          continue;
        }
      }

      // 8. Optional Cluster Resolution
      let clusterId: string | null = null;
      if (raw.clusterName) {
        const cleanClusterName = raw.clusterName.trim();
        const vaspClusters = await this.repo.getClustersByVasp(vasp.id);
        const existingCluster = vaspClusters.find(
          (c) => c.name.toLowerCase() === cleanClusterName.toLowerCase() && c.chain === normChain
        );

        if (existingCluster) {
          clusterId = existingCluster.id;
        } else {
          const newCluster = await this.repo.createCluster({
            id: `cluster-${vasp.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            vaspId: vasp.id,
            name: cleanClusterName,
            chain: normChain,
            confidence,
            source,
            sourceType,
            verificationStatus: raw.verificationStatus || 'verified',
          });
          clusterId = newCluster.id;
        }
      }

      // 9. Duplicate Address Check
      const isDuplicate = await this.repo.isDuplicateAddress(cleanAddr, normChain);
      if (isDuplicate && !options?.allowOverwrite) {
        report.skippedCount++;
        continue;
      }

      // 10. Persist Address
      const addressId = `addr-${vasp.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const imported = await this.repo.upsertAddress(
        {
          id: addressId,
          vaspId: vasp.id,
          clusterId,
          address: cleanAddr,
          chain: normChain,
          addressType,
          confidence,
          source,
          sourceType,
          verificationStatus: raw.verificationStatus || 'verified',
          verifiedAt: new Date().toISOString(),
          notes: raw.notes || `Imported via safe intelligence loader`,
        },
        options?.allowOverwrite
      );

      report.importedCount++;
      report.importedAddresses.push(imported);
    }

    report.success = report.errorCount === 0;
    return report;
  }

  public async importFromJson(
    records: any[],
    options?: { allowOverwrite?: boolean; autoProvisionVasp?: boolean }
  ): Promise<ImportReport> {
    const mapped: Partial<VaspImportRecord>[] = records.map((r) => ({
      vasp: r.vasp || r.vaspId,
      chain: r.chain,
      address: r.address,
      addressType: r.addressType,
      source: r.source || r.provenance?.source,
      sourceType: r.sourceType || r.provenance?.sourceType,
      confidence: r.confidence ?? r.provenance?.confidence,
      verificationStatus: r.verificationStatus || r.provenance?.verificationStatus,
      clusterName: r.clusterName,
      notes: r.notes || r.provenance?.notes,
    }));
    return this.importRecords(mapped, options);
  }

  public async importFromCsv(
    csvText: string,
    options?: { allowOverwrite?: boolean; autoProvisionVasp?: boolean }
  ): Promise<ImportReport> {
    const rawRows = this.parseCsv(csvText);
    const mapped: Partial<VaspImportRecord>[] = rawRows.map((r) => ({
      vasp: r.vasp || r.vaspId || r.vasp_id || r.name,
      chain: r.chain || r.network,
      address: r.address || r.wallet,
      addressType: (r.addressType || r.address_type || 'deposit') as VaspAddressType,
      source: r.source || 'CSV Import',
      sourceType: (r.sourceType || 'verified_public_source') as any,
      confidence: r.confidence ? parseFloat(r.confidence) : 0.9,
      verificationStatus: (r.verificationStatus || 'verified') as any,
      clusterName: r.clusterName || r.cluster,
      notes: r.notes || r.label,
    }));
    return this.importRecords(mapped, options);
  }
}

// Global Singleton Import Service
export const globalVaspImportService = new VaspImportService();
