/**
 * CHAINTRACE // Automated Test Suite: Blockchain Provider Architecture
 * Covers: Wallet validation, provider selection, transaction normalization,
 * DEMO mode, LIVE mode configuration, missing API key, provider failure, and unsupported chains.
 */

import assert from 'node:assert';
import test from 'node:test';

import {
  EthereumProvider,
  TronProvider,
  PolygonProvider,
  BscProvider,
  BitcoinProvider,
  SolanaProvider,
  DemoBlockchainProvider,
  getBlockchainProvider,
  normalizeChainName,
  SUPPORTED_LIVE_CHAINS,
  BlockchainService,
  BlockchainError,
  PRIMARY_DEMO_WALLET,
  TRON_HAWALA_WALLET,
  BTC_WASABI_WALLET,
} from '../src/lib/blockchain';

test('1. Wallet Address Validation', async (t) => {
  await t.test('EthereumProvider validates 40-char EVM addresses', () => {
    const ethProvider = new EthereumProvider();
    assert.strictEqual(ethProvider.validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'), true);
    assert.strictEqual(ethProvider.validateAddress('0x71C8a77B280f9E0228372bF00000000000003aF9'), true);
    assert.strictEqual(ethProvider.validateAddress('0x12345'), false);
    assert.strictEqual(ethProvider.validateAddress('TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999'), false);
    assert.strictEqual(ethProvider.validateAddress(''), false);
  });

  await t.test('TronProvider validates Base58 Tron addresses', () => {
    const tronProvider = new TronProvider();
    assert.strictEqual(tronProvider.validateAddress('TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999'), true);
    assert.strictEqual(tronProvider.validateAddress('TR7NHqJEKQxGTCi8q8ZY4pL8otSzgjLj6t'), true);
    assert.strictEqual(tronProvider.validateAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'), false);
    assert.strictEqual(tronProvider.validateAddress('TWk93zM2sK8'), false);
  });

  await t.test('PolygonProvider validates Polygon EVM addresses', () => {
    const polyProvider = new PolygonProvider();
    assert.strictEqual(polyProvider.validateAddress('0x38b25A89d120B44e3bAc19777E576921319fe9A1'), true);
    assert.strictEqual(polyProvider.validateAddress('invalid_address'), false);
  });

  await t.test('Bitcoin & Solana stubs validate address syntax', () => {
    const btc = new BitcoinProvider();
    assert.strictEqual(btc.validateAddress('bc1q9v8h2kmz34pp78qwlk4xx00124w98e'), true);
    assert.strictEqual(btc.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'), true);
    assert.strictEqual(btc.validateAddress('0x123'), false);

    const sol = new SolanaProvider();
    assert.strictEqual(sol.validateAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), true);
    assert.strictEqual(sol.validateAddress('0x123'), false);
  });
});

test('2. Provider Selection and Registry', async (t) => {
  await t.test('Resolves canonical providers from chain aliases', () => {
    assert.strictEqual(getBlockchainProvider('ethereum').id, 'ethereum-provider');
    assert.strictEqual(getBlockchainProvider('eth').id, 'ethereum-provider');
    assert.strictEqual(getBlockchainProvider('erc20').id, 'ethereum-provider');

    assert.strictEqual(getBlockchainProvider('tron').id, 'tron-provider');
    assert.strictEqual(getBlockchainProvider('trx').id, 'tron-provider');
    assert.strictEqual(getBlockchainProvider('trc20').id, 'tron-provider');

    assert.strictEqual(getBlockchainProvider('polygon').id, 'polygon-provider');
    assert.strictEqual(getBlockchainProvider('matic').id, 'polygon-provider');
  });

  await t.test('Throws UNSUPPORTED_CHAIN for unknown chains', () => {
    assert.throws(
      () => getBlockchainProvider('dogecoin'),
      (err: unknown) => {
        return (
          err instanceof BlockchainError &&
          err.code === 'UNSUPPORTED_CHAIN' &&
          err.statusCode === 400
        );
      }
    );

    assert.throws(
      () => getBlockchainProvider('random_network'),
      (err: unknown) => {
        return err instanceof BlockchainError && err.code === 'UNSUPPORTED_CHAIN';
      }
    );
  });

  await t.test('Returns DemoBlockchainProvider when forceDemo is enabled', () => {
    const demoEth = getBlockchainProvider('ethereum', true);
    assert.strictEqual(demoEth.id, 'demo-provider');
  });
});

test('3. DEMO Mode Execution & Simulation Isolation', async (t) => {
  await t.test('DEMO mode explicitly marks data as demonstration', async () => {
    const result = await BlockchainService.queryAddress({
      address: PRIMARY_DEMO_WALLET.address,
      chain: 'tron',
      mode: 'demo',
    });

    assert.strictEqual(result.mode, 'demo');
    assert.strictEqual(result.isDemonstrationData, true);
    assert.strictEqual(result.providerInfo.live, false);
    assert.ok(result.transactions.length > 0, 'Should have demo transactions');
    assert.ok(result.balance.formatted.length > 0, 'Should have formatted balance');
  });

  await t.test('Demo provider handles Tron hawala target in demo mode', async () => {
    const result = await BlockchainService.queryAddress({
      address: TRON_HAWALA_WALLET.address,
      chain: 'tron',
      mode: 'demo',
    });

    assert.strictEqual(result.isDemonstrationData, true);
    assert.ok(result.transactions.length > 0);
  });
});

test('4. LIVE Mode Configuration & Missing API Key Handling', async (t) => {
  await t.test('LIVE mode Ethereum transaction indexing fails clearly if API key missing', async () => {
    const originalKey = process.env.ETHEREUM_API_KEY;
    delete process.env.ETHEREUM_API_KEY;

    const ethProvider = new EthereumProvider();
    await assert.rejects(
      async () => {
        await ethProvider.getTransactions('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      },
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'API_CONFIGURATION_ERROR');
        assert.strictEqual((err as BlockchainError).statusCode, 503);
        assert.match((err as BlockchainError).message, /requires ETHEREUM_API_KEY/);
        return true;
      }
    );

    // Restore key
    if (originalKey) process.env.ETHEREUM_API_KEY = originalKey;
  });

  await t.test('LIVE mode Polygon transaction indexing fails clearly if API key missing', async () => {
    const originalKey = process.env.POLYGON_API_KEY;
    delete process.env.POLYGON_API_KEY;

    const polyProvider = new PolygonProvider();
    await assert.rejects(
      async () => {
        await polyProvider.getTransactions('0x38b25A89d120B44e3bAc19777E576921319fe9A1');
      },
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'API_CONFIGURATION_ERROR');
        return true;
      }
    );

    if (originalKey) process.env.POLYGON_API_KEY = originalKey;
  });

  await t.test('LIVE mode never silently falls back to demo data on invalid wallet', async () => {
    await assert.rejects(
      async () => {
        await BlockchainService.queryAddress({
          address: 'invalid_non_evm_address',
          chain: 'ethereum',
          mode: 'live',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'INVALID_WALLET');
        assert.strictEqual((err as BlockchainError).statusCode, 400);
        return true;
      }
    );
  });
});

test('5. Extensibility Stubs & Future Chains', async (t) => {
  await t.test('BscProvider throws UNSUPPORTED_CHAIN with descriptive guidance', async () => {
    const bsc = new BscProvider();
    await assert.rejects(
      async () => bsc.getBalance(),
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'UNSUPPORTED_CHAIN');
        assert.match((err as BlockchainError).message, /Phase 2/);
        return true;
      }
    );
  });

  await t.test('BitcoinProvider throws UNSUPPORTED_CHAIN with descriptive guidance', async () => {
    const btc = new BitcoinProvider();
    await assert.rejects(
      async () => btc.getBalance(),
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'UNSUPPORTED_CHAIN');
        assert.match((err as BlockchainError).message, /Phase 2/);
        return true;
      }
    );
  });

  await t.test('SolanaProvider throws UNSUPPORTED_CHAIN with descriptive guidance', async () => {
    const sol = new SolanaProvider();
    await assert.rejects(
      async () => sol.getBalance(),
      (err: unknown) => {
        assert.ok(err instanceof BlockchainError);
        assert.strictEqual((err as BlockchainError).code, 'UNSUPPORTED_CHAIN');
        assert.match((err as BlockchainError).message, /Phase 2/);
        return true;
      }
    );
  });
});

test('6. Normalized Transaction Schema Verification', async () => {
  const demoProvider = new DemoBlockchainProvider('ethereum');
  const txs = await demoProvider.getTransactions('0x7a91bc84d2697e88b209eb0eac821639d4a44f82');

  assert.ok(txs.length > 0);
  const tx = txs[0];

  assert.ok(typeof tx.hash === 'string' && tx.hash.length > 0, 'hash required');
  assert.ok(typeof tx.chain === 'string', 'chain required');
  assert.ok(typeof tx.timestamp === 'number', 'timestamp must be unix timestamp');
  assert.ok(typeof tx.blockNumber === 'number', 'blockNumber required');
  assert.ok(typeof tx.from === 'string', 'from required');
  assert.ok(typeof tx.to === 'string', 'to required');
  assert.ok(typeof tx.asset === 'string', 'asset required');
  assert.ok(typeof tx.amount === 'string', 'amount required');
  assert.ok(
    tx.status === 'CONFIRMED' || tx.status === 'FAILED' || tx.status === 'PENDING',
    'status must be valid enum'
  );
});

test('7. Caching and Rate Limiting Protection', async (t) => {
  const { BlockchainCache } = await import('../src/lib/blockchain/cache');
  const testCache = new BlockchainCache(100); // 100ms TTL

  await t.test('Sets and retrieves cached values within TTL', () => {
    testCache.set('key-1', { data: 'test-value' });
    assert.deepStrictEqual(testCache.get('key-1'), { data: 'test-value' });
  });

  await t.test('Expires entries after TTL passes', async () => {
    testCache.set('key-expire', { temp: true }, 50);
    await new Promise((r) => setTimeout(r, 60));
    assert.strictEqual(testCache.get('key-expire'), null);
  });

  await t.test('Rate limiter blocks requests exceeding threshold', () => {
    const limiter = new BlockchainCache();
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(limiter.checkRateLimit('client-1', 5, 10000), true);
    }
    // 6th request exceeds limit
    assert.strictEqual(limiter.checkRateLimit('client-1', 5, 10000), false);
  });
});

test('8. Error Formatting and Serialization', () => {
  const err = new BlockchainError('RATE_LIMITED', 'Rate limit exceeded on Ethereum provider', {
    chain: 'ethereum',
    address: '0x123',
    statusCode: 429,
  });

  const payload = err.toJSON();
  assert.strictEqual(payload.code, 'RATE_LIMITED');
  assert.strictEqual(payload.statusCode, 429);
  assert.strictEqual(payload.chain, 'ethereum');
  assert.strictEqual(payload.address, '0x123');
  assert.strictEqual(payload.message, 'Rate limit exceeded on Ethereum provider');
});

