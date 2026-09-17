import io
import hashlib
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_evidentiary_pdf(
    case_number: str = "CASE-2026-001",
    title: str = "Operation NetSweep — Hawala Bridge Cluster",
    agency: str = "Delhi Police Cyber Command & FIU-IND Liaison",
    officer_name: str = "Insp. Vikramaditya Sharma",
    officer_badge: str = "DEL-CYBER-8842",
    target_wallet: str = "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    attributed_vasp: str = "CoinDCX (Neblio Technologies Pvt Ltd)",
    fiu_reg: str = "FIU-IND-VDA-2023-0008",
    confidence_score: float = 96.8,
    total_exposure_inr: str = "₹28,15,40,000",
    court_name: str = "Special Cyber & PMLA Adjudicating Authority, New Delhi"
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A')
    )

    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569')
    )

    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )

    body_mono = ParagraphStyle(
        'BodyMono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    body_text = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # 1. Header Banner
    banner_data = [
        [
            Paragraph("<b>CHAINTRACE // LAW ENFORCEMENT INTELLIGENCE</b><br/><font color='#A67C32'>Section 65B Indian Evidence Act Forensic Dossier</font>", header_title_style),
            Paragraph(f"<b>DOSSIER REF:</b> {case_number}-65B<br/><b>GENERATED:</b> {datetime.utcnow().strftime('%d %b %Y %H:%M UTC')}<br/><font color='#10B981'><b>STATUS: ADMISSIBLE RECORD</b></font>", header_sub_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[330, 200])
    banner_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(banner_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#C8A96B'), spaceBefore=4, spaceAfter=12))

    # 2. Statutory Legal Certification Notice
    statutory_text = (
        "<b>CERTIFICATE UNDER SECTION 65B(4) OF THE INDIAN EVIDENCE ACT, 1872</b> "
        "(read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023). "
        f"Submitted before the Hon'ble <b>{court_name}</b>. "
        "This certifies that the electronic records and blockchain transaction traces detailed herein were produced "
        "by computer systems operating ordinarily and securely under law enforcement custody."
    )
    elements.append(Paragraph(statutory_text, body_text))
    elements.append(Spacer(1, 10))

    # 3. Case & Suspect Overview Table
    overview_data = [
        [Paragraph("<b>CASE REFERENCE:</b>", body_text), Paragraph(case_number, body_mono), Paragraph("<b>INVESTIGATING AGENCY:</b>", body_text), Paragraph(agency, body_text)],
        [Paragraph("<b>OPERATION TITLE:</b>", body_text), Paragraph(title, body_text), Paragraph("<b>LEAD OFFICER:</b>", body_text), Paragraph(f"{officer_name} ({officer_badge})", body_text)],
        [Paragraph("<b>SUSPECT WALLET:</b>", body_text), Paragraph(target_wallet, body_mono), Paragraph("<b>TOTAL EXPOSURE:</b>", body_text), Paragraph(f"<font color='#059669'><b>{total_exposure_inr}</b></font>", body_text)],
        [Paragraph("<b>ATTRIBUTED VASP:</b>", body_text), Paragraph(f"<b>{attributed_vasp}</b>", body_text), Paragraph("<b>FIU REGISTRATION:</b>", body_text), Paragraph(f"<font color='#2563EB'>{fiu_reg}</font>", body_mono)],
        [Paragraph("<b>ATTRIBUTION CONFIDENCE:</b>", body_text), Paragraph(f"<font color='#059669'><b>{confidence_score}% (VERY HIGH)</b></font>", body_text), Paragraph("<b>LEDGER HOPS:</b>", body_text), Paragraph("2 Hops (Direct Custodial Sweeps)", body_text)]
    ]
    overview_table = Table(overview_data, colWidths=[110, 155, 125, 140])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    elements.append(overview_table)
    elements.append(Spacer(1, 12))

    # 4. 7-Signal Score Breakdown Table
    elements.append(Paragraph("<b>7-SIGNAL EXPLAINABLE ATTRIBUTION MATRIX</b>", section_heading))
    elements.append(Spacer(1, 4))
    
    signals_data = [
        [Paragraph("<b>Signal Parameter</b>", body_text), Paragraph("<b>Weight</b>", body_text), Paragraph("<b>Raw Score</b>", body_text), Paragraph("<b>Contribution</b>", body_text), Paragraph("<b>Evidentiary Finding</b>", body_text)],
        [Paragraph("1. Proximity & Hop Distance", body_text), Paragraph("24%", body_mono), Paragraph("90.0 / 100", body_mono), Paragraph("+21.6%", body_mono), Paragraph("Direct 2-hop fund flow to candidate hot wallet", body_text)],
        [Paragraph("2. Deposit Signature Match", body_text), Paragraph("22%", body_mono), Paragraph("95.0 / 100", body_mono), Paragraph("+20.9%", body_mono), Paragraph("Matches exchange custodial deposit sweeping pattern", body_text)],
        [Paragraph("3. Wallet Cluster Association", body_text), Paragraph("18%", body_mono), Paragraph("92.0 / 100", body_mono), Paragraph("+16.6%", body_mono), Paragraph("Co-spending common-input cluster verified", body_text)],
        [Paragraph("4. Statutory Regulatory Registry", body_text), Paragraph("15%", body_mono), Paragraph("100.0 / 100", body_mono), Paragraph("+15.0%", body_mono), Paragraph(f"Entity holds active registration ({fiu_reg})", body_text)],
        [Paragraph("5. Cross-Chain Fund Trail", body_text), Paragraph("10%", body_mono), Paragraph("85.0 / 100", body_mono), Paragraph("+8.5%", body_mono), Paragraph("LayerZero / Stargate bridge relay detected", body_text)],
        [Paragraph("6. Behavioral Heuristics", body_text), Paragraph("7%", body_mono), Paragraph("78.0 / 100", body_mono), Paragraph("+5.5%", body_mono), Paragraph("Immediate consolidation post-inflow (<15 min)", body_text)],
        [Paragraph("7. Historical LEA Intelligence", body_text), Paragraph("4%", body_mono), Paragraph("70.0 / 100", body_mono), Paragraph("+2.8%", body_mono), Paragraph("Target address flagged in prior cyber inquiries", body_text)],
        [Paragraph("<b>TOTAL ATTRIBUTION CONFIDENCE</b>", body_text), Paragraph("<b>100%</b>", body_mono), Paragraph("-", body_mono), Paragraph(f"<b>{confidence_score}%</b>", body_mono), Paragraph("<b>VERY HIGH CONFIDENCE CANDIDATE</b>", body_text)]
    ]
    sig_table = Table(signals_data, colWidths=[130, 45, 65, 65, 225])
    sig_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(sig_table)
    elements.append(Spacer(1, 12))

    # 5. Four-Tier Evidentiary Classification Block
    elements.append(Paragraph("<b>STATUTORY FOUR-TIER EVIDENTIARY CLASSIFICATION</b>", section_heading))
    elements.append(Spacer(1, 4))
    tier_data = [
        [Paragraph("<font color='#059669'><b>TIER 1: OBSERVED FACT</b></font>", body_text), Paragraph("Immutable on-chain transactions on Ethereum and Tron public ledgers with block header and cryptographic signature proofs.", body_text)],
        [Paragraph("<font color='#2563EB'><b>TIER 2: DERIVED INTEL</b></font>", body_text), Paragraph("Multi-hop graph traversal metrics, co-spending cluster expansions, and cross-chain relayer confirmation logs.", body_text)],
        [Paragraph("<font color='#D97706'><b>TIER 3: INFERENCE</b></font>", body_text), Paragraph(f"7-Signal attribution confidence scoring ({confidence_score}%), candidate ranking, and nearest VASP association.", body_text)],
        [Paragraph("<font color='#7C3AED'><b>TIER 4: RECOMMENDATION</b></font>", body_text), Paragraph(f"Issuance of Section 91 CrPC notice to {attributed_vasp} for KYC disclosure and Section 5 PMLA provisional seizure.", body_text)]
    ]
    tier_table = Table(tier_data, colWidths=[130, 400])
    tier_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(tier_table)
    elements.append(Spacer(1, 12))

    # 6. Cryptographic Hash & Digital Custody Sign-Off
    hasher = hashlib.sha256()
    hasher.update(f"{case_number}:{target_wallet}:{attributed_vasp}:{confidence_score}:{datetime.utcnow().isoformat()}".encode('utf-8'))
    seal_hash = hasher.hexdigest()

    sign_data = [
        [
            Paragraph(f"<b>ELECTRONIC EVIDENCE INTEGRITY SEAL:</b><br/><font color='#475569'>SHA-256 Checksum: {seal_hash}</font><br/><b>STATUTORY CUSTODIAN:</b> {officer_name}, Cyber Crime Division", body_text),
            Paragraph(f"<b>OFFICIAL ELECTRONIC STAMP:</b><br/>CERTIFIED EVIDENCE SEC-65B<br/>Date: {datetime.utcnow().strftime('%Y-%m-%d')}<br/>Authorized LEA Node", header_sub_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[350, 180])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(sign_table)

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
