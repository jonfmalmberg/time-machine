"""Extract mid-decade populations (1945..2025) for every country in data/countries.json
from the UN World Population Prospects 2024 published files. Takes nothing but the figures.

Usage: python3 -I extract.py <repo root> <dir holding the downloaded UN files> <date read>
The UN files (not committed, about 100 MB):
  WPP2024_TotalPopulationBySex.csv.gz  (CSV_URL below)
  WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx  (XLSX_URL below), used only to cross-check
Writes population.json next to this script: one record per line.
Evidence rows follow the CSV header (CSV_HEADER in REPORT.md); the check value is the XLSX "Total Population, as of 1 July (thousands)".
"""
import csv, gzip, io, json, os, sys

CSV_URL = "https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_TotalPopulationBySex.csv.gz"
XLSX_URL = "https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx"
YEARS = list(range(1945, 2026, 10))

root, dl, read = sys.argv[1], sys.argv[2], sys.argv[3]
countries = json.load(open(os.path.join(root, "data/countries.json"), encoding="utf-8"))

# CSV: keep the raw line text, so the evidence is the row exactly as published.
rows = {}
with gzip.open(os.path.join(dl, "WPP2024_TotalPopulationBySex.csv.gz"), "rb") as f:
    text = f.read().decode("utf-8-sig")
lines = text.splitlines()
header = lines[0]
cols = next(csv.reader([header]))
for line in lines[1:]:
    r = dict(zip(cols, next(csv.reader([line]))))
    if r["Variant"] != "Medium" or not r["ISO2_code"]:
        continue
    y = int(r["Time"])
    if y in YEARS:
        rows[(r["ISO2_code"], y)] = (r, line)

# Compact Excel: 1 July total, for a cross-check only.
import openpyxl
xl = {}
wb = openpyxl.load_workbook(os.path.join(dl, "WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx"), read_only=True)
for sheet in ("Estimates", "Medium variant"):
    hdr = None
    for row in wb[sheet].iter_rows(values_only=True):
        if row and row[0] == "Index":
            hdr = list(row); continue
        if hdr and row[hdr.index("ISO2 Alpha-code")]:
            y = row[hdr.index("Year")]
            if y in YEARS:
                xl[(row[hdr.index("ISO2 Alpha-code")], y)] = (sheet, row[hdr.index("Total Population, as of 1 July (thousands)")])

out, mismatches = [], []
for c in countries:
    iso = c["id"]
    for y in YEARS:
        rec = {"iso": iso, "decade": f"{y // 10 * 10}s", "year": y}
        if (iso, y) not in rows:
            rec["population"] = None
            rec["missing"] = ("WPP 2024 starts at 1950; the UN's own pre-1950 series (United Nations 1999, cited in UN_2024_WorldPop-Historical-Plot.xlsx) is world totals only"
                              if y < 1950 else "no row for this ISO2 code in WPP 2024")
            out.append(rec); continue
        r, line = rows[(iso, y)]
        rec["population"] = float(r["PopTotal"])
        rec["unit"] = "thousands, as of 1 July"
        sheet, xv = xl.get((iso, y), (None, None))
        rec["kind"] = "estimate" if sheet == "Estimates" else "projection, medium variant" if sheet == "Medium variant" else "unknown"
        rec["wpp_name"] = r["Location"]
        if r["Notes"]:
            rec["wpp_note"] = r["Notes"]
        if xv is None or abs(float(xv) - rec["population"]) > 0.0015:
            mismatches.append((iso, y, rec["population"], xv))
        rec["evidence"] = {"url": CSV_URL, "row": line, "read": read, "check": {"sheet": sheet, "value": xv}}
        out.append(rec)

dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "population.json")
with open(dst, "w", encoding="utf-8") as f:
    f.write("[\n" + ",\n".join(json.dumps(o, ensure_ascii=False) for o in out) + "\n]\n")
print(len(out), "records;", sum(o["population"] is None for o in out), "empty;", len(mismatches), "mismatches", mismatches[:10])
