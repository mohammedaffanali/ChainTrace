import pytest
from app.providers import (
    get_provider,
    UnsupportedNetworkError,
    InvalidAddressError,
    RateLimitError,
    ProviderError
)
from app.providers.alchemy_provider import AlchemyProvider
from app.providers.etherscan_provider import EtherscanProvider
from app.providers.tron_provider import TronGridProvider

def test_provider_factory_and_network_support():
    eth_provider = get_provider("ethereum")
    assert eth_provider.network == "ethereum"

    polygon_provider = get_provider("polygon")
    assert polygon_provider.network == "polygon"

    tron_provider = get_provider("tron")
    assert tron_provider.network == "tron"

    with pytest.raises(UnsupportedNetworkError):
        get_provider("solana")

def test_address_validation():
    eth = EtherscanProvider(network="ethereum")
    assert eth.validate_address("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045") is True
    assert eth.validate_address("0x28C6c06298d514Db089934071355E5743bf21d60") is True
    assert eth.validate_address("invalid_address") is False
    assert eth.validate_address("") is False

    tron = TronGridProvider()
    assert tron.validate_address("TWk93zM2sK8QpM9xLt98234ea71b2938102") is False # length check
    assert tron.validate_address("TYD5H3vi1sz2rXXg7c1QWB69zdtGYFxZRQ") is True
    assert tron.validate_address("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045") is False

def test_alchemy_webhook_signature_verification():
    raw_body = b'{"type":"ADDRESS_ACTIVITY","id":"test-123"}'
    secret_key = "whsec_chaintrace_test_secret_2026"

    import hmac
    import hashlib
    valid_sig = hmac.new(secret_key.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()

    assert AlchemyProvider.verify_webhook_signature(raw_body, valid_sig, secret_key) is True
    assert AlchemyProvider.verify_webhook_signature(raw_body, "wrong_signature", secret_key) is False
    assert AlchemyProvider.verify_webhook_signature(raw_body, valid_sig, "wrong_secret") is False
    assert AlchemyProvider.verify_webhook_signature(raw_body, "", secret_key) is False

def test_error_hierarchy():
    rl = RateLimitError("Rate limit hit", "etherscan_ethereum", retry_after=10)
    assert rl.status_code == 429
    assert rl.retry_after == 10
    d = rl.to_dict()
    assert d["error"] == "RateLimitError"
    assert d["status_code"] == 429

    inv = InvalidAddressError("Bad hex", "etherscan_ethereum")
    assert inv.status_code == 400
