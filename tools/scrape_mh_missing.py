import json, sys
sys.path.insert(0,"tools")
from scrape_mh_library import extract_page

rows=[
 ("mh05","Gegenpressing","https://fussballtraining.li/fussballtraining/trainingsformen/13-fussballtraining-mit-nur-vier-huetchen-zum-thema-gegenpressing"),
 ("mh10","Zusammenspiel Mittelfeld / Sturm","https://fussballtraining.li/fussballtraining/80-torerfolg-durch-zusammenspiel-mit-dem-sturm"),
]
out={"units":[],"exercises":[],"errors":[]}
for uid,theme,url in rows:
    try:
        u=extract_page(uid,theme,url)
        out["units"].append({k:v for k,v in u.items() if k!="exercises"})
        out["exercises"].extend(u["exercises"])
        print(uid,u["title"],len(u["exercises"]))
    except Exception as e:
        out["errors"].append({"id":uid,"url":url,"error":repr(e)})
        print("ERROR",uid,repr(e))
with open("mh_missing.json","w",encoding="utf-8") as f:
    json.dump(out,f,ensure_ascii=False,indent=2)
