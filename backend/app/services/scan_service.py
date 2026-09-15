import time
from sqlalchemy.orm import Session
from app.models.scan import ScanModel
from app.models.finding import FindingModel
from app.models.settings import SettingsModel
from app.services.detection_service import run_all_detectors
from app.services.risk_service import calculate_risk_score
from app.services.policy_service import evaluate_policies
from app.services.redaction_service import sanitize_content
from app.services.ocr_service import process_image_ocr

def execute_scan(
    db: Session,
    content: str,
    input_type: str,
    source: str,
    language: str = None,
    image_url: str = None,
    file_name: str = None,
    base64_data: str = None
) -> ScanModel:
    start_time = time.time()

    # Load Settings
    sys_settings = db.query(SettingsModel).filter(SettingsModel.id == "default").first()
    pii_en = sys_settings.pii_enabled if sys_settings else True
    sec_en = sys_settings.secrets_enabled if sys_settings else True
    inj_en = sys_settings.injection_enabled if sys_settings else True
    sens = sys_settings.sensitivity if sys_settings else 75
    strict = sys_settings.strict_mode if sys_settings else False

    extracted = None
    original_text = content

    if input_type == "Image":
        extracted = process_image_ocr(base64_str=base64_data, provided_extracted_text=content, file_name=file_name or "uploaded_image.png")
        original_text = extracted

    # Run Detection Engine (Layer 2 Deterministic)
    raw_findings = run_all_detectors(
        content=original_text,
        pii_enabled=pii_en,
        secrets_enabled=sec_en,
        injection_enabled=inj_en
    )

    # Run Semantic Security Engine (Layer 3 LLM Analysis - Optional/Fallback)
    from app.services.llm_service import analyze_with_llm
    llm_findings = analyze_with_llm(original_text, layer2_findings=raw_findings)
    if llm_findings:
        raw_findings.extend(llm_findings)

    # Risk Calculation
    risk_score, severity = calculate_risk_score(raw_findings, strict_mode=strict, sensitivity=sens)

    # Policy Evaluation
    decision, decision_reason, matched_policies = evaluate_policies(db, raw_findings, risk_score, severity)

    # Sanitization
    sanitized = sanitize_content(original_text, raw_findings, decision)

    # Temporary initial scan record creation
    scan_record = ScanModel(
        input_type=input_type,
        source=source,
        threat_count=len(raw_findings),
        risk_score=risk_score,
        severity=severity,
        decision=decision,
        processing_time_ms=1,
        original_content=original_text,
        sanitized_content=sanitized,
        extracted_text=extracted,
        image_url=image_url,
        language=language,
        decision_reason=decision_reason,
        matched_policies=matched_policies
    )

    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    # Persist Findings
    for f in raw_findings:
        finding_record = FindingModel(
            scan_id=scan_record.id,
            category=f["category"],
            severity=f["severity"],
            confidence=f.get("confidence", 1.0),
            detector=f["detector"],
            masked_evidence=f["masked_evidence"],
            explanation=f["explanation"],
            recommended_action=f.get("recommended_action", "REVIEW"),
            location=f.get("location"),
            line_number=f.get("line_number")
        )
        db.add(finding_record)

    # Record total end-to-end pipeline processing time (including DB persistence)
    proc_time = int((time.time() - start_time) * 1000)
    scan_record.processing_time_ms = max(1, proc_time)
    db.commit()
    return scan_record
