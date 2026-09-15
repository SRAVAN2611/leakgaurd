from sqlalchemy.orm import Session
from app.models.scan import ScanModel
from app.models.finding import FindingModel
from app.models.policy import PolicyModel
from datetime import datetime, timezone, timedelta

def get_analytics_data(db: Session) -> dict:
    total_scans = db.query(ScanModel).count()
    blocked_scans = db.query(ScanModel).filter(ScanModel.decision == "BLOCK").count()
    high_risk_scans = db.query(ScanModel).filter(ScanModel.severity.in_(["High", "Critical"])).count()
    active_policies = db.query(PolicyModel).filter(PolicyModel.enabled == True).count()
    
    scans = db.query(ScanModel).all()
    avg_proc_time = sum(s.processing_time_ms for s in scans) / max(1, len(scans)) if scans else 0.0
    
    # Time series points (past 7 days)
    now = datetime.now(timezone.utc)
    scans_over_time = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%b %d")
        day_scans = [s for s in scans if s.timestamp and s.timestamp.date() == day.date()]
        scans_over_time.append({
            "label": day_str,
            "scans": len(day_scans),
            "threats": sum(s.threat_count for s in day_scans),
            "blocks": sum(1 for s in day_scans if s.decision == "BLOCK")
        })
        
    # Categories
    findings = db.query(FindingModel).all()
    cat_dist = {}
    for f in findings:
        cat_dist[f.category] = cat_dist.get(f.category, 0) + 1
        
    sev_dist = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    input_type_dist = {"Text": 0, "Code": 0, "Image": 0}
    dec_dist = {"ALLOW": 0, "WARN": 0, "REDACT": 0, "BLOCK": 0}
    
    for s in scans:
        sev_dist[s.severity] = sev_dist.get(s.severity, 0) + 1
        input_type_dist[s.input_type] = input_type_dist.get(s.input_type, 0) + 1
        dec_dist[s.decision] = dec_dist.get(s.decision, 0) + 1
        
    return {
        "totalScans": total_scans,
        "blockedScans": blocked_scans,
        "highRiskScans": high_risk_scans,
        "activePolicies": active_policies,
        "avgProcessingTimeMs": round(avg_proc_time, 1),
        "scansOverTime": scans_over_time,
        "categoryDistribution": cat_dist,
        "severityDistribution": sev_dist,
        "inputTypeDistribution": input_type_dist,
        "decisionDistribution": dec_dist
    }
