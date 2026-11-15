import json, re, html, hashlib
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

UNITS = [
("mh01","Ballzirkulation","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/81-ballzirkulation-durch-spiel-zum-dritten"),
("mh02","Viererkette","https://fussballtraining.li/viererkette/viererkette-trainieren-jahr-2022"),
("mh03","Spielaufbau","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/79-spielaufbau-sicherer-balltransport-ins-mittelfeld"),
("mh04","Pressing","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/83-pressing-balleroberung-in-gegnerischer-tornaehe"),
("mh05","Gegenpressing","https://fussballtraining.li/fussballtraining/13-fussballtraining-mit-nur-vier-huetchen-zum-thema-gegenpressing"),
("mh06","Konterspiel","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/91-konterspiel-als-aussenseiter-zum-sieg"),
("mh07","1 gegen 1","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/10-offensives-1-gegen-1-angriffsspiel-variabel-gestalten"),
("mh08","Tiefenläufe","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/84-tiefenlauf-hohe-abwehrketten-knacken"),
("mh09","Übergangsspiel","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/78-uebergangsspiel-balltransport-ins-gegner-drittel"),
("mh10","Zusammenspiel Mittelfeld / Sturm","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/80-torerfolg-durch-zusammenspiel-mit-dem-sturm"),
("mh11","90-Grad-Ball","https://fussballtraining.li/fussballtraining/86-90-grad-ball-tore-vorbereiten-von-der-grundlinie"),
("mh12","Pass in den Rücken der Abwehr","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/93-offensivpower-pass-in-den-ruecken-der-abwehr"),
("mh13","Klatsch-Steil-Prinzip","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/94-offensivpower-durch-das-klatsch-steil-prinzip"),
("mh14","Torerfolg","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/87-torerfolg-das-moderne-torschusstraining"),
("mh15","Ballzirkulation","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/34-komplette-trainingseinheit-perfekte-ballzirkulation"),
("mh16","Ballzirkulation","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/11-professionelles-fussballtraining-ballzirkulation-mit-kognitiven-und-athletischen-aspekten"),
("mh17","Ballzirkulation","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/7-ballzirkulation-verbesserung-des-zusammenspiels"),
("mh18","Ballzirkulation","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/106-fussballtraining-mehr-ballbesitz-durch-direktes-spiel-zum-dritten"),
("mh19","90-Grad-Ball","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/6-90-grad-ball-angriffsspiel-ueber-aussen"),
("mh20","Spielaufbau","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/97-innenverteidiger-im-spielaufbau-pressing-linie-ueberdribbeln"),
("mh21","Gegenpressing","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/69-drei-profi-uebungen-ballhalten-und-gegenpressing"),
("mh22","Gegenpressing","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/90-gegenpressing-oder-zurueck-umschaltverhalten-perfektionieren"),
("mh23","Tiefenläufe","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/88-komplettes-angriffstraining-tiefenlauf"),
("mh24","Tiefenläufe","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/96-mit-tiefenlaeufe-gegnerische-abwehr-stressen-komplette-trainingseinheit"),
("mh25","Tiefenläufe","https://fussballtraining.li/fussballtraining/nebenschwerpunkte/107-mega-einheit-fuers-angriffsspiel-gegengleiche-laeufe"),
("mh26","Zusammenspiel Mittelfeld / Sturm","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/105-komplette-trainingseinheit-sturmspitze-im-fokus"),
("mh27","Torerfolg","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/8-torerfolg-torchancen-erspielen-und-verwerten"),
("mh28","Torerfolg","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/98-tore-durchs-zentrum-erzielen-trainingseinheit-in-einem-feld"),
("mh29","Torerfolg","https://fussballtraining.li/fussballtraining/hauptschwerpunkte/99-torchancen-gegen-kompakte-gegner-vorbereiten"),
]
CLOSING_URL="https://fussballtraining.li/fussballtraining/73-das-abschlussspiel-im-fussballtraining"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/155 Safari/537.36"

def clean(t):
    return re.sub(r"\s+"," ",t or "").strip()

def choose_img(img, base):
    if not img: return ""
    for k in ("data-src","data-lazy-src","src"):
        v=img.get(k)
        if v and not v.startswith("data:"):
            return urljoin(base,v)
    srcset=img.get("srcset","")
    if srcset:
        return urljoin(base,srcset.split(",")[0].strip().split(" ")[0])
    return ""

def exercise_category(label, order, total, text):
    t=(label+" "+text).lower()
    if order==1 or any(x in t for x in ["warm-up","warm up","einstimmung","aktivierung"]):
        return "Aufwärmen"
    if any(x in t for x in ["koordination","koordinations","lauf-abc","athletik"]) and order<=2:
        return "Vielseitigkeit"
    if any(x in t for x in ["groß-spielform","gross-spielform","abschlussspiel"]):
        return "Fussball spielen"
    if order==total:
        return "Fussball spielen"
    return "Fussball spielen lernen"

def canonical_focus(theme):
    t=theme.lower()
    if "1 gegen 1" in t: return "1 gegen 1"
    if "torerfolg" in t or "90-grad" in t or "rücken" in t or "klatsch" in t: return "Torschuss"
    if "ballzirkulation" in t or "spielaufbau" in t or "zusammenspiel" in t: return "Passen & Ballkontrolle"
    if "tiefen" in t or "pressing" in t or "konter" in t or "viererkette" in t or "übergang" in t: return "Spielformen"
    return "Spielformen"

def extract_page(uid, theme, url):
    r=requests.get(url,headers={"User-Agent":UA},timeout=45)
    r.raise_for_status()
    soup=BeautifulSoup(r.text,"html.parser")
    h1=soup.find("h1")
    title=clean(h1.get_text(" ",strip=True) if h1 else theme)
    # Container: nearest reasonable article-like ancestor.
    container=None
    if h1:
        for parent in h1.parents:
            if getattr(parent,"name",None) in ("article","main"):
                container=parent;break
            cls=" ".join(parent.get("class",[])) if getattr(parent,"attrs",None) else ""
            if re.search(r"(item-page|article|content)",cls,re.I) and len(parent.get_text(" ",strip=True))>800:
                container=parent;break
    if container is None:
        container=soup.body or soup

    events=[]
    for tag in container.find_all(["img","p","h2","h3","h4","li"]):
        if tag.name=="img":
            src=choose_img(tag,url)
            alt=clean(tag.get("alt",""))
            if src:
                events.append(("img",{"src":src,"alt":alt}))
        else:
            txt=clean(tag.get_text(" ",strip=True))
            if txt: events.append(("text",txt))

    marker_idx=[]
    for i,(kind,val) in enumerate(events):
        if kind=="text" and re.search(r"Organisation\s*(?:&|und)\s*Ablauf",val,re.I):
            marker_idx.append(i)

    exercises=[]
    for pos,idx in enumerate(marker_idx):
        next_idx=marker_idx[pos+1] if pos+1<len(marker_idx) else len(events)
        marker=events[idx][1]
        m=re.search(r"Organisation\s*(?:&|und)\s*Ablauf\s*(?:\(([^)]*)\))?",marker,re.I)
        label=clean(m.group(1) if m and m.group(1) else marker.replace("Organisation & Ablauf","").replace("Organisation und Ablauf",""))
        # image: nearest prior image, but not generic header/nav images
        image=""
        image_alt=""
        for j in range(idx-1,max(-1,idx-12),-1):
            if events[j][0]=="img":
                alt=events[j][1]["alt"]
                src=events[j][1]["src"]
                if not re.search(r"(Martin Hasenpflug|Viererkette bei|Pin It|Bücher|Cover|logo)",alt,re.I):
                    image=src;image_alt=alt;break

        seg=[v for k,v in events[idx:next_idx] if k=="text"]
        # stop share/footer content
        trimmed=[]
        for s in seg:
            if re.search(r"^(Teile mit Deinen Freunden|Whatsapp|Bootstrap|Wir benutzen Cookies)",s,re.I): break
            trimmed.append(s)
        seg=trimmed

        fields={"Organisation & Ablauf":[],"Spieleranzahl":[],"Wettbewerb":[],"Variation":[],"Tipp":[]}
        current="Organisation & Ablauf"
        for s in seg:
            if re.search(r"Organisation\s*(?:&|und)\s*Ablauf",s,re.I):
                s=re.sub(r"^.*?Organisation\s*(?:&|und)\s*Ablauf\s*(?:\([^)]*\))?\s*","",s,flags=re.I)
                if s: fields[current].append(s)
                continue
            hit=None
            for key in ("Spieleranzahl","Wettbewerb","Variation","Tipp"):
                if re.match(rf"^{key}\s*:",s,re.I):
                    hit=key
                    s=re.sub(rf"^{key}\s*:\s*","",s,flags=re.I)
                    break
            if hit: current=hit
            if s: fields[current].append(s)

        full=" ".join(sum(fields.values(),[]))
        cat=exercise_category(label,pos+1,len(marker_idx),full)
        sections=[]
        for key in ("Organisation & Ablauf","Spieleranzahl","Wettbewerb","Variation","Tipp"):
            txt=clean(" ".join(fields[key]))
            if txt: sections.append([key,txt])
        players=clean(" ".join(fields["Spieleranzahl"])) or "variabel"
        tips=clean(" ".join(fields["Tipp"]))
        coaching=[x.strip() for x in re.split(r"(?<=[.!?])\s+",tips) if x.strip()][:8]
        materials=[]
        low=full.lower()
        for kw,label2 in [
            ("ball","Bälle"),("hütchen","Hütchen"),("stange","Stangen"),("leibchen","Leibchen"),
            ("minitor","Minitore"),("großtor","Gross-/Fussballtore"),("gross tor","Gross-/Fussballtore"),
            ("koordination","Koordinationsmaterial"),("leiter","Koordinationsleiter"),("medizinball","Medizinball")
        ]:
            if kw in low and label2 not in materials: materials.append(label2)

        ex={
          "id":f"{uid}-ex{pos+1:02d}",
          "title":image_alt if image_alt and len(image_alt)>3 else (label or f"{title} – Übung {pos+1}"),
          "category":cat,
          "duration":15,
          "duration_note":"App-Standard; Quelle nennt keine feste Minutenangabe pro Übung.",
          "field":"Feld",
          "environment":"field",
          "focus":canonical_focus(theme),
          "intro":clean(" ".join(fields["Organisation & Ablauf"]))[:420],
          "sections":sections,
          "source_provider":"MH / fussballtraining.li",
          "source_label":"Martin Hasenpflug – Gratisbuch Fußballtraining",
          "source_url":url,
          "source_note":"Originalübung aus dem kostenlosen Trainingsbuch.",
          "fcneBranch":"mh",
          "age":"Quelle: ab C-Jugend; für E/F bei Bedarf vereinfachen",
          "players":players,
          "level":"ab C-Jugend laut Quelle",
          "materials":materials,
          "coaching":coaching,
          "image":image,
          "images":[image] if image else [],
          "mhUnitId":uid,
          "mhUnitTitle":title,
          "mhTheme":theme,
          "mhOrder":pos+1,
          "mhStage":label or f"Übung {pos+1}"
        }
        exercises.append(ex)

    # page intro before first marker
    intro=""
    if h1:
        parts=[]
        for tag in h1.find_all_next(["p","h2","h3"]):
            txt=clean(tag.get_text(" ",strip=True))
            if re.search(r"Organisation\s*(?:&|und)\s*Ablauf",txt,re.I): break
            if txt and not re.search(r"(Alle Übungen von Martin|Effektives Verteidigen funktioniert|Impressum)",txt):
                parts.append(txt)
            if len(" ".join(parts))>900: break
        intro=clean(" ".join(parts))[:1200]

    return {
      "id":uid,"theme":theme,"title":title,"url":url,"intro":intro,
      "focus":canonical_focus(theme),"exercise_count":len(exercises),"exercises":exercises
    }

def extract_closing():
    return extract_page("mh-closing","Abschlussspiel",CLOSING_URL)

def main():
    out={"source":"https://fussballtraining.li/publikationen/die-neuen/gratisbuch-fussballtraining","units":[],"exercises":[],"errors":[]}
    for i,(uid,theme,url) in enumerate(UNITS,1):
        try:
            unit=extract_page(uid,theme,url)
            out["units"].append({k:v for k,v in unit.items() if k!="exercises"})
            out["exercises"].extend(unit["exercises"])
            print(i,uid,unit["title"],len(unit["exercises"]))
        except Exception as e:
            out["errors"].append({"id":uid,"url":url,"error":repr(e)})
            print("ERROR",uid,repr(e))
    try:
        closing=extract_closing()
        out["closing"]=closing
        print("closing",len(closing["exercises"]))
    except Exception as e:
        out["errors"].append({"id":"mh-closing","url":CLOSING_URL,"error":repr(e)})
    with open("mh_library.json","w",encoding="utf-8") as f:
        json.dump(out,f,ensure_ascii=False,indent=2)
    with open("mh_library_report.txt","w",encoding="utf-8") as f:
        f.write(f"units={len(out['units'])}\nexercises={len(out['exercises'])}\nerrors={len(out['errors'])}\n")
        for u in out["units"]: f.write(f"{u['id']}\t{u['exercise_count']}\t{u['title']}\n")
        for e in out["errors"]: f.write("ERROR\t"+json.dumps(e,ensure_ascii=False)+"\n")

if __name__=="__main__": main()
