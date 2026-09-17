/**
 * CHAINTRACE // Standardized Blockchain Provider Errors
 */

export type BlockchainErrorCode =
  | 'INVALID_WALLET'
  | 'UNSUPPORTED_CHAIN'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'API_CONFIGURATION_ERROR'
  | 'NO_TRANSACTION_DATA';

export interface BlockchainErrorPayload {
  code: BlockchainErrorCode;
  message: string;
  chain?: string;
  address?: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export class BlockchainError extends Error {
  public readonly code: BlockchainErrorCode;
  public readonly statusCode: number;
  public readonly chain?: string;
  public readonly address?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: BlockchainErrorCode,
    message: string,
    options?: {
      chain?: string;
      address?: string;
      details?: Record<string, unknown>;
      statusCode?: number;
    }
  ) {
    super(message);
    this.name = 'BlockchainError';
    this.code = code;
    this.chain = options?.chain;
    this.address = options?.address;
    this.details = options?.details;

    // Map error code to appropriate HTTP status code
    if (options?.statusCode) {
      this.statusCode = options.statusCode;
    } else {
      switch (code) {
        case 'INVALID_WALLET':
        case 'UNSUPPORTED_CHAIN':
          this.statusCode = 400;
          break;
        case 'NO_TRANSACTION_DATA':
          this.statusCode = 404;
          break;
        case 'RATE_LIMITED':
          this.statusCode = 429;
          break;
        case 'API_CONFIGURATION_ERROR':
          this.statusCode = 503;
          break;
        case 'PROVIDER_UNAVAILABLE':
        default:
          this.statusCode = 502;
          break;
      }
    }
  }

  toJSON(): BlockchainErrorPayload {
    return {
      code: this.code,
      message: this.message,
      chain: this.chain,
      address: this.address,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}
