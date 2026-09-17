import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { VaspRepository } from '../src/lib/vasp/repository';
import { VaspLookupService } from '../src/lib/vasp/lookupService';
import { VaspImportService } from '../src/lib/vasp/importService';
import {
  VaspEntity,
  VaspAddressEntity,
  WalletClusterEntity,
} from '../src/lib/vasp/types';

describe('PHASE 2 â€” VASP Intelligence Database & Lookup System', () => {
  let repository: VaspRepository;
  let lookupService: VaspLookupService;
  let importService: VaspImportService;

  beforeEach(() => {
    // Isolated in-memory repository for each test
    repository = new VaspRepository(undefined, true);
    lookupService = new VaspLookupService(repository);
    importService = new VaspImportService(repository);
  });

  describe('VaspRepository - Entity & Address Management', () => {
    it('should register a new VASP entity and retrieve it by ID', async () => {
      const vasp: VaspEntity = {
        id: 'coindcx',
        name: 'CoinDCX',
        legalName: 'Neblio Technologies Private Limited',
        regulatoryIdentifier: 'FIU-IND-2023-DCX01',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'Statutory Registry',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.upsertVasp(vasp);
      const retrieved = await repository.getVaspById('coindcx');

      assert.ok(retrieved);
      assert.equal(retrieved.name, 'CoinDCX');
      assert.equal(retrieved.regulatoryIdentifier, 'FIU-IND-2023-DCX01');
    });

    it('should register a VASP address with complete provenance metadata', async () => {
      const vasp: VaspEntity = {
        id: 'wazirx',
        name: 'WazirX',
        legalName: 'Zanmai Labs Pvt Ltd',
        regulatoryIdentifier: 'FIU-IND-2023-WAZ02',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'FIU-IND',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);

      const addressEntity: VaspAddressEntity = {
        id: 'addr_waz_1',
        vaspId: 'wazirx',
        chain: 'ethereum',
        address: '0x27ec759021a00a12e5e4905187d3a04a60037a3c',
        addressType: 'hot_wallet',
        confidence: 0.98,
        source: 'FIU-IND Regulatory Filing & Public Exchange Sweep',
        sourceType: 'verified_public_source',
        verificationStatus: 'verified',
        verifiedAt: '2024-01-15T00:00:00Z',
        notes: 'Verified via statutory declaration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await repository.addAddress(addressEntity);
      assert.equal(result.success, true);

      // Verify retrieval by exact address
      const retrieved = await repository.findAddress('0x27ec759021a00a12e5e4905187d3a04a60037a3c', 'ethereum');
      assert.ok(retrieved);
      assert.equal(retrieved.vaspId, 'wazirx');
      assert.equal(retrieved.addressType, 'hot_wallet');
      assert.equal(retrieved.confidence, 0.98);
      assert.equal(retrieved.verificationStatus, 'verified');
    });

    it('should normalize EVM addresses to lowercase and prevent duplicates', async () => {
      const vasp: VaspEntity = {
        id: 'binance',
        name: 'Binance',
        legalName: 'Binance Holdings Ltd',
        regulatoryIdentifier: 'FIU-IND-2024-BIN09',
        jurisdiction: 'GLOBAL',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'MEDIUM',
        country: 'Seychelles',
        source: 'Regulatory Filing',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);

      const addr1: VaspAddressEntity = {
        id: 'b1',
        vaspId: 'binance',
        chain: 'ethereum',
        address: '0x28C6c06298d514Db089934071355E5743bf21d60', // mixed case
        addressType: 'deposit',
        confidence: 0.99,
        source: 'Arkham Intelligence',
        sourceType: 'licensed_intelligence_provider',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res1 = await repository.addAddress(addr1);
      assert.equal(res1.success, true);

      // Attempt adding same address in lowercase
      const addr2: VaspAddressEntity = {
        id: 'b2',
        vaspId: 'binance',
        chain: 'ethereum',
        address: '0x28c6c06298d514db089934071355e5743bf21d60', // lowercase
        addressType: 'deposit',
        confidence: 0.5,
        source: 'Demo',
        sourceType: 'demo_dataset',
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res2 = await repository.addAddress(addr2);
      assert.equal(res2.success, false);
      assert.match(res2.error || '', /already exists/i);

      // Lookup with uppercase should still succeed
      const found = await repository.findAddress('0X28C6C06298D514DB089934071355E5743BF21D60', 'ethereum');
      assert.ok(found);
      assert.equal(found.vaspId, 'binance');
    });

    it('should preserve exact case for TRON base58 addresses', async () => {
      const vasp: VaspEntity = {
        id: 'htx',
        name: 'HTX',
        legalName: 'HTX Global',
        regulatoryIdentifier: 'UNREGISTERED-OFFSHORE',
        jurisdiction: 'GLOBAL',
        registrationStatus: 'NON_COMPLIANT',
        status: 'ACTIVE',
        riskLevel: 'HIGH',
        country: 'Seychelles',
        source: 'Investigation',
        sourceType: 'internal_intelligence',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);

      const tronAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const addrEntity: VaspAddressEntity = {
        id: 'htx_tron',
        vaspId: 'htx',
        chain: 'tron',
        address: tronAddress,
        addressType: 'hot_wallet',
        confidence: 0.95,
        source: 'On-chain heuristics',
        sourceType: 'internal_intelligence',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.addAddress(addrEntity);

      // Exact case should match
      const matched = await repository.findAddress(tronAddress, 'tron');
      assert.ok(matched);
      assert.equal(matched.address, tronAddress);

      // Changed case in Base58 should NOT match (TRON addresses are case-sensitive Base58Check)
      const wrongCase = 'tr7nhqjekqxgtci8q8zy4pl8otszgjlj6t';
      const notMatched = await repository.findAddress(wrongCase, 'tron');
      assert.equal(notMatched, null);
    });

    it('should manage relational wallet clusters: VASP -> Cluster -> Addresses', async () => {
      const vasp: VaspEntity = {
        id: 'coinswitch',
        name: 'CoinSwitch',
        legalName: 'Bitcipher Labs LLP',
        regulatoryIdentifier: 'FIU-IND-2023-CS03',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'FIU-IND',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);

      const cluster: WalletClusterEntity & { addresses?: string[] } = {
        id: 'cs_cluster_1',
        vaspId: 'coinswitch',
        name: 'CoinSwitch EVM Sweeper Cluster',
        chain: 'ethereum',
        confidence: 0.92,
        source: 'Common input ownership',
        sourceType: 'internal_intelligence',
        verificationStatus: 'verified',
        addresses: [
          '0x1111111111111111111111111111111111111111',
          '0x2222222222222222222222222222222222222222',
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.upsertCluster(cluster);

      const retrievedCluster = await repository.getClusterById('cs_cluster_1');
      assert.ok(retrievedCluster);

      // Find cluster by member address
      const foundCluster = await repository.findClusterByAddress('0x2222222222222222222222222222222222222222');
      assert.ok(foundCluster);
      assert.equal(foundCluster.vaspId, 'coinswitch');
    });
  });

  describe('VaspLookupService - Anti-Overclaiming & Zero-Guessing', () => {
    beforeEach(async () => {
      // Seed an authorized VASP with an address and a cluster
      const vasp: VaspEntity = {
        id: 'coindcx',
        name: 'CoinDCX',
        legalName: 'Neblio Technologies Private Limited',
        regulatoryIdentifier: 'FIU-IND-2023-DCX01',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'FIU-IND',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);

      const verifiedAddress: VaspAddressEntity = {
        id: 'addr_dcx_hot',
        vaspId: 'coindcx',
        chain: 'ethereum',
        address: '0x38b2585f9b4c06283ee91e92d77d70bcbe7b1154',
        addressType: 'deposit',
        confidence: 0.99,
        source: 'FIU-IND Verified Registry',
        sourceType: 'verified_public_source',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.addAddress(verifiedAddress);

      const cluster: WalletClusterEntity & { addresses?: string[] } = {
        id: 'cluster_dcx_cold',
        vaspId: 'coindcx',
        name: 'CoinDCX Cold Storage Multi-sig Cluster',
        chain: 'ethereum',
        confidence: 0.94,
        source: 'Co-spend correlation',
        sourceType: 'internal_intelligence',
        verificationStatus: 'verified',
        addresses: ['0x4444444444444444444444444444444444444444'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertCluster(cluster);
    });

    it('should return KNOWN_VASP_ADDRESS for direct address match with factual wording', async () => {
      const result = await lookupService.findVaspByAddress(
        '0x38b2585f9b4c06283ee91e92d77d70bcbe7b1154',
        'ethereum'
      );

      assert.equal(result.matched, true);
      assert.equal(result.associationType, 'KNOWN_VASP_ADDRESS');
      assert.equal(result.vasp?.id, 'coindcx');
      assert.equal(result.confidence, 99);
      // Verify anti-overclaiming: never say "owned by VASP"
      assert.doesNotMatch(result.factualSummary || '', /is owned by/i);
      assert.match(result.factualSummary || '', /associated with/i);
    });

    it('should return KNOWN_VASP_CLUSTER for cluster-associated address', async () => {
      const result = await lookupService.findVaspByAddress(
        '0x4444444444444444444444444444444444444444',
        'ethereum'
      );

      assert.equal(result.matched, true);
      assert.equal(result.associationType, 'KNOWN_VASP_CLUSTER');
      assert.equal(result.vasp?.id, 'coindcx');
      assert.equal(result.cluster?.id, 'cluster_dcx_cold');
      // Verify anti-overclaiming
      assert.doesNotMatch(result.factualSummary || '', /is owned by/i);
      assert.match(result.factualSummary || '', /cluster associated with/i);
    });

    it('should return UNKNOWN with zero guessing for unattributed addresses', async () => {
      const result = await lookupService.findVaspByAddress(
        '0x9999999999999999999999999999999999999999',
        'ethereum'
      );

      assert.equal(result.matched, false);
      assert.equal(result.associationType, 'UNKNOWN');
      assert.equal(result.vasp, undefined);
      assert.equal(result.address, undefined);
      assert.equal(result.cluster, undefined);
      assert.equal(result.confidence, 0);
      assert.match(result.factualSummary || '', /no verified vasp association/i);
    });

    it('should return UNKNOWN if chain does not match', async () => {
      // The address exists on ethereum, but queried on polygon
      const result = await lookupService.findVaspByAddress(
        '0x38b2585f9b4c06283ee91e92d77d70bcbe7b1154',
        'polygon'
      );

      assert.equal(result.matched, false);
      assert.equal(result.associationType, 'UNKNOWN');
    });
  });

  describe('VaspImportService - Safe Import & Validation', () => {
    beforeEach(async () => {
      const vasp: VaspEntity = {
        id: 'coindcx',
        name: 'CoinDCX',
        legalName: 'Neblio Technologies Private Limited',
        regulatoryIdentifier: 'FIU-IND-2023-DCX01',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'FIU-IND',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertVasp(vasp);
    });

    it('should successfully import valid JSON VASP intelligence records', async () => {
      const jsonRecords = [
        {
          vaspId: 'coindcx',
          chain: 'ethereum',
          address: '0x1234567890123456789012345678901234567890',
          addressType: 'deposit' as const,
          label: 'Inflow Deposit 1',
          source: 'Law Enforcement Subpoena #104',
          sourceType: 'investigator_verified' as const,
          confidence: 0.95,
          verificationStatus: 'verified' as const,
        },
        {
          vaspId: 'coindcx',
          chain: 'tron',
          address: 'TLyqz4YGLFi9WnRZXuW6D4Em8eW4Twnzcc',
          addressType: 'operational' as const,
          label: 'Tron Operational Hot Wallet',
          source: 'Court Production Order',
          sourceType: 'investigator_verified' as const,
          confidence: 0.99,
          verificationStatus: 'verified' as const,
        },
      ];

      const report = await importService.importFromJson(jsonRecords);
      assert.equal(report.success, true);
      assert.equal(report.importedCount, 2);
      assert.equal(report.skippedCount, 0);
      assert.equal(report.errors.length, 0);

      // Verify they are now in the repository
      const ethAddr = await repository.findAddress('0x1234567890123456789012345678901234567890', 'ethereum');
      assert.ok(ethAddr);
      assert.equal(ethAddr.addressType, 'deposit');

      const tronAddr = await repository.findAddress('TLyqz4YGLFi9WnRZXuW6D4Em8eW4Twnzcc', 'tron');
      assert.ok(tronAddr);
      assert.equal(tronAddr.addressType, 'operational');
    });

    it('should successfully import valid CSV VASP intelligence records', async () => {
      const csvData = `vaspId,chain,address,addressType,label,source,sourceType,confidence,verificationStatus
coindcx,ethereum,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,cold_wallet,DCX Vault 1,Statutory Disclosure,verified_public_source,0.99,verified
`;

      const report = await importService.importFromCsv(csvData);
      assert.equal(report.success, true);
      assert.equal(report.importedCount, 1);
      assert.equal(report.errors.length, 0);

      const found = await repository.findAddress('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'ethereum');
      assert.ok(found);
      assert.equal(found.addressType, 'cold_wallet');
    });

    it('should reject records with invalid address syntax for the chain', async () => {
      const invalidJson = [
        {
          vaspId: 'coindcx',
          chain: 'ethereum',
          address: 'invalid_eth_address_not_hex',
          addressType: 'deposit' as const,
          source: 'Public Web',
          confidence: 0.8,
        },
        {
          vaspId: 'coindcx',
          chain: 'tron',
          address: '0x1234567890123456789012345678901234567890', // ETH addr supplied for TRON chain
          addressType: 'deposit' as const,
          source: 'Public Web',
          confidence: 0.8,
        },
      ];

      const report = await importService.importFromJson(invalidJson);
      assert.equal(report.importedCount, 0);
      assert.equal(report.skippedCount, 0);
      assert.equal(report.errors.length, 2);
      assert.match(report.errors[0].reason || report.errors[0].error, /invalid ethereum address/i);
      assert.match(report.errors[1].reason || report.errors[1].error, /invalid tron address/i);
    });

    it('should reject records referencing non-existent VASP', async () => {
      const record = [
        {
          vaspId: 'non_existent_vasp',
          chain: 'ethereum',
          address: '0x1111111111111111111111111111111111111111',
          addressType: 'deposit' as const,
          source: 'Internal Research',
          confidence: 0.9,
        },
      ];

      const report = await importService.importFromJson(record);
      assert.equal(report.importedCount, 0);
      assert.equal(report.errorCount, 1);
      assert.match(report.errors[0].reason || report.errors[0].error, /does not exist/i);
    });

    it('should reject confidence outside 0.0 - 1.0 range', async () => {
      const record = [
        {
          vaspId: 'coindcx',
          chain: 'ethereum',
          address: '0x2222222222222222222222222222222222222222',
          addressType: 'deposit' as const,
          source: 'Test',
          confidence: 1.5, // Invalid > 1.0
        },
      ];

      const report = await importService.importFromJson(record);
      assert.equal(report.importedCount, 0);
      assert.equal(report.errorCount, 1);
      assert.match(report.errors[0].reason || report.errors[0].error, /confidence/i);
    });

    it('should reject unsupported chains or address types', async () => {
      const record = [
        {
          vaspId: 'coindcx',
          chain: 'unsupported_chain',
          address: '0x3333333333333333333333333333333333333333',
          addressType: 'invalid_type' as any,
          source: 'Test',
          confidence: 0.5,
        },
      ];

      const report = await importService.importFromJson(record);
      assert.equal(report.importedCount, 0);
      assert.equal(report.errorCount, 1);
      assert.match(report.errors[0].reason || report.errors[0].error, /unsupported chain/i);
    });

    it('should segregate demo datasets from verified datasets', async () => {
      const demoRecord = [
        {
          vaspId: 'coindcx',
          chain: 'ethereum',
          address: '0x5555555555555555555555555555555555555555',
          addressType: 'deposit' as const,
          source: 'Demo Dataset Simulation',
          sourceType: 'demo_dataset' as const,
          confidence: 0.6,
          verificationStatus: 'unverified' as const,
        },
      ];

      const report = await importService.importFromJson(demoRecord);
      assert.equal(report.importedCount, 1);

      const found = await repository.findAddress('0x5555555555555555555555555555555555555555', 'ethereum');
      assert.ok(found);
      assert.equal(found.sourceType, 'demo_dataset');
      assert.equal(found.verificationStatus, 'unverified');

      // Verified addresses should remain distinctly verified
      const verifiedList = await repository.listAddresses({ status: 'verified' });
      const foundInVerified = verifiedList.some((a) => a.address === '0x5555555555555555555555555555555555555555');
      assert.equal(foundInVerified, false);
    });
  });
});
