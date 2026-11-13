import { DuaItem, HadithItem, LocationState } from "../types/deenos";

export const PRESET_LOCATIONS: LocationState[] = [
  { city: "Makkah", country: "Saudi Arabia", lat: 21.4225, lng: 39.8262, source: "preset" },
  { city: "Madinah", country: "Saudi Arabia", lat: 24.4672, lng: 39.6111, source: "preset" },
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, source: "preset" },
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.006, source: "preset" },
  { city: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, source: "preset" },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869, source: "preset" },
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, source: "preset" },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, source: "preset" },
  { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, source: "preset" },
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, source: "preset" },
];

export const CALCULATION_METHODS = [
  { id: 2, label: "ISNA (North America)", fajrAngle: "15°", ishaAngle: "15°" },
  { id: 3, label: "Muslim World League (MWL)", fajrAngle: "18°", ishaAngle: "17°" },
  { id: 5, label: "Egyptian General Authority", fajrAngle: "19.5°", ishaAngle: "17.5°" },
  { id: 4, label: "Umm al-Qura University, Makkah", fajrAngle: "18.5°", ishaAngle: "90 min" },
  { id: 1, label: "University of Islamic Sciences, Karachi", fajrAngle: "18°", ishaAngle: "18°" },
  { id: 13, label: "Diyanet İşleri Başkanlığı, Turkey", fajrAngle: "18°", ishaAngle: "17°" },
  { id: 11, label: "Majlis Ugama Islam Singapura", fajrAngle: "20°", ishaAngle: "18°" },
];

export const ADHAN_VOICES = [
  { id: "mishary", name: "Mishary Rashid Alafasy", origin: "Kuwait", style: "Melodic Hijaz" },
  { id: "abdulbasit", name: "Abdul Basit 'Abd us-Samad", origin: "Egypt", style: "Classical Maqam" },
  { id: "makkah", name: "Masjid al-Haram (Makkah)", origin: "Saudi Arabia", style: "Haramain Resonance" },
  { id: "madinah", name: "Al-Masjid an-Nabawi (Madinah)", origin: "Saudi Arabia", style: "Serene Hijaz" },
];

export const DHIKR_PHRASES = [
  {
    id: "subhanallah",
    phrase: "SubhanAllah",
    arabic: "سُبْحَانَ اللَّهِ",
    meaning: "Glory be to Allah",
    defaultTarget: 33,
  },
  {
    id: "alhamdulillah",
    phrase: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    meaning: "All praise belongs to Allah",
    defaultTarget: 33,
  },
  {
    id: "allahuakbar",
    phrase: "Allahu Akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    meaning: "Allah is the Greatest",
    defaultTarget: 34,
  },
  {
    id: "astaghfirullah",
    phrase: "Astaghfirullah al-Azim",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    meaning: "I seek forgiveness from Allah, the Almighty",
    defaultTarget: 100,
  },
  {
    id: "tahlil",
    phrase: "La ilaha illallah",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    meaning: "There is no deity worthy of worship except Allah",
    defaultTarget: 100,
  },
  {
    id: "salawat",
    phrase: "Allahumma salli 'ala Muhammad",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    meaning: "O Allah, send peace and blessings upon Muhammad",
    defaultTarget: 33,
  },
];

export const HADITH_COLLECTION: HadithItem[] = [
  {
    id: "bukhari-1",
    collection: "Sahih al-Bukhari",
    reference: "Book 1, Hadith 1",
    topic: "Intentions (Niyyah)",
    narrator: "Umar ibn al-Khattab (RA)",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english:
      "Actions are judged only by intentions, and every person shall have only that which they intended.",
    grade: "Sahih",
  },
  {
    id: "muslim-2564",
    collection: "Sahih Muslim",
    reference: "Book 45, Hadith 2564",
    topic: "Sincerity & Heart",
    narrator: "Abu Hurairah (RA)",
    arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    english:
      "Verily, Allah does not look at your outward appearance or your wealth, rather He looks at your hearts and your deeds.",
    grade: "Sahih",
  },
  {
    id: "bukhari-6011",
    collection: "Sahih al-Bukhari",
    reference: "Book 78, Hadith 6011",
    topic: "Mercy & Character",
    narrator: "Jarir ibn Abdullah (RA)",
    arabic: "مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ",
    english: "He who does not show mercy to people, Allah will not show mercy to him.",
    grade: "Sahih",
  },
  {
    id: "muslim-2699",
    collection: "Sahih Muslim",
    reference: "Book 48, Hadith 2699",
    topic: "Seeking Knowledge",
    narrator: "Abu Hurairah (RA)",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english:
      "Whoever treads a path in search of knowledge, Allah will make easy for him the path to Paradise.",
    grade: "Sahih",
  },
  {
    id: "tirmidhi-2317",
    collection: "Jami' at-Tirmidhi",
    reference: "Hadith 2317",
    topic: "Excellence in Islam",
    narrator: "Abu Hurairah (RA)",
    arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    english:
      "Part of the perfection of a person's Islam is leaving alone that which does not concern them.",
    grade: "Hasan",
  },
  {
    id: "bukhari-6502",
    collection: "Sahih al-Bukhari",
    reference: "Book 81, Hadith 6502",
    topic: "Consistency in Worship",
    narrator: "Aisha (RA)",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    english:
      "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    grade: "Sahih",
  },
  {
    id: "abudawud-4941",
    collection: "Sunan Abi Dawud",
    reference: "Hadith 4941",
    topic: "Compassion",
    narrator: "Abdullah ibn Amr (RA)",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    english:
      "The merciful are shown mercy by the Most Merciful. Be merciful to those on the earth, and the One above the heavens will have mercy upon you.",
    grade: "Sahih",
  },
  {
    id: "muslim-2999",
    collection: "Sahih Muslim",
    reference: "Book 55, Hadith 2999",
    topic: "Gratitude & Patience",
    narrator: "Suhayb (RA)",
    arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
    english:
      "Wondrous is the affair of the believer, for all of his affairs are good—if ease befalls him he is grateful, and if hardship befalls him he is patient.",
    grade: "Sahih",
  },
];

export const DUA_COLLECTION: DuaItem[] = [
  {
    id: "morning-1",
    category: "Morning & Evening",
    title: "Entering the Morning Upon Fitrah",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah.",
    english:
      "We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner.",
    reference: "Sahih Muslim 2723",
  },
  {
    id: "morning-2",
    category: "Morning & Evening",
    title: "Seeking Beneficial Knowledge & Sustenance",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    transliteration:
      "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.",
    english:
      "O Allah, I ask You for beneficial knowledge, wholesome provision, and deeds that are accepted.",
    reference: "Sunan Ibn Majah 925",
  },
  {
    id: "anxiety-1",
    category: "Anxiety & Relief",
    title: "Dua of Prophet Yunus (AS) in Distress",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
    english:
      "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: "Surah Al-Anbiya 21:87 · Jami' at-Tirmidhi 3505",
  },
  {
    id: "anxiety-2",
    category: "Anxiety & Relief",
    title: "Relief from Grief and Worry",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal.",
    english:
      "O Allah, I seek refuge in You from anxiety and sorrow, from weakness and laziness.",
    reference: "Sahih al-Bukhari 6369",
  },
  {
    id: "forgiveness-1",
    category: "Forgiveness",
    title: "Sayyid al-Istighfar (Master Supplication for Forgiveness)",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration:
      "Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't.",
    english:
      "O Allah, You are my Lord; none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can.",
    reference: "Sahih al-Bukhari 6306",
  },
  {
    id: "travel-1",
    category: "Travel",
    title: "Supplication Upon Beginning a Journey",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration:
      "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
    english:
      "Glory be to Him who has subjected this to us, and we could never have it by our efforts; and verily, to our Lord we are returning.",
    reference: "Surah Az-Zukhruf 43:13-14 · Sahih Muslim 1342",
  },
  {
    id: "daily-1",
    category: "Daily Sunnah",
    title: "Steadfastness of Heart",
    arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    transliteration: "Ya Muqallibal-qulub, thabbit qalbi 'ala dinik.",
    english: "O Turner of the hearts, keep my heart firm upon Your religion.",
    reference: "Jami' at-Tirmidhi 2140",
  },
];

export interface IslamicMilestone {
  id: string;
  name: string;
  arabicName: string;
  hijriDate: string;
  gregorianEstimate: string;
  isoDate: string;
  significance: string;
}

export const ISLAMIC_MILESTONES: IslamicMilestone[] = [
  {
    id: "ramadan-1448",
    name: "Start of Ramadan 1448 AH",
    arabicName: "بداية شهر رمضان المبارك",
    hijriDate: "1 Ramadan 1448 AH",
    gregorianEstimate: "Feb 8, 2027",
    isoDate: "2027-02-08",
    significance: "Month of fasting, Quranic revelation, and Tarawih night prayers.",
  },
  {
    id: "laylatul-qadr-1448",
    name: "27th Night (Laylatul Qadr Watch)",
    arabicName: "ليلة القدر المباركة",
    hijriDate: "27 Ramadan 1448 AH",
    gregorianEstimate: "Mar 6, 2027",
    isoDate: "2027-03-06",
    significance: "The Night of Decree, better than a thousand months of worship.",
  },
  {
    id: "eid-fitr-1448",
    name: "Eid al-Fitr 1448 AH",
    arabicName: "عيد الفطر السعيد",
    hijriDate: "1 Shawwal 1448 AH",
    gregorianEstimate: "Mar 10, 2027",
    isoDate: "2027-03-10",
    significance: "Festival of breaking the fast, Zakat al-Fitr, and communal Eid Salah.",
  },
  {
    id: "arafah-1448",
    name: "Day of Arafah",
    arabicName: "يوم عرفة",
    hijriDate: "9 Dhul-Hijjah 1448 AH",
    gregorianEstimate: "May 16, 2027",
    isoDate: "2027-05-16",
    significance: "Pinnacle of Hajj; fasting expiates the sins of the preceding and coming year.",
  },
  {
    id: "eid-adha-1448",
    name: "Eid al-Adha 1448 AH",
    arabicName: "عيد الأضحى المبارك",
    hijriDate: "10 Dhul-Hijjah 1448 AH",
    gregorianEstimate: "May 17, 2027",
    isoDate: "2027-05-17",
    significance: "Festival of Sacrifice commemorating Prophet Ibrahim's devotion.",
  },
  {
    id: "hijri-1449",
    name: "Islamic New Year 1449 AH",
    arabicName: "رأس السنة الهجرية",
    hijriDate: "1 Muharram 1449 AH",
    gregorianEstimate: "Jun 6, 2027",
    isoDate: "2027-06-06",
    significance: "Commemorating the Hijrah migration from Makkah to Madinah.",
  },
  {
    id: "ashura-1449",
    name: "Day of Ashura",
    arabicName: "يوم عاشوراء",
    hijriDate: "10 Muharram 1449 AH",
    gregorianEstimate: "Jun 15, 2027",
    isoDate: "2027-06-15",
    significance: "Recommended day of fasting commemorating Allah's deliverance of Musa (AS).",
  },
];
