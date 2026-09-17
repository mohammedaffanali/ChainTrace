from fastapi import APIRouter, HTTPException
from app.schemas.wallet import (
    AddressValidationRequest, AddressValidationResponse,
    WalletBalanceRequest, WalletBalanceResponse
)
from app.services.blockchain.web3_service import web3_service
from app.services.blockchain.tron_service import tron_service

router = APIRouter()

@router.post("/validate", response_model=AddressValidationResponse)
def validate_address(payload: AddressValidationRequest):
    chain = payload.chain.lower()
    if chain in ["ethereum", "polygon", "matic", "eth"]:
        valid, checksum, err = web3_service.validate_and_checksum_address(payload.address, chain)
        return AddressValidationResponse(
            address=payload.address,
            chain=chain,
            valid=valid,
            checksum_address=checksum,
            address_type="evm",
            message=err
        )
    elif chain in ["tron", "trx"]:
        valid, err = tron_service.validate_address(payload.address)
        return AddressValidationResponse(
            address=payload.address,
            chain=chain,
            valid=valid,
            checksum_address=payload.address if valid else None,
            address_type="tron_base58",
            message=err
        )
    else:
        return AddressValidationResponse(
            address=payload.address,
            chain=chain,
            valid=False,
            message=f"Unsupported chain {chain}"
        )

@router.post("/balance", response_model=WalletBalanceResponse)
def get_wallet_balance(payload: WalletBalanceRequest):
    chain = payload.chain.lower()
    if chain in ["ethereum", "polygon", "matic", "eth"]:
        res = web3_service.get_balance(payload.address, chain)
        return WalletBalanceResponse(
            address=res["address"],
            chain=res["chain"],
            balance_native=res["balance_native"],
            symbol=res["symbol"],
            block_number=res.get("block_number"),
            is_contract=res.get("is_contract", False),
            source=res.get("source", "web3.py")
        )
    else:
        return WalletBalanceResponse(
            address=payload.address,
            chain=chain,
            balance_native=0.0,
            symbol="TRX" if chain == "tron" else "NATIVE",
            source="mock/fallback"
        )

from app.services.graph.graph_service import graph_service
from pydantic import BaseModel

class WalletTraceRequest(BaseModel):
    address: str
    chain: str = "ethereum"
    max_hops: int = 3
    min_amount_usd: float = 0.0

@router.post("/trace")
def trace_wallet_flow(payload: WalletTraceRequest):
    """
    Direct synchronous graph trace for immediate interactive canvas visualization.
    """
    graph_data = graph_service.build_flow_graph(
        starting_address=payload.address,
        chain=payload.chain,
        max_hops=payload.max_hops
    )
    return graph_data

