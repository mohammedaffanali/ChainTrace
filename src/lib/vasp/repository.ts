/**
 * CHAINTRACE // VASP Intelligence Database Repository
 * Transactional file-backed storage with memory-mapped indexing.
 */

let fsModule: any = null;
let pathModule: any = null;
if (typeof window === 'undefined') {
  try {
    fsModule = eval('require')('fs');
    pathModule = eval('require')('path');
  } catch {
    // Client or edge runtime fallback
  }
}
import {
  VaspEntity,
  VaspAddressEntity,
  WalletClusterEntity,
} from './types';
import {
  SEED_VASPS,
  SEED_CLUSTERS,
  SEED_ADDRESSES,
} from './seedData';

interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  vasps: VaspEntity[];
  clusters: WalletClusterEntity[];
  addresses: VaspAddressEntity[];
}

export class VaspRepository {
  private filePath: string;
  private isLoaded = false;

  private vasps = new Map<string, VaspEntity>();
  private clusters = new Map<string, WalletClusterEntity>();
  private addresses = new Map<string, VaspAddressEntity>();

  // Lookup Indices
  private addressIndex = new Map<string, VaspAddressEntity>(); // key: `${chain}:${normalizedAddress}`
  private addressesByVasp = new Map<string, Set<string>>(); // vaspId -> Set<addressId>
  private addressesByCluster = new Map<string, Set<string>>(); // clusterId -> Set<addressId>
  private clustersByVasp = new Map<string, Set<string>>(); // vaspId -> Set<clusterId>
  private clusterMemberAddresses = new Map<string, string>(); // makeIndexKey(addr, chain) -> clusterId

  private inMemoryOnly: boolean;

  constructor(filePath?: string, inMemoryOnly = false) {
    this.inMemoryOnly = inMemoryOnly || typeof window !== 'undefined';
    if (filePath) {
      this.filePath = filePath;
    } else if (pathModule) {
      this.filePath = pathModule.join(process.cwd(), 'data', 'vasp_database.json');
    } else {
      this.filePath = 'vasp_database.json';
    }
    if (this.inMemoryOnly) {
      this.isLoaded = true;
    }
  }

  /**
   * Canonical normalization for blockchain addresses:
   * EVM addresses (0x...) are lowercased; Base58 (Tron, Bitcoin, Solana) are preserved case-sensitively.
   */
  public static normalizeAddress(address: string, chain: string): string {
    const clean = (address || '').trim();
    const cleanChain = (chain || '').trim().toLowerCase();
    if (cleanChain === 'ethereum' || cleanChain === 'polygon' || cleanChain === 'bsc') {
      return clean.toLowerCase();
    }
    return clean;
  }

  private makeIndexKey(address: string, chain: string): string {
    const normAddr = VaspRepository.normalizeAddress(address, chain);
    const normChain = (chain || '').trim().toLowerCase();
    return `${normChain}:${normAddr}`;
  }

  /**
   * Initializes the repository from disk, or seeds if not present.
   */
  public async init(): Promise<void> {
    if (this.isLoaded) return;
    if (this.inMemoryOnly || !fsModule || !pathModule) {
      this.populateMemory({
        version: 1,
        lastUpdated: new Date().toISOString(),
        vasps: SEED_VASPS,
        clusters: SEED_CLUSTERS,
        addresses: SEED_ADDRESSES,
      });
      this.isLoaded = true;
      return;
    }

    try {
      const dir = pathModule.dirname(this.filePath);
      if (!fsModule.existsSync(dir)) {
        fsModule.mkdirSync(dir, { recursive: true });
      }

      if (fsModule.existsSync(this.filePath)) {
        const raw = fsModule.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(raw) as DatabaseSchema;
        this.populateMemory(data);
      } else {
        // Seed default verified and segregated demo records
        const seedPayload: DatabaseSchema = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          vasps: SEED_VASPS,
          clusters: SEED_CLUSTERS,
          addresses: SEED_ADDRESSES,
        };
        this.populateMemory(seedPayload);
        await this.persist();
      }
      this.isLoaded = true;
    } catch {
      // Fallback in-memory initialization if disk is read-only
      this.populateMemory({
        version: 1,
        lastUpdated: new Date().toISOString(),
        vasps: SEED_VASPS,
        clusters: SEED_CLUSTERS,
        addresses: SEED_ADDRESSES,
      });
      this.isLoaded = true;
    }
  }

  private populateMemory(data: DatabaseSchema): void {
    this.vasps.clear();
    this.clusters.clear();
    this.addresses.clear();
    this.addressIndex.clear();
    this.addressesByVasp.clear();
    this.addressesByCluster.clear();
    this.clustersByVasp.clear();

    for (const v of data.vasps || []) {
      this.vasps.set(v.id, v);
    }

    for (const c of data.clusters || []) {
      this.clusters.set(c.id, c);
      if (!this.clustersByVasp.has(c.vaspId)) {
        this.clustersByVasp.set(c.vaspId, new Set());
      }
      this.clustersByVasp.get(c.vaspId)!.add(c.id);
    }

    for (const a of data.addresses || []) {
      this.addresses.set(a.id, a);
      const key = this.makeIndexKey(a.address, a.chain);
      this.addressIndex.set(key, a);

      if (!this.addressesByVasp.has(a.vaspId)) {
        this.addressesByVasp.set(a.vaspId, new Set());
      }
      this.addressesByVasp.get(a.vaspId)!.add(a.id);

      if (a.clusterId) {
        if (!this.addressesByCluster.has(a.clusterId)) {
          this.addressesByCluster.set(a.clusterId, new Set());
        }
        this.addressesByCluster.get(a.clusterId)!.add(a.id);
      }
    }
  }

  private async persist(): Promise<void> {
    if (this.inMemoryOnly || !fsModule || !pathModule) return;

    const payload: DatabaseSchema = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      vasps: Array.from(this.vasps.values()),
      clusters: Array.from(this.clusters.values()),
      addresses: Array.from(this.addresses.values()),
    };

    const dir = pathModule.dirname(this.filePath);
    if (!fsModule.existsSync(dir)) {
      fsModule.mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${this.filePath}.tmp`;
    fsModule.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
    fsModule.renameSync(tempPath, this.filePath);
  }

  // ---------------------------------------------------------------------------
  // VASP Operations
  // ---------------------------------------------------------------------------

  public async getVaspById(id: string): Promise<VaspEntity | null> {
    await this.init();
    return this.vasps.get(id) || null;
  }

  public async getVaspByNameOrId(identifier: string): Promise<VaspEntity | null> {
    await this.init();
    const clean = identifier.trim().toLowerCase();
    const direct = this.vasps.get(identifier);
    if (direct) return direct;

    for (const v of this.vasps.values()) {
      if (
        v.id.toLowerCase() === clean ||
        v.name.toLowerCase() === clean ||
        v.legalName.toLowerCase() === clean ||
        v.name.toLowerCase().includes(clean)
      ) {
        return v;
      }
    }
    return null;
  }

  public async getAllVasps(filter?: { status?: string; registrationStatus?: string }): Promise<VaspEntity[]> {
    await this.init();
    let list = Array.from(this.vasps.values());
    if (filter?.status) {
      list = list.filter((v) => v.status === filter.status);
    }
    if (filter?.registrationStatus) {
      list = list.filter((v) => v.registrationStatus === filter.registrationStatus);
    }
    return list;
  }

  public async upsertVasp(
    input: any
  ): Promise<VaspEntity> {
    await this.init();
    const now = new Date().toISOString();
    const existing = this.vasps.get(input.id);
    const entity: VaspEntity = {
      id: input.id,
      name: input.name,
      legalName: input.legalName || input.legalEntityName || input.name,
      country: input.country || 'India',
      jurisdiction: input.jurisdiction || 'IND',
      registrationStatus: input.registrationStatus || (input.fiuStatus === 'REGISTERED' ? 'REGISTERED' : 'PENDING'),
      regulatoryIdentifier: input.regulatoryIdentifier || input.fiuRegistrationNumber || 'PENDING',
      website: input.website,
      status: input.status || 'ACTIVE',
      riskLevel: input.riskLevel || 'LOW',
      source: input.source || 'Statutory Filing',
      sourceType: input.sourceType || 'verified_public_source',
      createdAt: existing?.createdAt || input.createdAt || now,
      updatedAt: now,
    };
    this.vasps.set(entity.id, entity);
    await this.persist();
    return entity;
  }

  public async createVasp(
    input: Omit<VaspEntity, 'createdAt' | 'updatedAt'>
  ): Promise<VaspEntity> {
    return this.upsertVasp(input);
  }

  // ---------------------------------------------------------------------------
  // Cluster Operations
  // ---------------------------------------------------------------------------

  public async getClusterById(id: string): Promise<WalletClusterEntity | null> {
    await this.init();
    return this.clusters.get(id) || null;
  }

  public async getClustersByVasp(vaspId: string): Promise<WalletClusterEntity[]> {
    await this.init();
    const ids = this.clustersByVasp.get(vaspId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.clusters.get(id)!)
      .filter(Boolean);
  }

  public async upsertCluster(
    input: any
  ): Promise<WalletClusterEntity> {
    await this.init();
    const now = new Date().toISOString();
    const existing = this.clusters.get(input.id);
    const entity: WalletClusterEntity = {
      id: input.id,
      vaspId: input.vaspId,
      name: input.name,
      chain: input.chain || 'ethereum',
      confidence: input.confidence ?? 0.9,
      source: input.source || 'Heuristic Cluster',
      sourceType: input.sourceType || 'internal_intelligence',
      verificationStatus: input.verificationStatus || 'verified',
      createdAt: existing?.createdAt || input.createdAt || now,
      updatedAt: now,
    };
    this.clusters.set(entity.id, entity);

    if (!this.clustersByVasp.has(entity.vaspId)) {
      this.clustersByVasp.set(entity.vaspId, new Set());
    }
    this.clustersByVasp.get(entity.vaspId)!.add(entity.id);

    if (Array.isArray(input.addresses)) {
      for (const addr of input.addresses) {
        const key = this.makeIndexKey(addr, entity.chain);
        this.clusterMemberAddresses.set(key, entity.id);
      }
    }

    await this.persist();
    return entity;
  }

  public async findClusterByAddress(address: string, chain?: string): Promise<WalletClusterEntity | null> {
    await this.init();
    const cleanAddr = address.trim();
    if (chain) {
      const key = this.makeIndexKey(cleanAddr, chain);
      const clusterId = this.clusterMemberAddresses.get(key);
      if (clusterId) {
        return this.clusters.get(clusterId) || null;
      }
    }
    const norm = cleanAddr.toLowerCase();
    for (const [key, clusterId] of this.clusterMemberAddresses.entries()) {
      if (key.toLowerCase().endsWith(`:${norm}`) || key.endsWith(`:${cleanAddr}`)) {
        return this.clusters.get(clusterId) || null;
      }
    }
    for (const [key, addrEntity] of this.addressIndex.entries()) {
      if (key.toLowerCase().endsWith(`:${norm}`) || key.endsWith(`:${cleanAddr}`)) {
        if (addrEntity.clusterId) {
          const cluster = this.clusters.get(addrEntity.clusterId);
          if (cluster) return cluster;
        }
      }
    }
    return null;
  }

  public async createCluster(
    input: Omit<WalletClusterEntity, 'createdAt' | 'updatedAt'>
  ): Promise<WalletClusterEntity> {
    return this.upsertCluster(input);
  }

  // ---------------------------------------------------------------------------
  // Address Operations
  // ---------------------------------------------------------------------------

  public async isDuplicateAddress(address: string, chain: string): Promise<boolean> {
    await this.init();
    const key = this.makeIndexKey(address, chain);
    return this.addressIndex.has(key);
  }

  public async getAddress(address: string, chain: string): Promise<VaspAddressEntity | null> {
    await this.init();
    const key = this.makeIndexKey(address, chain);
    return this.addressIndex.get(key) || null;
  }

  public async getAddressesByVasp(vaspId: string): Promise<VaspAddressEntity[]> {
    await this.init();
    const ids = this.addressesByVasp.get(vaspId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.addresses.get(id)!)
      .filter(Boolean);
  }

  public async getAddressesByCluster(clusterId: string): Promise<VaspAddressEntity[]> {
    await this.init();
    const ids = this.addressesByCluster.get(clusterId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.addresses.get(id)!)
      .filter(Boolean);
  }

  public async upsertAddress(
    input: Omit<VaspAddressEntity, 'createdAt' | 'updatedAt'>,
    allowOverwrite = false
  ): Promise<VaspAddressEntity> {
    await this.init();
    const key = this.makeIndexKey(input.address, input.chain);
    const existing = this.addressIndex.get(key);

    const now = new Date().toISOString();

    if (existing) {
      if (!allowOverwrite) {
        throw new Error(
          `Address ${input.address} on chain ${input.chain} already exists for VASP ${existing.vaspId}.`
        );
      }
      const updated: VaspAddressEntity = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
      this.addresses.set(existing.id, updated);
      this.addressIndex.set(key, updated);
      await this.persist();
      return updated;
    }

    const newEntity: VaspAddressEntity = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    this.addresses.set(newEntity.id, newEntity);
    this.addressIndex.set(key, newEntity);

    if (!this.addressesByVasp.has(newEntity.vaspId)) {
      this.addressesByVasp.set(newEntity.vaspId, new Set());
    }
    this.addressesByVasp.get(newEntity.vaspId)!.add(newEntity.id);

    if (newEntity.clusterId) {
      if (!this.addressesByCluster.has(newEntity.clusterId)) {
        this.addressesByCluster.set(newEntity.clusterId, new Set());
      }
      this.addressesByCluster.get(newEntity.clusterId)!.add(newEntity.id);
    }

    await this.persist();
    return newEntity;
  }

  public async addAddress(
    input: any,
    allowOverwrite = false
  ): Promise<{ success: boolean; address?: VaspAddressEntity; error?: string }> {
    try {
      const address = await this.upsertAddress(
        {
          id: input.id || `addr-${input.vaspId}-${Date.now()}`,
          vaspId: input.vaspId,
          clusterId: input.clusterId,
          address: input.address,
          chain: input.chain,
          addressType: input.addressType || 'deposit',
          confidence: input.confidence ?? input.provenance?.confidence ?? 0.9,
          source: input.source || input.provenance?.source || 'Public Registry',
          sourceType: input.sourceType || input.provenance?.sourceType || 'verified_public_source',
          verificationStatus: input.verificationStatus || input.provenance?.verificationStatus || 'verified',
          verifiedAt: input.verifiedAt || input.provenance?.verifiedAt,
          notes: input.notes || input.provenance?.notes,
        },
        allowOverwrite
      );
      return { success: true, address };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to add address' };
    }
  }

  public async findAddress(address: string, chain: string): Promise<VaspAddressEntity | null> {
    return this.getAddress(address, chain);
  }

  public async listAddresses(filter?: { status?: string }): Promise<VaspAddressEntity[]> {
    await this.init();
    let list = Array.from(this.addresses.values());
    if (filter?.status) {
      list = list.filter((a) => a.verificationStatus === filter.status);
    }
    return list;
  }

  /**
   * Resets database to default seed state (used in migrations and test runs).
   */
  public async resetToSeed(): Promise<void> {
    const seedPayload: DatabaseSchema = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      vasps: SEED_VASPS,
      clusters: SEED_CLUSTERS,
      addresses: SEED_ADDRESSES,
    };
    this.populateMemory(seedPayload);
    await this.persist();
    this.isLoaded = true;
  }
}

// Global Singleton Repository
export const globalVaspRepository = new VaspRepository();
