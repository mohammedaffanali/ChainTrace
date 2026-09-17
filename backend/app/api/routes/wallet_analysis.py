import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.wallet_analysis import WalletAnalysisRecord
from app.services.wallet_analysis_service import wallet_analysis_service
from app.providers import ProviderError, RateLimitError, InvalidAddressError, UnsupportedNetworkError

logger = logging.getLogger("chaintrace.api.analysis")

router = APIRouter()

class WalletAnalysisRequest(BaseModel):
    address: str = Field(..., description="Target cryptocurrency wallet address (EVM hex or Tron Base58)")
    network: str = Field(default="ethereum", description="Target blockchain network, e.g. ethereum, polygon, tron")
    hops: int = Field(default=1, ge=1, le=3, description="Depth of transaction hops to traverse")

@router.post("/wallet", status_code=status.HTTP_200_OK)
async def analyze_wallet(
    payload: WalletAnalysisRequest,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes real-time on-chain blockchain intelligence analysis and explainable VASP attribution.
    """
    try:
        result = await wallet_analysis_service.run_analysis(
            address=payload.address,
            network=payload.network,
            hops=payload.hops
        )

        # Persist analysis docket to database
        try:
            record = WalletAnalysisRecord(
                id=result["analysis_id"],
                wallet_address=result["address"],
                network=result["network"],
                data_source=result["data_source"],
                latest_block=result["latest_block"],
                is_live_data=result["is_live_data"],
                balance_native=result.get("balance", {}).get("balance", 0.0),
                symbol=result.get("balance", {}).get("symbol", "ETH"),
                attribution_status=result.get("attribution", {}).get("status", "UNKNOWN"),
                attributed_vasp=result.get("attribution", {}).get("vasp_name"),
                confidence=result.get("attribution", {}).get("confidence", 0.0),
                graph_snapshot=result.get("graph", {}),
                raw_payload=result
            )
            db.add(record)
            await db.commit()
        except Exception as db_err:
            logger.warning(f"Database persist notice for analysis {result['analysis_id']}: {db_err}")
            await db.rollback()

        return result

    except InvalidAddressError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err.message)
    except UnsupportedNetworkError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err.message)
    except RateLimitError as err:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=err.message)
    except ProviderError as err:
        raise HTTPException(status_code=err.status_code, detail=err.message)
    except Exception as exc:
        logger.error(f"Unexpected error in wallet analysis: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine failure: {str(exc)}"
        )

@router.get("/{analysis_id}", status_code=status.HTTP_200_OK)
async def get_analysis_docket(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    stmt = select(WalletAnalysisRecord).where(WalletAnalysisRecord.id == analysis_id)
    res = await db.execute(stmt)
    record = res.scalars().first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis docket not found.")

    return record.raw_payload
