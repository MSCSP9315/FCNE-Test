import os, re, json, io, math
from pathlib import Path
import requests
from PIL import Image as PILImage
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

OUT = Path("Easy2Coach_Kontrollkatalog_Feld_Halle.pdf")
IMG_DIR = Path("_e2c_images")
IMG_DIR.mkdir(exist_ok=True)
INDEX_URL = "https://raw.githubusercontent.com/MSCSP9315/FCNE/main/index.html"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/155 Safari/537.36"

def classify(ex):
    m = re.match(r"e2c-(\d{4})$", str(ex.get("id","")))
    if not m: return "UNBEKANNT"
    n = int(m.group(1))
    return "HALLE" if (n in (55,56,57) or 61 <= n <= 102) else "FELD"

def load_data():
    r = requests.get(INDEX_URL, headers={"User-Agent":UA}, timeout=60)
    r.raise_for_status()
    m = re.search(r"const E2C=(\[.*?\]);\n\s*function escSvg", r.text, re.S)
    if not m: raise RuntimeError("E2C dataset not found")
    data = json.loads(m.group(1))
    data.sort(key=lambda x: int(re.search(r"(\d+)$", x["id"]).group(1)))
    return data

def font_setup():
    for reg,bold in [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ("/usr/share/fonts/dejavu/DejaVuSans.ttf","/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf")]:
        if os.path.exists(reg) and os.path.exists(bold):
            pdfmetrics.registerFont(TTFont("DV", reg)); pdfmetrics.registerFont(TTFont("DVB", bold))
            return "DV","DVB"
    return "Helvetica","Helvetica-Bold"

REG,BOLD = font_setup()

def download_image(session, ex):
    out = IMG_DIR / f"{ex['id']}.jpg"
    if out.exists() and out.stat().st_size > 1000: return out
    url = ex.get("image")
    if not url: return None
    try:
        rr=session.get(url,headers={"User-Agent":UA,"Referer":ex.get("source_url") or "https://www.easy2coach.net/","Accept":"image/*,*/*;q=0.8"},timeout=30)
        rr.raise_for_status()
        im=PILImage.open(io.BytesIO(rr.content)).convert("RGB")
        im.thumbnail((700,500),PILImage.Resampling.LANCZOS)
        im.save(out,"JPEG",quality=80,optimize=True,progressive=True)
        return out
    except Exception as e:
        print("IMAGE_FAIL",ex["id"],repr(e))
        return None

def wrap_text(c,text,font,size,max_width,max_lines=4):
    words=str(text).replace("–","-").replace("—","-").split(); lines=[]; cur=""
    for w in words:
        test=(cur+" "+w).strip()
        if c.stringWidth(test,font,size)<=max_width: cur=test
        else:
            if cur: lines.append(cur)
            cur=w
            if len(lines)>=max_lines-1: break
    if cur and len(lines)<max_lines: lines.append(cur)
    if len(" ".join(lines)) < len(" ".join(words)) and lines:
        while c.stringWidth(lines[-1]+"...",font,size)>max_width and len(lines[-1])>2: lines[-1]=lines[-1][:-1]
        lines[-1]+="..."
    return lines

def checkbox(c,x,y,label):
    s=3.4*mm
    c.setLineWidth(.5); c.rect(x,y-s+.8*mm,s,s,stroke=1,fill=0)
    c.setFont(REG,7.2); c.drawString(x+s+1.5*mm,y-1.3*mm,label)

def placeholder(c,x,y,w,h):
    c.setFillColorRGB(.95,.95,.95); c.rect(x,y,w,h,stroke=0,fill=1)
    c.setStrokeColorRGB(.75,.75,.75); c.rect(x,y,w,h,stroke=1,fill=0)
    c.setFillColorRGB(.35,.35,.35); c.setFont(REG,7)
    c.drawCentredString(x+w/2,y+h/2+2,"Originalbild")
    c.drawCentredString(x+w/2,y+h/2-7,"konnte nicht geladen werden")

def cover(c,data,downloaded):
    W,H=A4
    c.setFillColorRGB(.08,.38,.23); c.rect(0,H-52*mm,W,52*mm,fill=1,stroke=0)
    c.setFillColorRGB(1,1,1); c.setFont(BOLD,22); c.drawString(16*mm,H-24*mm,"Easy2Coach Kontrollkatalog")
    c.setFont(REG,12); c.drawString(16*mm,H-34*mm,"Feld / Halle - FCNE Trainings-App")
    c.setFillColorRGB(.12,.12,.12); c.setFont(BOLD,13); c.drawString(16*mm,H-72*mm,"So kontrollierst du")
    c.setFont(REG,10); yy=H-82*mm
    for t in [
        "Jede Übung anhand von Titel und Originalgrafik prüfen.",
        "Aktuelle App-Zuordnung FELD oder HALLE kontrollieren.",
        "Bei Fehler gewünschte Zuordnung ankreuzen oder nur die E2C-ID melden.",
        "Beispiel: e2c-0060 -> FELD; e2c-0102 -> HALLE."]:
        c.drawString(19*mm,yy,"- "+t); yy-=7*mm
    field=sum(classify(e)=="FELD" for e in data); hall=sum(classify(e)=="HALLE" for e in data)
    c.setFont(BOLD,12); c.drawString(16*mm,yy-4*mm,"Bestand")
    c.setFont(REG,10)
    c.drawString(19*mm,yy-14*mm,f"{len(data)} Easy2Coach-Übungen insgesamt")
    c.drawString(19*mm,yy-21*mm,f"Aktuell: {field} Feld / {hall} Halle")
    c.drawString(19*mm,yy-28*mm,f"Originalbilder geladen: {downloaded}/{len(data)}")
    c.setFont(REG,8.2); c.setFillColorRGB(.35,.35,.35)
    c.drawString(16*mm,16*mm,"Grafiken: Easy2Coach. Interner Kontrollkatalog zur Zuordnungsprüfung.")
    c.showPage()

def card(c,ex,img_path,x,y,w,h):
    c.setFillColorRGB(1,1,1); c.setStrokeColorRGB(.82,.87,.83); c.roundRect(x,y,w,h,4*mm,stroke=1,fill=1)
    mode=classify(ex)
    if mode=="HALLE":
        c.setFillColorRGB(.92,.95,1); c.setStrokeColorRGB(.55,.68,.88); mc=(.12,.28,.55)
    else:
        c.setFillColorRGB(.91,.97,.93); c.setStrokeColorRGB(.55,.78,.62); mc=(.05,.42,.22)
    c.roundRect(x+3*mm,y+h-11*mm,25*mm,7*mm,2.5*mm,stroke=1,fill=1)
    c.setFillColorRGB(*mc); c.setFont(BOLD,8.5); c.drawCentredString(x+15.5*mm,y+h-8.5*mm,mode)
    c.setFillColorRGB(.35,.35,.35); c.setFont(BOLD,7.3); c.drawRightString(x+w-4*mm,y+h-8.5*mm,ex["id"])

    ix=x+4*mm; iy=y+20*mm; iw=38*mm; ih=31*mm
    if img_path and Path(img_path).exists():
        try:
            im=PILImage.open(img_path); ratio=min(iw/im.width,ih/im.height); dw,dh=im.width*ratio,im.height*ratio
            c.drawImage(ImageReader(im),ix+(iw-dw)/2,iy+(ih-dh)/2,dw,dh,preserveAspectRatio=True,mask='auto')
            c.setStrokeColorRGB(.85,.85,.85); c.rect(ix,iy,iw,ih,stroke=1,fill=0)
        except Exception: placeholder(c,ix,iy,iw,ih)
    else: placeholder(c,ix,iy,iw,ih)

    tx=x+45*mm; tw=w-49*mm; ty=y+h-17*mm
    c.setFillColorRGB(.08,.08,.08); c.setFont(BOLD,9.2)
    for line in wrap_text(c,ex.get("title",""),BOLD,9.2,tw,4):
        c.drawString(tx,ty,line); ty-=4.3*mm
    c.setFillColorRGB(.32,.38,.34); c.setFont(REG,7.1)
    meta=f'{ex.get("category","")} | {ex.get("focus","")} | {ex.get("duration","?")} Min.'
    for line in wrap_text(c,meta,REG,7.1,tw,3):
        c.drawString(tx,ty-1*mm,line); ty-=3.5*mm

    c.setStrokeColorRGB(.88,.9,.88); c.line(x+4*mm,y+15*mm,x+w-4*mm,y+15*mm)
    c.setFillColorRGB(.18,.18,.18); c.setFont(BOLD,7.1); c.drawString(x+4*mm,y+10.5*mm,"Kontrolle:")
    checkbox(c,x+25*mm,y+11*mm,"stimmt"); checkbox(c,x+49*mm,y+11*mm,"Feld"); checkbox(c,x+68*mm,y+11*mm,"Halle")
    c.setFont(REG,6.4); c.setFillColorRGB(.45,.45,.45)
    c.drawString(x+4*mm,y+4.5*mm,"Notiz: _________________________________________________")

def build(data,imgs):
    c=canvas.Canvas(str(OUT),pagesize=A4); c.setTitle("Easy2Coach Kontrollkatalog Feld Halle")
    cover(c,data,sum(bool(p and Path(p).exists()) for p in imgs.values()))
    W,H=A4; mx=10*mm; top=13*mm; bottom=12*mm; gx=6*mm; gy=5*mm
    cw=(W-2*mx-gx)/2; ch=(H-top-bottom-3*gy-10*mm)/4; per=8; pages=math.ceil(len(data)/per)
    for p in range(pages):
        c.setFillColorRGB(.08,.38,.23); c.setFont(BOLD,10); c.drawString(mx,H-8*mm,"Easy2Coach Kontrollkatalog - Feld / Halle")
        c.setFillColorRGB(.35,.35,.35); c.setFont(REG,7.5); c.drawRightString(W-mx,H-8*mm,f"Seite {p+1} von {pages}")
        for i,ex in enumerate(data[p*per:(p+1)*per]):
            row=i//2; col=i%2; x=mx+col*(cw+gx); y=H-top-10*mm-(row+1)*ch-row*gy
            card(c,ex,imgs.get(ex["id"]),x,y,cw,ch)
        c.showPage()
    c.save()

def main():
    data=load_data(); print("DATA",len(data))
    s=requests.Session(); imgs={}
    for i,ex in enumerate(data,1):
        imgs[ex["id"]]=download_image(s,ex)
        if i%20==0: print("IMAGES",i,"/",len(data))
    build(data,imgs); print("PDF",OUT,OUT.stat().st_size)

if __name__=="__main__": main()
