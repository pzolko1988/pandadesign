// SEO landing oldalak tartalma. Minden oldal önálló, valódi szolgáltatásoldal:
// egyedi H1, probléma, megoldás, folyamat, funkciók, árindulás és GYIK.
// Kitalált számadat, ügyfélnév vagy eredmény nem szerepelhet benne.

import type { FaqEntry } from "@/lib/marketing-content";

export type LandingPageContent = {
  path: string;
  breadcrumb: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutionText: string;
  benefits: { title: string; text: string }[];
  process: { title: string; text: string }[];
  features: string[];
  /** A `pricing_packages` slugjai, amelyek induló árát megmutatjuk. */
  packageSlugs: string[];
  /** A referenciák közül ezekbe a kategóriákba tartozókat mutatjuk. */
  referenceCategories: string[];
  faqs: FaqEntry[];
  serviceType: string;
};

const DEFAULT_PROCESS = [
  {
    title: "Igényfelmérés",
    text: "Tisztázzuk a célt, a célközönséget és azt, mi számít sikernek.",
  },
  {
    title: "Tervezés",
    text: "Oldalszerkezet, üzenetek és ajánlatkérési útvonal – még a design előtt.",
  },
  {
    title: "Fejlesztés",
    text: "Mobilra optimalizált, gyors felület, SEO-alapokkal és méréssel.",
  },
  {
    title: "Átadás",
    text: "Betanítás, hozzáférések átadása, mérés ellenőrzése.",
  },
];

export const LANDING_PAGES = {
  weboldalKeszites: {
    path: "/weboldal-keszites",
    breadcrumb: "Weboldal készítés",
    metaTitle:
      "Weboldal készítés vállalkozásoknak – ügyfélszerzésre tervezve | PandaDesign",
    metaDescription:
      "Weboldal készítés magyar kis- és középvállalkozásoknak: gyors, mobilbarát, mérhető oldal, amely érdeklődőket gyűjt. Induló árak, átlátható folyamat, saját tulajdonú rendszer.",
    eyebrow: "Weboldal készítés",
    h1: "Weboldal készítés, amely érdeklődőket hoz – nem csak jól mutat",
    intro:
      "A weboldal akkor ér valamit, ha a látogatóból megkeresés lesz. Ehhez világos üzenet, egyértelmű következő lépés, gyors mobilnézet és mérés kell – ezekre építünk minden projektet.",
    problemTitle: "Ismerős helyzet?",
    problems: [
      "Van weboldalad, de alig érkezik rajta keresztül megkeresés.",
      "Nem tudod, hány látogató jön, és ők mit csinálnak az oldalon.",
      "Minden apró módosításhoz a fejlesztőt kell hívnod.",
      "Az oldal mobilon lassú vagy nehezen kezelhető.",
    ],
    solutionTitle: "Weboldal, mint értékesítési eszköz",
    solutionText:
      "Először a célt és az ajánlatkérési utat tervezzük meg, utána a designt. Az elkészült oldal a te tulajdonod, mérhető, és később bővíthető új funkciókkal.",
    benefits: [
      {
        title: "Világos üzenet",
        text: "Pár másodperc alatt kiderül, mit kínálsz, kinek, és miért érdemes téged választani.",
      },
      {
        title: "Egyértelmű következő lépés",
        text: "Ajánlatkérés, hívás vagy audit – a CTA-k ott vannak, ahol a döntés születik.",
      },
      {
        title: "Mérés az első naptól",
        text: "Analitika és konverziómérés süti-hozzájárulással, hogy lásd, mi működik.",
      },
    ],
    process: DEFAULT_PROCESS,
    features: [
      "Mobilra optimalizált, reszponzív kialakítás",
      "Ajánlatkérő és kapcsolatfelvételi űrlap spamvédelemmel",
      "SEO-alapok: címek, leírások, sitemap, címsor-szerkezet",
      "Analitika és konverziómérés",
      "Süti-hozzájárulás kezelése",
      "Könnyen kezelhető adminfelület",
    ],
    packageSlugs: ["landing-sprint", "ugyfelszerzo-web", "business-lead"],
    referenceCategories: ["Céges oldal", "Landing oldal"],
    faqs: [
      {
        question: "Milyen vállalkozásoknak készítetek weboldalt?",
        answer:
          "Elsősorban szolgáltató kis- és középvállalkozásoknak, akiknél a weboldal fő feladata a bizalomépítés és az ajánlatkérés. Webshopot és egyedi rendszert is készítünk.",
      },
      {
        question: "WordPress vagy egyedi fejlesztés lesz?",
        answer:
          "Az üzleti cél dönti el. Ha sok tartalmat szerkesztesz magad, a WordPress jó választás lehet; ha gyorsaság, egyedi funkció vagy integráció a fontos, egyedi fejlesztést javaslunk. Az ajánlatban megindokoljuk a választást.",
      },
      {
        question: "Mennyibe kerül egy weboldal?",
        answer:
          "A Landing Sprint 99 000 Ft-tól, az Ügyfélszerző Web 199 000 Ft-tól, a Business / Lead csomag 299 000 Ft-tól indul. A végleges árat a tartalom és a funkciók alapján, írásban adjuk meg.",
      },
    ],
    serviceType: "Weboldal készítés",
  },

  cegesWeboldal: {
    path: "/ceges-weboldal-keszites",
    breadcrumb: "Céges weboldal készítés",
    metaTitle:
      "Céges weboldal készítés szolgáltató vállalkozásoknak | PandaDesign",
    metaDescription:
      "Céges weboldal készítés, amely bizalmat épít és ajánlatkéréshez vezet: szolgáltatásoldalak, ajánlatkérő űrlap, SEO-alapok, mérés. Ügyfélszerző Web csomag 199 000 Ft-tól.",
    eyebrow: "Céges weboldal",
    h1: "Céges weboldal, amelyből ajánlatkérés lesz",
    intro:
      "Szolgáltató vállalkozásnál a weboldal gyakran az első találkozás. Ha ott nem derül ki gyorsan, miben vagy jó és hogyan lehet veled kapcsolatba lépni, az érdeklődő a konkurenciánál köt ki.",
    problemTitle: "Ahol a céges weboldalak elvéreznek",
    problems: [
      "A szolgáltatások egyetlen, hosszú oldalon, szétszórva szerepelnek.",
      "Nincs bizalomépítő tartalom: folyamat, munkák, gyakori kérdések.",
      "Az ajánlatkérés egy eldugott e-mail-címre korlátozódik.",
      "A keresőben nem jelenik meg a vállalkozás a releváns szolgáltatásokra.",
    ],
    solutionTitle: "Szolgáltatásonként felépített, bizalomépítő oldal",
    solutionText:
      "Minden fontos szolgáltatásod saját, érthető oldalt kap, jól elhelyezett ajánlatkérő CTA-kkal. Az oldal mérhető, így látod, melyik szolgáltatás iránt van érdeklődés.",
    benefits: [
      {
        title: "Szolgáltatásoldalak",
        text: "Külön oldal a fő szolgáltatásokra – a látogatónak és a keresőnek is érthetőbb.",
      },
      {
        title: "Bizalomépítés",
        text: "Folyamat, munkák, GYIK és elérhetőség – ami egy döntés előtt számít.",
      },
      {
        title: "Te szerkeszted",
        text: "Adminfelületen módosíthatod a szövegeket, képeket és a GYIK-et.",
      },
    ],
    process: DEFAULT_PROCESS,
    features: [
      "Többoldalas felépítés, szolgáltatásoldalakkal",
      "Ajánlatkérő és kapcsolatfelvételi űrlap",
      "Referencia- és GYIK-blokk",
      "SEO-alapok és strukturált adatok",
      "Analitika és konverziómérés",
      "Adminfelület és betanítás",
    ],
    packageSlugs: ["ugyfelszerzo-web", "business-lead"],
    referenceCategories: ["Céges oldal"],
    faqs: [
      {
        question: "Hány aloldal fér bele az Ügyfélszerző Web csomagba?",
        answer:
          "Az oldalszámot a szolgáltatásaid és a tartalom alapján az ajánlatban rögzítjük, hogy ne fizess olyan oldalért, amire nincs szükséged.",
      },
      {
        question: "Tudok később új szolgáltatásoldalt felvenni?",
        answer:
          "Igen. Az adminfelületen a meglévő tartalmak szerkeszthetők; új oldaltípus vagy funkció egyedi ajánlat alapján bővíthető.",
      },
      {
        question: "Segítetek a szövegekben?",
        answer:
          "A szerkezetben és abban, mit érdemes kiemelni, igen. Teljes szövegírást külön szolgáltatásként vállalunk, ezt az ajánlatban tüntetjük fel.",
      },
    ],
    serviceType: "Céges weboldal készítés",
  },

  landingOldal: {
    path: "/landing-oldal-keszites",
    breadcrumb: "Landing oldal készítés",
    metaTitle:
      "Landing oldal készítés Google és Meta kampányokhoz | PandaDesign",
    metaDescription:
      "Konverzióra tervezett landing oldal Google Ads és Meta Ads kampányokhoz: egy ajánlat, erős CTA, gyors betöltés, mérhető konverzió. Landing Sprint 99 000 Ft-tól.",
    eyebrow: "Landing oldal",
    h1: "Landing oldal, amely a hirdetési forgalmat érdeklődővé alakítja",
    intro:
      "Ha a hirdetés a főoldalra visz, a látogató elveszik a menüpontok között. Egy jó landing oldal egyetlen ajánlatról szól, és egyetlen lépésre vezet: az ajánlatkérésre.",
    problemTitle: "Miért nem konvertál a kampány?",
    problems: [
      "A hirdetés a főoldalra visz, ahol túl sok a választási lehetőség.",
      "Az oldal üzenete nem egyezik a hirdetés ígéretével.",
      "Mobilon lassan tölt be, a látogató még előtte továbblép.",
      "Nincs konverziómérés, így nem látszik, mennyibe kerül egy érdeklődő.",
    ],
    solutionTitle: "Egy oldal, egy ajánlat, egy cél",
    solutionText:
      "A landing oldalt a kampány üzenetére és célközönségére szabjuk, gyors betöltésre optimalizáljuk, és bekötjük a konverziómérést – hogy a kampányt adatok alapján lehessen javítani.",
    benefits: [
      {
        title: "Fókusz",
        text: "Nincs zavaró navigáció: minden elem az egyetlen ajánlatot és a CTA-t támogatja.",
      },
      {
        title: "Gyorsaság",
        text: "Könnyű felépítés, mobilra optimalizálva – a fizetett kattintás nem vész el a betöltésen.",
      },
      {
        title: "Mérhető konverzió",
        text: "Konverziómérés a hirdetési platformok és az analitika felé, hozzájárulás-kezeléssel.",
      },
    ],
    process: [
      {
        title: "Ajánlat és cél",
        text: "Tisztázzuk, mit kínál a kampány, és mi számít konverziónak.",
      },
      {
        title: "Szerkezet és szöveg",
        text: "Üzenet, érvek, bizalomépítő elemek és CTA-k sorrendje.",
      },
      {
        title: "Fejlesztés és mérés",
        text: "Gyors oldal, űrlap, konverziómérés beállítása.",
      },
      {
        title: "Élesítés",
        text: "Ellenőrzés mobilon és asztali gépen, mérés tesztelése.",
      },
    ],
    features: [
      "Egyoldalas, egy ajánlatra fókuszáló felépítés",
      "Kampányhoz illesztett üzenet és CTA-k",
      "Ajánlatkérő / lead űrlap",
      "Gyors betöltés mobilon",
      "Konverziómérés és analitika",
      "SEO-alapok",
    ],
    packageSlugs: ["landing-sprint"],
    referenceCategories: ["Landing oldal"],
    faqs: [
      {
        question: "Kell külön landing oldal, ha már van weboldalam?",
        answer:
          "Fizetett kampánynál általában megéri: a célzott oldal egyetlen ajánlatra fókuszál, és a konverzió pontosan mérhető. A meglévő weboldalad mellett, akár aldomainen is működhet.",
      },
      {
        question: "A kampány beállítását is vállaljátok?",
        answer:
          "A landing oldalt és a konverziómérést készítjük el. A hirdetéskezeléshez szükség esetén bevált szakembert vonunk be, ezt az ajánlatban külön jelezzük.",
      },
      {
        question: "Milyen gyorsan készül el?",
        answer:
          "A landing oldal a legrövidebb átfutású projektünk; a pontos ütemezést az egyeztetéskor rögzítjük, és függ attól, mikor áll rendelkezésre a tartalom.",
      },
    ],
    serviceType: "Landing oldal készítés",
  },

  webshop: {
    path: "/webshop-keszites",
    breadcrumb: "Webshop készítés",
    metaTitle:
      "Webshop készítés online fizetéssel és rendeléskezeléssel | PandaDesign",
    metaDescription:
      "Webshop készítés magyar vállalkozásoknak: termékkatalógus, kosár és checkout, online fizetés, szállítási opciók, rendeléskezelés és mérés. Webshop csomag 449 000 Ft-tól.",
    eyebrow: "Webshop",
    h1: "Webshop készítés – a termékoldaltól a rendeléskezelésig",
    intro:
      "Egy webshop akkor működik jól, ha a vásárló gyorsan megtalálja a terméket, bizalommal fizet, és te könnyen kezeled a rendeléseket. Ezt a teljes folyamatot tervezzük meg.",
    problemTitle: "Ahol a webshopok pénzt veszítenek",
    problems: [
      "Bonyolult vagy hosszú fizetési folyamat, sok félbehagyott kosár.",
      "Mobilon nehezen böngészhető termékoldalak.",
      "A rendelések kezelése sok kézi munkát igényel.",
      "Nem látszik, melyik termék vagy kampány hozza a bevételt.",
    ],
    solutionTitle: "Átgondolt vásárlási folyamat, mérhetően",
    solutionText:
      "A termékkörhöz és a folyamataidhoz választjuk a megoldást (WooCommerce vagy egyedi fejlesztés), egyszerű checkouttal, online fizetéssel és e-kereskedelmi méréssel.",
    benefits: [
      {
        title: "Egyszerű checkout",
        text: "Kevesebb lépés a kosártól a fizetésig, mobilon is kényelmesen.",
      },
      {
        title: "Kezelhető adminisztráció",
        text: "Termékek, készlet és rendelések kezelése egy felületen.",
      },
      {
        title: "Mérhető értékesítés",
        text: "Látod, mely termékek és csatornák hozzák a rendeléseket.",
      },
    ],
    process: DEFAULT_PROCESS,
    features: [
      "Termékkatalógus és kategóriák",
      "Kosár és checkout",
      "Online fizetés integráció",
      "Szállítási opciók",
      "Rendeléskezelés",
      "E-kereskedelmi mérés",
    ],
    packageSlugs: ["webshop"],
    referenceCategories: ["Webshop"],
    faqs: [
      {
        question: "Milyen fizetési módokat lehet bekötni?",
        answer:
          "A projekt elején közösen választjuk ki a fizetési szolgáltatót; a bekötött fizetési és szállítási módokat az ajánlat rögzíti.",
      },
      {
        question: "WooCommerce vagy egyedi webshop?",
        answer:
          "Kisebb és közepes termékkörnél a WooCommerce gyakran jó és költséghatékony választás. Egyedi folyamatoknál vagy integrációknál egyedi fejlesztést javaslunk.",
      },
      {
        question: "Én tudom majd feltölteni a termékeket?",
        answer:
          "Igen, a termékek, árak és készletek az adminfelületen kezelhetők; a használatát betanítjuk.",
      },
    ],
    serviceType: "Webshop készítés",
  },

  ujratervezes: {
    path: "/weboldal-ujratervezes",
    breadcrumb: "Weboldal újratervezés",
    metaTitle: "Weboldal újratervezés és modernizálás | PandaDesign",
    metaDescription:
      "Elavult, lassú vagy nem konvertáló weboldal újratervezése: a működő tartalmak és keresőhelyezések megőrzésével, gyorsabb, mobilbarát és mérhető új verzió.",
    eyebrow: "Újratervezés",
    h1: "Weboldal újratervezés – a jól működő részek megtartásával",
    intro:
      "Nem mindig kell mindent eldobni. Megnézzük, mi működik a mostani oldaladon – tartalom, keresőhelyezés, forgalom –, és arra építjük az új, gyorsabb és konvertálóbb verziót.",
    problemTitle: "Mikor érdemes újratervezni?",
    problems: [
      "Az oldal elavultnak tűnik, és ez rontja a bizalmat.",
      "Mobilon lassú vagy szétesik a megjelenés.",
      "A látogatók jönnek, de nem kérnek ajánlatot.",
      "A rendszer nehezen frissíthető vagy biztonsági kockázatot jelent.",
    ],
    solutionTitle: "Átgondolt csere, forgalomvesztés nélkül",
    solutionText:
      "A meglévő URL-ekhez átirányítási tervet készítünk, a jól teljesítő tartalmakat átemeljük, és az új oldalt már méréssel és konverziós szerkezettel adjuk át.",
    benefits: [
      {
        title: "Megőrzött helyezések",
        text: "Átirányítási terv a régi URL-ekhez, hogy ne vesszen el a keresőforgalom.",
      },
      {
        title: "Modern, gyors felület",
        text: "Mobilra optimalizált, gyorsan betöltő új megjelenés.",
      },
      {
        title: "Jobb konverzió",
        text: "Új szerkezet és CTA-k, amelyek az ajánlatkérést szolgálják.",
      },
    ],
    process: [
      {
        title: "Audit",
        text: "Mi működik most, és mi nem? Tartalom, sebesség, mérés, SEO.",
      },
      {
        title: "Terv",
        text: "Megtartandó tartalmak, új szerkezet, átirányítási terv.",
      },
      {
        title: "Fejlesztés",
        text: "Az új oldal elkészítése méréssel és SEO-alapokkal.",
      },
      {
        title: "Csere",
        text: "Élesítés, átirányítások ellenőrzése, hozzáférések átadása.",
      },
    ],
    features: [
      "Kiinduló audit a jelenlegi oldalról",
      "Tartalom-átemelés és átirányítási terv",
      "Új, mobilra optimalizált design",
      "Konverzióra tervezett szerkezet",
      "SEO-alapok és mérés",
      "Adminfelület és betanítás",
    ],
    packageSlugs: ["ugyfelszerzo-web", "business-lead"],
    referenceCategories: [],
    faqs: [
      {
        question: "Elveszítem a Google-helyezéseimet az új oldallal?",
        answer:
          "A kockázatot átirányítási tervvel és a jól teljesítő tartalmak megtartásával csökkentjük. Garanciát helyezésre senki sem adhat, de a gondos átállás sokat számít.",
      },
      {
        question: "Megtarthatom a domainemet?",
        answer: "Igen, az új oldal a meglévő domaineden fog futni.",
      },
      {
        question: "Mi a helyzet a régi tartalommal?",
        answer:
          "Átnézzük, mi hasznos belőle, és azt átemeljük vagy frissítjük. Az elavult tartalmakat javaslatunkra kivezetjük.",
      },
    ],
    serviceType: "Weboldal újratervezés",
  },

  seo: {
    path: "/seo-optimalizalas",
    breadcrumb: "SEO-optimalizálás",
    metaTitle:
      "SEO-optimalizálás: technikai SEO és oldalszerkezet | PandaDesign",
    metaDescription:
      "Technikai SEO-optimalizálás meglévő és új weboldalakhoz: oldalcímek, leírások, címsor-szerkezet, sitemap, sebesség, strukturált adatok. Garantált helyezés helyett átlátható munka.",
    eyebrow: "SEO",
    h1: "SEO-optimalizálás, amely a technikai alapoknál kezdődik",
    intro:
      "Mielőtt tartalomgyártásba vagy linképítésbe fektetnél, érdemes rendbe tenni az alapokat: a keresők értsék az oldalad szerkezetét, és a látogatók gyorsan jussanak célba.",
    problemTitle: "Tipikus SEO-hibák",
    problems: [
      "Minden oldalnak ugyanaz a címe és leírása.",
      "Hiányzó vagy rossz címsor-szerkezet (H1, H2).",
      "Nincs sitemap, vagy fontos oldalak ki vannak zárva az indexelésből.",
      "Lassú betöltés, különösen mobilon.",
    ],
    solutionTitle: "Átlátható, ellenőrizhető SEO-munka",
    solutionText:
      "Technikai átvilágítás után rendbe tesszük az alapokat, és írásban átadjuk, mi készült el. Nem ígérünk garantált helyezést – ezt senki sem tudja tisztességesen megtenni.",
    benefits: [
      {
        title: "Technikai alapok",
        text: "Indexelés, sitemap, robots, canonical és strukturált adatok rendben.",
      },
      {
        title: "Érthető szerkezet",
        text: "Oldalcímek, leírások és címsorok, amelyek a keresési szándékhoz igazodnak.",
      },
      {
        title: "Gyorsabb oldal",
        text: "Képek, betöltés és mobilnézet optimalizálása.",
      },
    ],
    process: [
      {
        title: "Átvilágítás",
        text: "Technikai SEO-audit és a fő problémák listája.",
      },
      {
        title: "Prioritás",
        text: "Mit érdemes először javítani, és mi a várható hatása.",
      },
      { title: "Javítás", text: "A technikai és szerkezeti hibák kijavítása." },
      {
        title: "Átadás",
        text: "Összefoglaló arról, mi készült el, és mi a következő lépés.",
      },
    ],
    features: [
      "Egyedi oldalcímek és meta leírások",
      "Címsor-szerkezet és belső linkelés",
      "Sitemap, robots és canonical beállítások",
      "Strukturált adatok (JSON-LD)",
      "Képoptimalizálás és alt szövegek",
      "Sebesség- és mobilnézet-javítás",
    ],
    packageSlugs: [],
    referenceCategories: [],
    faqs: [
      {
        question: "Garantáljátok az első helyet a Google-ben?",
        answer:
          "Nem. A helyezés sok tényezőn múlik, amit senki sem irányít teljesen. Amit vállalunk: átlátható, ellenőrizhető technikai és szerkezeti munka.",
      },
      {
        question: "Mi a különbség a SEO-alapok és a SEO-optimalizálás között?",
        answer:
          "A SEO-alapokat minden új weboldalba beépítjük. A SEO-optimalizálás egy meglévő oldal átvilágítása és javítása, vagy az alapokon túlmutató munka – ezt egyedi ajánlat alapján végezzük.",
      },
      {
        question: "Mennyibe kerül?",
        answer:
          "Az oldal méretétől és állapotától függ. Egy ingyenes audit után konkrét, írásos ajánlatot adunk.",
      },
    ],
    serviceType: "Keresőoptimalizálás",
  },

  webalkalmazas: {
    path: "/webalkalmazas-fejlesztes",
    breadcrumb: "Webalkalmazás fejlesztés",
    metaTitle:
      "Webalkalmazás fejlesztés: CRM, ügyfélportál, admin | PandaDesign",
    metaDescription:
      "Egyedi webalkalmazás fejlesztés vállalkozásoknak: CRM, ügyfélportál, ajánlatkezelő, admin felület, workflow és automatizáció. Igényfelmérés után személyre szabott ajánlat.",
    eyebrow: "Egyedi üzleti rendszer",
    h1: "Webalkalmazás fejlesztés a saját folyamataidra",
    intro:
      "Ha a táblázatok, e-mailek és kézi adminisztráció már lassítják a működést, egy saját webes rendszer rendet tehet: egy helyen az ügyfelek, ajánlatok és feladatok.",
    problemTitle: "Mikor jön el az ideje?",
    problems: [
      "Az ügyféladatok több táblázatban és e-mailben szétszórva vannak.",
      "Az ajánlatkészítés és -követés sok kézi munkát igényel.",
      "Az ügyfeleid nem látják, hol tart a projektjük vagy rendelésük.",
      "A dobozos szoftverek nem illeszkednek a folyamataidhoz.",
    ],
    solutionTitle: "Rendszer, ami a te működésedhez igazodik",
    solutionText:
      "Igényfelméréssel kezdünk, lépésekre bontjuk a fejlesztést, és úgy építjük fel a rendszert, hogy később bővíthető legyen – a rendszer és az adatok a te vállalkozásodhoz tartoznak.",
    benefits: [
      {
        title: "Kevesebb kézi munka",
        text: "Automatizált értesítések, státuszok és ismétlődő lépések.",
      },
      {
        title: "Egy helyen minden",
        text: "Ügyfelek, ajánlatok, feladatok és dokumentumok egy felületen.",
      },
      {
        title: "Bővíthető alap",
        text: "Új modulok később is hozzáadhatók, újrakezdés nélkül.",
      },
    ],
    process: [
      {
        title: "Igényfelmérés",
        text: "Folyamatok, szerepkörök, adatok és prioritások feltérképezése.",
      },
      {
        title: "Specifikáció",
        text: "Írásos terv az első verzió funkcióiról és ütemezéséről.",
      },
      {
        title: "Fejlesztés lépésenként",
        text: "Rendszeres bemutatók, hogy menet közben is láss eredményt.",
      },
      {
        title: "Átadás és bővítés",
        text: "Betanítás, dokumentáció, majd a következő modulok.",
      },
    ],
    features: [
      "CRM és ügyféladatbázis",
      "Ügyfélportál",
      "Ajánlatkezelés",
      "Admin felület és jogosultságok",
      "Workflow és automatizáció",
      "Integrációk külső rendszerekkel",
    ],
    packageSlugs: ["egyedi-webapp"],
    referenceCategories: [],
    faqs: [
      {
        question: "Mennyibe kerül egy egyedi webalkalmazás?",
        answer:
          "A funkciók körétől függ, ezért igényfelmérés után adunk személyre szabott, írásos ajánlatot. Érdemes egy kisebb első verzióval indulni, és azt bővíteni.",
      },
      {
        question: "Kié lesz a forráskód?",
        answer:
          "A rendszer és az adatok a te vállalkozásodhoz tartoznak; átadáskor megkapod a szükséges hozzáféréseket. A részleteket a szerződés rögzíti.",
      },
      {
        question: "Össze lehet kötni meglévő rendszerekkel?",
        answer:
          "Ha a másik rendszer biztosít erre felületet (API-t), általában igen. Ezt az igényfelméréskor ellenőrizzük.",
      },
    ],
    serviceType: "Webalkalmazás fejlesztés",
  },
} satisfies Record<string, LandingPageContent>;

export const LANDING_PAGE_PATHS = Object.values(LANDING_PAGES).map(
  (page) => page.path,
);
