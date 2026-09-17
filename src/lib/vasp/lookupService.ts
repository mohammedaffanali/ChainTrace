/**
 * CHAINTRACE // VASP Intelligence Lookup Services
 * Strict provenance-backed resolution without speculative guessing.
 */

import {
  VaspLookupResult,
  ClusterLookupResult,
} from './types';
import { VaspRepository, globalVaspRepository } from './repository';

export class VaspLookupService {
  private repo: VaspRepository;

  constructor(repo?: VaspRepository) {
    this.repo = repo || globalVaspRepository;
  }

  /**
   * Evaluates whether an address has a verified association with a registered VASP.
   * Enforces zero-guessing: returns matched: false if no verified record or cluster exists.
   */
  async findVaspByAddress(address: string, chain: string): Promise<VaspLookupResult> {
    if (!address || !chain) {
      return {
        matched: false,
        associationType: 'UNKNOWN',
        associationDescription: 'No target address or network specified.',
      };
    }

    const cleanAddr = address.trim();
    const cleanChain = chain.trim().toLowerCase();

    // 1. Direct VASP Address match
    const addrRecord = await this.repo.getAddress(cleanAddr, cleanChain);

    if (addrRecord) {
      const vasp = await this.repo.getVaspById(addrRecord.vaspId);
      const cluster = addrRecord.clusterId
        ? await this.repo.getClusterById(addrRecord.clusterId)
        : undefined;

      const vaspName = vasp?.name || 'Registered VASP';
      const addressTypeLabel = addrRecord.addressType.replace('_', ' ');

      // Factual phrasing conforming to Step 9 (No overclaiming of ownership)
      let associationDescription: string;
      if (addrRecord.sourceType === 'demo_dataset') {
        associationDescription = `Demonstration dataset: simulated ${addressTypeLabel} association with ${vaspName} (Controlled Hackathon Test).`;
      } else {
        associationDescription = `Known ${addressTypeLabel} associated with ${vaspName} (Confidence: ${Math.round(addrRecord.confidence * 100)}%, Source: ${addrRecord.source}).`;
      }

      return {
        matched: true,
        associationType: 'KNOWN_VASP_ADDRESS',
        vasp: vasp || undefined,
        address: addrRecord,
        cluster: cluster || undefined,
        addressType: addrRecord.addressType,
        confidence: Math.round(addrRecord.confidence * 100),
        source: addrRecord.source,
        sourceType: addrRecord.sourceType,
        verificationStatus: addrRecord.verificationStatus,
        verifiedAt: addrRecord.verifiedAt,
        associationDescription,
        factualSummary: associationDescription,
      };
    }

    // 2. Check if address is linked to a VASP-associated cluster
    const clusterResult = await this.findVaspCluster(cleanAddr, cleanChain);
    if (clusterResult.matched && clusterResult.cluster && clusterResult.vasp) {
      const vaspName = clusterResult.vasp.name;
      const desc = `Address belongs to a cluster associated with ${vaspName} (${clusterResult.cluster.name}).`;
      return {
        matched: true,
        associationType: 'KNOWN_VASP_CLUSTER',
        vasp: clusterResult.vasp,
        cluster: clusterResult.cluster,
        confidence: Math.round((clusterResult.confidence ?? 0.9) * 100),
        source: clusterResult.source,
        sourceType: clusterResult.sourceType,
        verificationStatus: clusterResult.verificationStatus,
        associationDescription: desc,
        factualSummary: desc,
      };
    }

    // 3. No match found — strict zero-guessing
    const unknownDesc = 'No verified VASP association identified for this address on the specified network.';
    return {
      matched: false,
      associationType: 'UNKNOWN',
      confidence: 0,
      associationDescription: unknownDesc,
      factualSummary: unknownDesc,
    };
  }

  /**
   * Determines whether an address belongs to a known VASP-associated cluster.
   */
  async findVaspCluster(address: string, chain: string): Promise<ClusterLookupResult> {
    if (!address || !chain) {
      return { matched: false };
    }

    const cleanAddr = address.trim();
    const cleanChain = chain.trim().toLowerCase();

    // Check direct address's cluster link
    const addrRecord = await this.repo.getAddress(cleanAddr, cleanChain);
    if (addrRecord && addrRecord.clusterId) {
      const cluster = await this.repo.getClusterById(addrRecord.clusterId);
      if (cluster) {
        const vasp = await this.repo.getVaspById(cluster.vaspId);
        const clusterAddresses = await this.repo.getAddressesByCluster(cluster.id);
        return {
          matched: true,
          cluster,
          vasp: vasp || undefined,
          confidence: cluster.confidence,
          source: cluster.source,
          sourceType: cluster.sourceType,
          verificationStatus: cluster.verificationStatus,
          totalAddressesInCluster: clusterAddresses.length,
        };
      }
    }

    // Check cluster member address index
    const cluster = await this.repo.findClusterByAddress(cleanAddr, cleanChain);
    if (cluster) {
      const vasp = await this.repo.getVaspById(cluster.vaspId);
      const clusterAddresses = await this.repo.getAddressesByCluster(cluster.id);
      return {
        matched: true,
        cluster,
        vasp: vasp || undefined,
        confidence: cluster.confidence,
        source: cluster.source,
        sourceType: cluster.sourceType,
        verificationStatus: cluster.verificationStatus,
        totalAddressesInCluster: clusterAddresses.length,
      };
    }

    return { matched: false };
  }
}

// Global Singleton Lookup Service
export const globalVaspLookupService = new VaspLookupService();

export async function findVaspByAddress(
  address: string,
  chain: string
): Promise<VaspLookupResult> {
  return globalVaspLookupService.findVaspByAddress(address, chain);
}

export async function findVaspCluster(
  address: string,
  chain: string
): Promise<ClusterLookupResult> {
  return globalVaspLookupService.findVaspCluster(address, chain);
}
