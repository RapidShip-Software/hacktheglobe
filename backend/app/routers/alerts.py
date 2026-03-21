from fastapi import APIRouter

from ..models.schemas import Assessment
from ..services.supabase_client import get_high_risk_assessments

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[Assessment])
async def list_alerts() -> list[Assessment]:
    """Return all assessments with risk_score > 40."""
    assessments = get_high_risk_assessments(threshold=40.0)
    return [Assessment(**a) for a in assessments]
