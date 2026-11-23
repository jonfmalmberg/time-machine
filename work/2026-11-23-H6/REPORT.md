# H6: People: population by country and decade

Date 2026-11-23. Branch `helper/2026-11-23-h6`. Run configured with model `claude-opus-5-5` (the serving model can differ; the run cannot see it). No sub-agents were started: extracting the rows was done by one script reading the UN's own data file, so the Sonnet row-extraction sub-agents the assignment allowed were not needed.

## What was asked

For every country code in `data/iso.json`, the population at 1945, 1955, ... 2025 from UN World Population Prospects (first-party pages or published data files), each figure with address, exact row and date read. Pre-1950 from the source the UN itself cites, or left empty and listed. No estimates, no weights.

`data/iso.json` no longer exists on `dev`: the schema change of 23 November replaced it with `data/countries.json` (226 records, same codes as the 226 entries H1 counted in `iso.json`). That file's `id` was used.

## What is in this folder

- `population.json`: 2,034 records (226 countries × 9 mid-decade years), one per line. Fields: `iso`, `decade`, `year`, `population` (as published, in thousands of people, as of 1 July, or `null`), `unit`, `kind` (`estimate` or `projection, medium variant`), `wpp_name` (the UN's name for the place), `wpp_note` (the UN's note number, texts below), `evidence` (`url`, `row`: the CSV line copied exactly, `read`, and `check`: the same figure read from the UN's Excel file, with its sheet). Empty records carry `missing` with the reason.
- `extract.py`: the script that made it, from the two UN files listed under Sources. Rerun: `python3 -I extract.py <repo root> <folder with the UN files> <date>`.
- `REPORT.md`: this file.

## What was found

- 224 of 226 countries have all eight figures 1955–2025 in WPP 2024 (the latest revision; the UN site lists nothing newer). 1,792 figures in all.
- Every figure was read from the CSV row and agrees with the 1 July column of the UN's Excel file to the last published digit (0 differences).
- 1955–2015 are UN estimates (the Excel sheet "Estimates, 1950 - 2023"); 2025 is a projection (the sheet "Medium fertility variant, 2024 - 2100"). The CSV puts both under variant `Medium`; the Excel sheet is what tells them apart, and is recorded per figure.
- Figures are in thousands, mid-year: the Excel column reads `Total Population, as of 1 July (thousands)`. The methodology says: "Published estimates with reference date 1 July represent the arithmetic mean of the values estimated for 1 January."
- 28 countries have a UN name different from the site's name (for example `TR` Türkiye, `XK` "Kosovo (under UNSC res. 1244)", `TW` "China, Taiwan Province of China", `VA` "Holy See"). Codes all match; names are in `wpp_name`.
- What a figure covers follows the UN's notes. Those that matter for joining with the site's countries: China (`CN`, note 5) excludes Hong Kong, Macao and Taiwan; Serbia (`RS`, note 24) excludes Kosovo; United Kingdom (`GB`, note 21) excludes the Crown dependencies and overseas territories; France (`FR`, note 26), Netherlands (`NL`, 27), Denmark (`DK`, 16), United States (`US`, 32) and New Zealand (`NZ`, 34) exclude their listed territories, which have their own figures; Cyprus (`CY`, 11) "Refers to the whole country"; Ukraine (`UA`, 15) includes Crimea; Moldova (`MD`, 14) includes Transnistria; Georgia (`GE`, 12) includes Abkhazia and South Ossetia; Azerbaijan (`AZ`, 10) includes Nagorno-Karabakh; Palestine (`PS`, 13) includes East Jerusalem; Tanzania (`TZ`, 3) includes Zanzibar; Spain (`ES`, 25) includes Canary Islands, Ceuta and Melilla; Norway (`NO`, 20) includes Svalbard and Jan Mayen; Finland (`FI`, 18) includes Åland; Australia (`AU`, 33) includes Christmas Island, Cocos (Keeling) and Norfolk Island; Malaysia (`MY`, 9) includes Sabah and Sarawak. Full note texts are in the NOTES sheet of the Excel file.

## Sources

- UN DESA Population Division, World Population Prospects 2024, total population by sex, CSV: https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_TotalPopulationBySex.csv.gz (read 2026-11-23; gzip SHA-256 `66b84489fd7875b62de9b40d960b803b8c8439367c98deab89c2f770970925b9`). Header of every evidence row: `SortOrder,LocID,Notes,ISO3_code,ISO2_code,SDMX_code,LocTypeID,LocTypeName,ParentID,Location,VarID,Variant,Time,MidPeriod,PopMale,PopFemale,PopTotal,PopDensity`; the figure is `PopTotal`.
- Same, File GEN/01/REV1, demographic indicators, compact Excel: https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx (read 2026-11-23). Sheet titles "Estimates, 1950 - 2023" and "Medium fertility variant, 2024 - 2100"; licence line "© July 2024 by United Nations, made available under a Creative Commons license CC BY 3.0 IGO: http://creativecommons.org/licenses/by/3.0/igo/"; suggested citation "United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024, Online Edition."
- WPP 2024 Methodology report: https://population.un.org/wpp/assets/Files/WPP2024_Methodology.pdf (read 2026-11-23), for the 1 July sentence quoted above.
- UN world population from year 0, plot data: https://population.un.org/wpp/assets/Files/UN_2024_WorldPop-Historical-Plot.xlsx (read 2026-11-23), for what the UN cites before 1950. Its source line reads "Data from year 0 to 1950: Table 1: World Population From Year 0 to Stabilization in The World at Six Billion, United Nations, 1999, p. 5."

## What fell short

- **1945, all 226 countries: empty.** WPP 2024 starts in 1950 (sheet "Estimates, 1950 - 2023"). The only pre-1950 source the UN cites on its WPP site is United Nations (1999), *The World at Six Billion*, Table 1, and the UN's own file shows it as world totals only (1940: 2.3 billion), not by country. That report was not opened, so it is not confirmed that it has no country table; if the lead wants 1945 by country, that PDF (address in the cited line, on un.org) and the UN Demographic Yearbook are the places to look next.
- **`AQ` Antarctica and `TF` French Southern Lands: empty for every year.** WPP 2024 has no row with these codes.
- **Boundaries over time not established.** The figures appear to be for each country's present territory carried back (for example `DE` has a 1955 figure for one Germany), but no UN sentence saying so was found in the methodology report. Not claimed.
- No sub-agents, so nothing to record there.

## Questions for the lead

1. The figures are kept in thousands, exactly as published. Should the lead's merge convert to persons, or keep the UN's unit?
2. 2025 is a projection, not an estimate. Use it, or use 2023 (the last estimate year) for the 2020s?
3. 1945: leave empty, or ask for a follow-up assignment to check the 1999 UN report and the Demographic Yearbook for country figures?
