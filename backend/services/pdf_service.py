"""Feature 11 — Smart AI Printouts"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER

TEAL = colors.HexColor("#0d9488"); TEAL_L = colors.HexColor("#ccfbf1")

def generate_prescription_pdf(patient: dict, exercises: list, notes: str = "") -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=15*mm, bottomMargin=15*mm, leftMargin=18*mm, rightMargin=18*mm)
    s = getSampleStyleSheet()
    def ps(n, **kw): return ParagraphStyle(n, parent=s["Normal"], **kw)
    title = ps("t", fontSize=20, textColor=TEAL, alignment=TA_CENTER, fontName="Helvetica-Bold")
    sub   = ps("s", fontSize=9,  textColor=colors.gray, alignment=TA_CENTER)
    head  = ps("h", fontSize=12, textColor=colors.HexColor("#0f172a"), fontName="Helvetica-Bold", spaceBefore=8)
    body  = ps("b", fontSize=9,  textColor=colors.HexColor("#0f172a"), leading=13)
    foot  = ps("f", fontSize=8,  textColor=TEAL, alignment=TA_CENTER)
    story = [Paragraph("🏥 Prathomix AI Physiotherapy", title), Paragraph("Exercise Prescription — Powered by Prathomix", sub), Spacer(1,3*mm), HRFlowable(width="100%",thickness=1,color=TEAL), Spacer(1,3*mm)]
    pd = [["Patient",patient.get("name","—"),"Date",datetime.now().strftime("%d %b %Y")],["Phone",patient.get("phone","—"),"Condition",patient.get("condition","—")],["Doctor","Dr. Dheerendra Pratap Singh  (BPT, MPT Sports)","Next Visit",patient.get("next_visit","TBD")]]
    pt = Table(pd, colWidths=[28*mm,62*mm,28*mm,62*mm])
    pt.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),TEAL_L),("BACKGROUND",(2,0),(2,-1),TEAL_L),("TEXTCOLOR",(0,0),(0,-1),TEAL),("TEXTCOLOR",(2,0),(2,-1),TEAL),("FONTSIZE",(0,0),(-1,-1),8),("GRID",(0,0),(-1,-1),0.4,TEAL_L),("PADDING",(0,0),(-1,-1),4)]))
    story += [pt, Spacer(1,4*mm)]
    if notes: story += [Paragraph("Doctor's Note", head), Paragraph(notes, body), Spacer(1,3*mm)]
    story.append(Paragraph("Prescribed Exercises", head))
    ed = [["#","Exercise","Sets×Reps","Duration","Body Part","YouTube"]] + [[str(i+1),e.get("name",""),f"{e.get('sets',0)}×{e.get('reps',0)}",f"{e.get('duration_sec',0)}s" if e.get("duration_sec") else "—",e.get("body_part","—"),"See link"] for i,e in enumerate(exercises[:10])]
    et = Table(ed, colWidths=[8*mm,50*mm,22*mm,18*mm,30*mm,42*mm])
    et.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),TEAL),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),7.5),("GRID",(0,0),(-1,-1),0.4,TEAL_L),("PADDING",(0,0),(-1,-1),3)]))
    story += [et, Spacer(1,6*mm), HRFlowable(width="100%",thickness=0.5,color=TEAL), Spacer(1,2*mm), Paragraph("⚡ Powered by Prathomix AI · Dr. Dheerendra Pratap Singh  · care@prathomix.in · prathomix.in", foot)]
    doc.build(story); buf.seek(0); return buf.read()
