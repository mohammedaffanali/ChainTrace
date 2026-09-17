import pytest
from app.services.blockchain.web3_service import web3_service

def test_address_validation_valid_evm():
    valid_addr = "0x28c6c06298d514db089934071355e5743bf21d60"
    valid, checksum, err = web3_service.validate_and_checksum_address(valid_addr, "ethereum")
    assert valid is True
    assert checksum == "0x28C6c06298d514Db089934071355E5743bf21d60"
    assert err is None

def test_address_validation_invalid_evm():
    invalid_addr = "0xinvalidaddress12345"
    valid, checksum, err = web3_service.validate_and_checksum_address(invalid_addr, "ethereum")
    assert valid is False
    assert checksum is None
    assert err is not None
