# Study data sources

IslamicHub keeps provider attribution and user-state responsibilities explicit.

## Hadith

- Source corpus: `fawazahmed0/hadith-api`, version 1.
- Delivery: jsDelivr with the GitHub raw corpus as fallback.
- Supported English/Arabic pairs: Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, and Sunan ad-Darimi.
- The source repository is released under the Unlicense and includes its own references file.
- A trusted collection name does not imply that every narration in every Sunan has the same grade. IslamicHub displays available grading metadata and directs users to qualified scholarship.

## Azkaar

- The selected daily routines are stored locally in the application so they remain readable without a provider request.
- Each entry includes its source reference. The grouping follows the established daily categories found in _Hisn al-Muslim_ and the cited primary Hadith collections.
- Text changes require reference review and regression review before release.

## Prayer times

- Provider: AlAdhan timings API.
- Users select a recognized calculation method and Standard or Hanafi Asr convention.
- The application displays the method returned by the provider and warns that a trusted local mosque or authority may apply regional adjustments.
- Qibla bearing is calculated locally from the selected coordinates to the Kaaba and expressed relative to true north.

## Personal data

- Guest state is stored in `localStorage` under `islamichub:study-state`.
- Signed-in state synchronizes through the authenticated preferences endpoint into `UserPreference.studyState`.
- Exact coordinates are requested only after user action and are never continuously tracked.
