# ONET skills data — brief index

This folder contains original O*NET Excel data files (exported from O*NET Resource Center). The actual Excel files are large and should be kept out of source control; add them to `.gitignore`. This README explains what each file contains and where it came from.

Source
- Primary source: O*NET (O*NET Resource Center / O*NET-Standard Occupational Classification crosswalks). Files were obtained from O*NET data downloads and saved as Excel (.xlsx).

Purpose of this README
- Give a short description of each data file so the dataset can be referenced in code without committing the raw data.

Files (filename -> short description)

- `Abilities.xlsx` — Canonical list of ability definitions used by O*NET (e.g., oral comprehension, problem sensitivity).
- `Abilities to Work Activities.xlsx` — Mapping that connects abilities to specific work activities (many-to-many), indicating which abilities support which activities.
- `Abilities to Work Context.xlsx` — Mapping between abilities and work context factors that influence ability use.
- `Alternate Titles.xlsx` — Alternate job titles reported for occupations (human-friendly name variations).
- `Basic Interests to RIASEC.xlsx` — Mapping between basic interest items and RIASEC (Holland) categories.
- `Content Model Reference.xlsx` — Reference describing O*NET content model fields and relationships used across the dataset.
- `DWA Reference.xlsx` — Definitions and reference table for Detailed Work Activities (DWAs) used by O*NET.
- `DWA Reference.xlsx` (duplicate) — same as above (some exports contain duplicates; treat as identical).
- `Education, Training, and Experience.xlsx` — Data about education, training, and experience items linked to occupations.
- `Education, Training, and Experience Categories.xlsx` — Category labels for the education/training/experience fields.
- `Emerging Tasks.xlsx` — Tasks identified as emerging in the labor market (as collected by O*NET surveys/research).
- `Interests.xlsx` — Canonical list of interest items used by O*NET and their descriptions.
- `Interests Illustrative Activities.xlsx` — Example activities that illustrate particular interest items.
- `Interests Illustrative Occupations.xlsx` — Example occupations that illustrate particular interest items.
- `IWA Reference.xlsx` — Reference definitions for Illustrative Work Activities (IWA) if present in the export.
- `Job Zones.xlsx` — Job zone assignments for occupations (work-level categories describing education/experience requirements).
- `Job Zone Reference.xlsx` — Descriptions for job zone levels.
- `Job Zone Reference.xlsx` (duplicate) — same as above.
- `Knowledge.xlsx` — Canonical list of knowledge areas (e.g., mathematics, engineering) with definitions.
- `Level Scale Anchors.xlsx` — Anchor descriptions for importance/level scales used in ratings (how to interpret numeric levels).
- `Level Scale Anchors.xlsx` (duplicate) — same as above.
- `Occupation Data.xlsx` — Core occupation table: SOC/O*NET-SOC codes, occupation titles, and key meta fields.
- `Occupation Level Metadata.xlsx` — Additional metadata about occupations and hierarchical attributes.
- `Occupation Level Metadata.xlsx` (duplicate) — same as above.
- `Related Occupations.xlsx` — Occupation-to-occupation relations (e.g., related or similar occupations lists).
- `RIASEC Keywords.xlsx` — Keywords mapped to RIASEC categories to support interest matching.
- `Sample of Reported Titles.xlsx` — Example job titles as reported by survey respondents.
- `Scales Reference.xlsx` — Definitions and descriptions of the rating scales used across datasets.
- `Skills.xlsx` — Canonical list of skills tracked by O*NET (brief definitions and IDs).
- `Skills to Work Activities.xlsx` — Mapping from skills to work activities (shows which skills support which activities).
- `Skills to Work Context.xlsx` — Mapping between skills and work context items.
- `Survey Booklet Locations.xlsx` — Metadata about survey booklet items and where they appeared in O*NET instruments.
- `Task Categories.xlsx` — High-level categories for task items.
- `Task Ratings.xlsx` — Occupation-level ratings for tasks (importance/level values where available).
- `Task Statements.xlsx` — Individual task statements (short textual descriptions of tasks performed in occupations).
- `Tasks to DWAs.xlsx` — Mapping of task statements to Detailed Work Activities (DWAs).
- `Task Statements.xlsx` (duplicate) — same as above.
- `Task Ratings.xlsx` (duplicate) — same as above.
- `Tasks to DWAs.xlsx` (duplicate) — same as above.
- `Technology Skills.xlsx` — Technology-related skills and tags (software/hardware/tech skills vocabulary).
- `Tools Used.xlsx` — Tools and equipment lists that may be associated with occupations.
- `UNSPSC Reference.xlsx` — Crosswalk/reference to UNSPSC or other classification codes when included in the export.
- `Work Activities.xlsx` — Standardized list of work activities used by O*NET to describe what workers do.
- `Work Context.xlsx` — Descriptions of contextual elements of work (e.g., physical work conditions, environmental factors).
- `Work Context Categories.xlsx` — Category labels for work context fields.
- `Work Styles.xlsx` — Work style definitions (personal characteristics important to job performance).
- `Work Values.xlsx` — Work values definitions (what workers value in their work environment).

- Attribution: All files are from O*NET.

-- end
