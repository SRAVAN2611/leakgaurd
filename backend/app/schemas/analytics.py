from pydantic import BaseModel
from typing import List, Dict

class TimeSeriesPoint(BaseModel):
    label: str
    scans: int
    threats: int
    blocks: int

class AnalyticsOverviewResponse(BaseModel):
    totalScans: int
    blockedScans: int
    highRiskScans: int
    activePolicies: int
    avgProcessingTimeMs: float
    scansOverTime: List[TimeSeriesPoint]
    categoryDistribution: Dict[str, int]
    severityDistribution: Dict[str, int]
    inputTypeDistribution: Dict[str, int]
    decisionDistribution: Dict[str, int]
