import type { AzkarCategory } from "@/types/study";

export const AZKAAR: AzkarCategory[] = [
  {
    id: "morning",
    title: "Morning Azkaar",
    arabicTitle: "أذكار الصباح",
    description:
      "Begin the day with remembrance, gratitude, and reliance upon Allah.",
    items: [
      {
        id: "morning-life",
        arabic:
          "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        transliteration:
          "Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nushūr.",
        translation:
          "O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.",
        repetitions: 1,
        reference: "Sunan Abi Dawud 5068; Jamiʿ at-Tirmidhi 3391",
      },
      {
        id: "morning-istighfar",
        arabic:
          "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration:
          "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mastaṭaʿtu. Aʿūdhu bika min sharri mā ṣanaʿtu. Abūʾu laka biniʿmatika ʿalayya, wa abūʾu laka bidhanbī, faghfir lī fa-innahu lā yaghfirudh-dhunūba illā anta.",
        translation:
          "O Allah, You are my Lord; none has the right to be worshipped except You. You created me and I am Your servant. I uphold Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me and my sin, so forgive me, for none forgives sins except You.",
        repetitions: 1,
        reference: "Sahih al-Bukhari 6306",
      },
      {
        id: "morning-contentment",
        arabic:
          "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration:
          "Raḍītu billāhi rabban, wa bil-islāmi dīnan, wa bi-Muḥammadin ṣallallāhu ʿalayhi wa sallama nabiyyan.",
        translation:
          "I am pleased with Allah as Lord, Islam as religion, and Muhammad ﷺ as Prophet.",
        repetitions: 3,
        reference: "Sunan Abi Dawud 5072; Jamiʿ at-Tirmidhi 3389",
      },
      {
        id: "morning-protection",
        arabic:
          "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration:
          "Bismillāhilladhī lā yaḍurru maʿasmihi shayʾun fil-arḍi wa lā fis-samāʾi, wa Huwas-Samīʿul-ʿAlīm.",
        translation:
          "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
        repetitions: 3,
        reference: "Sunan Abi Dawud 5088; Jamiʿ at-Tirmidhi 3388",
      },
    ],
  },
  {
    id: "evening",
    title: "Evening Azkaar",
    arabicTitle: "أذكار المساء",
    description:
      "Close the day in remembrance and seek protection through the night.",
    items: [
      {
        id: "evening-life",
        arabic:
          "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        transliteration:
          "Allāhumma bika amsaynā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaykal-maṣīr.",
        translation:
          "O Allah, by You we enter the evening and by You we enter the morning; by You we live and by You we die, and to You is the final return.",
        repetitions: 1,
        reference: "Sunan Abi Dawud 5068; Jamiʿ at-Tirmidhi 3391",
      },
      {
        id: "evening-refuge",
        arabic:
          "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration:
          "Aʿūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq.",
        translation:
          "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        repetitions: 3,
        reference: "Sahih Muslim 2709",
      },
      {
        id: "evening-contentment",
        arabic:
          "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration:
          "Raḍītu billāhi rabban, wa bil-islāmi dīnan, wa bi-Muḥammadin ṣallallāhu ʿalayhi wa sallama nabiyyan.",
        translation:
          "I am pleased with Allah as Lord, Islam as religion, and Muhammad ﷺ as Prophet.",
        repetitions: 3,
        reference: "Sunan Abi Dawud 5072; Jamiʿ at-Tirmidhi 3389",
      },
      {
        id: "evening-protection",
        arabic:
          "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration:
          "Bismillāhilladhī lā yaḍurru maʿasmihi shayʾun fil-arḍi wa lā fis-samāʾi, wa Huwas-Samīʿul-ʿAlīm.",
        translation:
          "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
        repetitions: 3,
        reference: "Sunan Abi Dawud 5088; Jamiʿ at-Tirmidhi 3388",
      },
    ],
  },
  {
    id: "after-prayer",
    title: "After Prayer",
    arabicTitle: "أذكار بعد الصلاة",
    description:
      "Established remembrances recited after the obligatory prayers.",
    items: [
      {
        id: "prayer-forgiveness",
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        transliteration: "Astaghfirullāh.",
        translation: "I seek Allah’s forgiveness.",
        repetitions: 3,
        reference: "Sahih Muslim 591",
      },
      {
        id: "prayer-peace",
        arabic:
          "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ",
        transliteration:
          "Allāhumma antas-Salāmu wa minkas-salām, tabārakta yā Dhal-Jalāli wal-Ikrām.",
        translation:
          "O Allah, You are Peace and from You is peace. Blessed are You, Owner of majesty and honor.",
        repetitions: 1,
        reference: "Sahih Muslim 591",
      },
      {
        id: "prayer-tasbih",
        arabic: "سُبْحَانَ اللَّهِ",
        transliteration: "Subḥānallāh.",
        translation: "Glory is to Allah.",
        repetitions: 33,
        reference: "Sahih Muslim 597",
      },
      {
        id: "prayer-tahmid",
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "Alḥamdulillāh.",
        translation: "All praise is for Allah.",
        repetitions: 33,
        reference: "Sahih Muslim 597",
      },
      {
        id: "prayer-takbir",
        arabic: "اللَّهُ أَكْبَرُ",
        transliteration: "Allāhu akbar.",
        translation: "Allah is the Greatest.",
        repetitions: 33,
        reference: "Sahih Muslim 597",
      },
    ],
  },
  {
    id: "before-sleep",
    title: "Before Sleep",
    arabicTitle: "أذكار النوم",
    description:
      "Entrust the night to Allah with the Prophetic remembrances before sleep.",
    items: [
      {
        id: "sleep-life",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismikallāhumma amūtu wa aḥyā.",
        translation: "In Your name, O Allah, I die and I live.",
        repetitions: 1,
        reference: "Sahih al-Bukhari 6324",
      },
      {
        id: "sleep-side",
        arabic:
          "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        transliteration:
          "Bismika rabbī waḍaʿtu janbī, wa bika arfaʿuhu. In amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihi ʿibādakaṣ-ṣāliḥīn.",
        translation:
          "In Your name, my Lord, I lay down my side and by You I raise it. If You take my soul, have mercy upon it; and if You return it, protect it as You protect Your righteous servants.",
        repetitions: 1,
        reference: "Sahih al-Bukhari 6320; Sahih Muslim 2714",
      },
      {
        id: "sleep-protection",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allāhumma qinī ʿadhābaka yawma tabʿathu ʿibādak.",
        translation:
          "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        repetitions: 3,
        reference: "Sunan Abi Dawud 5045; Jamiʿ at-Tirmidhi 3398",
      },
    ],
  },
];
