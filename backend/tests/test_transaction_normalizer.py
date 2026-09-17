from app.services.transaction_normalizer import transaction_normalizer

def test_normalize_etherscan_raw():
    raw = {
        "hash": "0x5a183ff1098234ea71b293810283719028371920381023810238102839d81",
        "blockNumber": "19400210",
        "timeStamp": "1716300000",
        "from": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        "to": "0x28c6c06298d514db089934071355e5743bf21d60",
        "value": "1500000000000000000",
        "value_formatted": 1.5,
        "asset": "ETH",
        "is_error": False
    }

    normalized = transaction_normalizer.normalize_single(raw, network="ethereum", provider="etherscan_ethereum")
    assert normalized is not None
    assert normalized.transaction_hash == raw["hash"]
    assert normalized.block_number == 19400210
    assert normalized.timestamp == 1716300000
    assert normalized.value == 1.5
    assert normalized.asset == "ETH"
    assert normalized.network == "ethereum"
    assert normalized.status == "SUCCESS"
    assert normalized.from_address == "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"

def test_normalize_batch_and_deduplication():
    raw_list = [
        {
            "hash": "0xaaa111",
            "blockNumber": 100,
            "timestamp": 1000,
            "from": "0x111",
            "to": "0x222",
            "value": 2.0,
            "asset": "ETH"
        },
        {
            "hash": "0xaaa111", # Duplicate
            "blockNumber": 100,
            "timestamp": 1000,
            "from": "0x111",
            "to": "0x222",
            "value": 2.0,
            "asset": "ETH"
        },
        {
            "hash": "0xbbb222",
            "blockNumber": 200,
            "timestamp": 2000,
            "from": "0x222",
            "to": "0x333",
            "value": 5.0,
            "asset": "USDT"
        }
    ]

    deduped = transaction_normalizer.normalize_batch(raw_list, network="ethereum", provider="etherscan_ethereum")
    assert len(deduped) == 2
    # Sorted descending by timestamp/block
    assert deduped[0].transaction_hash == "0xbbb222"
    assert deduped[1].transaction_hash == "0xaaa111"
