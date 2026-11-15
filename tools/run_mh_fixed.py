from pathlib import Path
src=Path("tools/scrape_mh_library.py").read_text(encoding="utf-8")

old='''        # image: nearest prior image, but not generic header/nav images
        image=""
        image_alt=""
        for j in range(idx-1,max(-1,idx-12),-1):
            if events[j][0]=="img":
                alt=events[j][1]["alt"]
                src=events[j][1]["src"]
                if not re.search(r"(Martin Hasenpflug|Viererkette bei|Pin It|Bücher|Cover|logo)",alt,re.I):
                    image=src;image_alt=alt;break
'''
new='''        # In Joomla pages the paragraph containing "Organisation & Ablauf" is emitted
        # before its child <img> in BeautifulSoup document order. Therefore the exercise
        # image is the FIRST suitable image AFTER the marker, before the next marker.
        image=""
        image_alt=""
        for j in range(idx+1,next_idx):
            if events[j][0]=="img":
                alt=events[j][1]["alt"]
                src=events[j][1]["src"]
                if not re.search(r"(Martin Hasenpflug|Viererkette bei|Pin It|Bücher|Cover|logo)",alt,re.I):
                    image=src;image_alt=alt;break
'''
if old not in src:
    raise SystemExit("image block not found")
src=src.replace(old,new)
src=src.replace(
"https://fussballtraining.li/fussballtraining/13-fussballtraining-mit-nur-vier-huetchen-zum-thema-gegenpressing",
"https://fussballtraining.li/fussballtraining/trainingsformen/13-fussballtraining-mit-nur-vier-huetchen-zum-thema-gegenpressing")
src=src.replace(
"https://fussballtraining.li/fussballtraining/hauptschwerpunkte/80-torerfolg-durch-zusammenspiel-mit-dem-sturm",
"https://fussballtraining.li/fussballtraining/80-torerfolg-durch-zusammenspiel-mit-dem-sturm")
exec(compile(src,"scrape_mh_library_fixed.py","exec"),{"__name__":"__main__"})
