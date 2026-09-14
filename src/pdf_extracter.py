"""
PAIMANA Flash Report extractor — pulls "Table 6: All Ongoing Projects"
into structured records.

Approach:
  1. Find the page range covering "Table 6: All Ongoing Projects" up to
     the next table heading.
  2. Pull words with coordinates (pdfplumber), not flattened text —
     the layout is column-based, and columns are the only reliable
     signal since rows wrap across a variable number of lines.
  3. Column membership is decided by x0 (horizontal position).
  4. Record membership (which project a word belongs to) is decided
     by nearest Sl.No anchor line — every record's Sl.No row sits at
     the same 'top' as its State / Expenditure / Progress values.
  5. Within the Name/Agency/Code text block, split lines into
     project name vs agency vs codes using pattern rules (see
     _split_name_block), not position — those three are visually
     stacked in the same column.
"""
import re
import sys
import json
import pdfplumber

# Column boundaries (x0, in points). Derived empirically from both the
# April 2026 and January 2026 reports; both use the same page size
# (1080x1512pt) but the two reports shift by up to ~15pt, so bounds
# are padded.
COLS = {
    "sl_no":        (0, 75),
    "name_block":   (75, 470),
    "state":        (470, 560),
    "approval_date":(560, 655),
    "doc":          (655, 750),
    "cost":         (750, 850),
    "expenditure":  (850, 935),
    "progress":     (935, 1080),
}

MM_YYYY = re.compile(r"^\(?\d{2}/\d{4}\)?$")
NUMERIC = re.compile(r"^\(?[\d,]+\.?\d*\)?$")


def col_of(x0):
    for name, (lo, hi) in COLS.items():
        if lo <= x0 < hi:
            return name
    return None


def find_table6_pages(pdf):
    """Table 6 is the last table in the report (runs to end of doc).
    Find its heading page (last occurrence, skipping the Contents
    listing), then collect every subsequent page that has a data
    table on it."""
    heading_idx = None
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        if "Table 6: All Ongoing Projects" in text:
            heading_idx = i  # keep overwriting -> ends on the LAST occurrence
    if heading_idx is None:
        return []
    pages = []
    for i in range(heading_idx, len(pdf.pages)):
        text = pdf.pages[i].extract_text() or ""
        if "Sl.No" in text and "Physical" in text:
            pages.append(i)
    return pages


def cluster_words_by_record(words, start_num):
    """Group words into records using nearest Sl.No anchor.
    Anchors must continue sequentially from start_num, since Sl.No
    numbering runs continuously across pages, not per-page.
    Returns (records dict, next_start_num for the following page)."""
    anchors = []  # (record_num, top)
    expected = start_num
    for w in sorted(words, key=lambda w: w["top"]):
        if col_of(w["x0"]) == "sl_no" and w["text"].strip().isdigit():
            n = int(w["text"].strip())
            if n == expected:
                anchors.append((n, w["top"]))
                expected += 1

    if not anchors:
        return {}, start_num

    records = {n: [] for n, _ in anchors}
    anchor_tops = [t for _, t in anchors]
    anchor_nums = [n for n, _ in anchors]

    for w in words:
        # nearest anchor by vertical distance
        diffs = [abs(w["top"] - t) for t in anchor_tops]
        idx = diffs.index(min(diffs))
        records[anchor_nums[idx]].append(w)

    return records, expected


def _split_name_block(lines):
    """lines: list of strings (top-sorted) in the name/agency/code column
    for one record. Returns (project_name, agency, project_code,
    legacy_code, pmgid)."""
    agency = None
    code_tokens = []
    name_lines = []

    for line in lines:
        stripped = line.strip()
        # A line that is ENTIRELY one or more parenthetical groups,
        # each group being either short alnum/dash codes, is a "code line".
        # e.g. "(612786)"  or  "(N04000106) (-)"
        groups = re.findall(r"\(([^()]*)\)", stripped)
        is_all_parens = bool(groups) and re.fullmatch(
            r"(\s*\([^()]*\)\s*)+", stripped
        )
        if is_all_parens:
            # Does it contain letters (an org name) or just codes?
            has_letters = any(re.search(r"[A-Za-z]", g) for g in groups)
            if has_letters and agency is None and not name_lines[-1:] == []:
                # Only treat as agency if we've already collected some
                # name text (agency line always follows the project name)
                agency = stripped
            elif has_letters and agency is None:
                agency = stripped
            else:
                code_tokens.extend(g.strip() for g in groups)
        else:
            name_lines.append(stripped)

    project_name = " ".join(name_lines).strip()
    # code_tokens in order of appearance: project_code, legacy_code, pmgid
    codes = [c for c in code_tokens]
    project_code = codes[0] if len(codes) > 0 and codes[0] != "-" else (codes[0] if codes else None)
    legacy_code = codes[1] if len(codes) > 1 else None
    pmgid = codes[2] if len(codes) > 2 else None

    return project_name, agency, (codes[0] if codes else None), legacy_code, pmgid


def parse_record(record_num, words):
    by_col = {name: [] for name in COLS}
    for w in words:
        c = col_of(w["x0"])
        if c:
            by_col[c].append(w)

    def line_group(word_list):
        """Group a column's words into text lines by top proximity, sorted top-to-bottom."""
        word_list = sorted(word_list, key=lambda w: (w["top"], w["x0"]))
        lines = []
        cur_top = None
        cur = []
        for w in word_list:
            if cur_top is None or abs(w["top"] - cur_top) <= 3:
                cur.append(w["text"])
                cur_top = w["top"] if cur_top is None else cur_top
            else:
                lines.append(" ".join(cur))
                cur = [w["text"]]
                cur_top = w["top"]
        if cur:
            lines.append(" ".join(cur))
        return lines

    name_lines = line_group(by_col["name_block"])
    project_name, agency, project_code, legacy_code, pmgid = _split_name_block(name_lines)

    def orig_and_revised(col):
        vals = line_group(by_col[col])
        orig = next((v for v in vals if not v.startswith("(")), None)
        rev = next((v.strip("()") for v in vals if v.startswith("(")), None)
        return orig, rev

    approval_date, start_date = orig_and_revised("approval_date")
    target_doc, revised_doc = orig_and_revised("doc")
    orig_cost, revised_cost = orig_and_revised("cost")

    state = " ".join(line_group(by_col["state"])) or None
    expenditure = " ".join(line_group(by_col["expenditure"])) or None
    progress = " ".join(line_group(by_col["progress"])) or None

    return {
        "sl_no": record_num,
        "project_name": project_name or None,
        "agency": agency,
        "project_code": project_code,
        "legacy_ocms_code": legacy_code,
        "pmgid": pmgid,
        "state": state,
        "approval_date": approval_date,
        "start_date": start_date,
        "target_doc": target_doc,
        "revised_doc": revised_doc,
        "original_cost_cr": orig_cost,
        "revised_cost_cr": revised_cost,
        "cumulative_expenditure_cr": expenditure,
        "physical_progress_pct": progress,
    }


def extract(pdf_path, report_month):
    pdf = pdfplumber.open(pdf_path)
    pages = find_table6_pages(pdf)
    all_records = {}
    next_num = 1
    for i in pages:
        page = pdf.pages[i]
        # drop the repeating page header (title/column headers) and
        # footer (page number / "visit:" banner) so they don't get
        # clustered into the nearest real record. Filtering the word
        # list directly (rather than page.crop, which clips partially-
        # overlapping words instead of dropping them) avoids leaving
        # clipped header fragments at the boundary.
        all_words = page.extract_words()
        words = [w for w in all_words if 260 < w["top"] < page.height - 55]
        clustered, next_num = cluster_words_by_record(words, next_num)
        for num, ws in clustered.items():
            all_records[num] = parse_record(num, ws)
            all_records[num]["report_month"] = report_month

    return [all_records[k] for k in sorted(all_records)]


if __name__ == "__main__":
    import csv

    path = sys.argv[1]
    month = sys.argv[2] if len(sys.argv) > 2 else "unknown"
    out_csv = sys.argv[3] if len(sys.argv) > 3 else None

    records = extract(path, month)
    print(f"Extracted {len(records)} records from {path}")

    bad = [r for r in records if not r["project_name"] or len(r["project_name"]) < 5]
    if bad:
        print(f"WARNING: {len(bad)} record(s) failed name extraction "
              f"(sl_no: {[r['sl_no'] for r in bad]}) — check manually, "
              f"usually a multi-state / long-text row that shifted the column layout")

    if out_csv:
        fieldnames = list(records[0].keys())
        with open(out_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        print(f"Wrote {out_csv}")