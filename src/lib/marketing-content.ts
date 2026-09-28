// Központi értékesítési tartalmak és a CMS-tartalmak kódbeli tartalékai.
//
// Ami az adminban szerkeszthető (szolgáltatások, árcsomagok, GYIK, hero stb.),
// annak itt csak a tartalék (fallback) változata van – az élő tartalom a
// Supabase-ből érkezik. A többi szöveg (trust bar, problémák, tulajdonjog
// blokk) szándékosan kódban van, mert a pozicionálás része.
//
// FONTOS: ide semmilyen kitalált számadat, ügyfélnév vagy eredmény nem kerülhet.

export const AUDIT_PATH = "/ingyenes-weboldal-audit";
export const CONTACT_PATH = "/kapcsolat";

export const HERO_TRUST_ITEMS = [
  "Saját rendszer",
  "Mobilra optimalizálva",
  "SEO-alapok",
  "Mérhető konverzió",
  "Továbbfejleszthető",
] as const;

export const PROBLEMS = [
  {
    title: "Nem derül ki pár másodperc alatt, mit kínálsz",
    description:
      "Ha a látogató nem érti azonnal, miben segítesz és kinek, továbblép – még akkor is, ha pont rád lenne szüksége.",
  },
  {
    title: "Nincs egyértelmű következő lépés",
    description:
      "Egy eldugott kapcsolat menüpont kevés. Ha nincs világos ajánlatkérési út, az érdeklődő nem keres meg.",
  },
  {
    title: "Nem tudod, mi működik",
    description:
      "Mérés nélkül nem látszik, honnan jönnek a megkeresések, és melyik oldal vagy kampány hoz eredményt.",
  },
  {
    title: "Mobilon lassú vagy nehézkes",
    description:
      "A látogatók jelentős része telefonról érkezik. Ha ott akadozik az oldal, a bizalom is elvész.",
  },
] as const;

export const BENEFITS = [
  {
    key: "ownership",
    title: "Saját tulajdon",
    description:
      "A domain, a hozzáférések, a rendszer és az adatok a tieid. Átadáskor minden kulcsot megkapsz.",
  },
  {
    key: "conversion",
    title: "Konverzióra tervezve",
    description:
      "Nem csak szép felület: a szerkezet, a szövegek helye és a CTA-k is az érdeklődőszerzést szolgálják.",
  },
  {
    key: "measurable",
    title: "Mérhető",
    description:
      "Analitikát és konverziómérést állítunk be, hogy lásd, mi hoz ajánlatkérést – a süti-hozzájárulás szabályai szerint.",
  },
  {
    key: "extendable",
    title: "Továbbfejleszthető",
    description:
      "CRM, automatizáció, webshop, ügyfélportál vagy AI-funkció később is hozzáadható, újrakezdés nélkül.",
  },
] as const;

export const OWNERSHIP_POINTS = [
  {
    title: "Saját domain",
    description: "A domain a te nevedre kerül, nem a miénkre.",
  },
  {
    title: "Saját hozzáférések",
    description:
      "Átadáskor megkapod az admin-, tárhely- és analitikai hozzáféréseket.",
  },
  {
    title: "Átadható rendszer",
    description:
      "Elterjedt, dokumentált technológiákra építünk, így más szakember is át tudja venni.",
  },
  {
    title: "Te rendelkezel a tartalommal",
    description:
      "A szövegek, képek és a beérkező adatok a te vállalkozásodhoz tartoznak.",
  },
  {
    title: "Nincs indokolatlan bezártság",
    description:
      "Nem kötünk zárt, csak nálunk működő rendszerhez. Ha váltanál, nem kell nulláról kezdened.",
  },
] as const;

export type ServiceCategory = {
  slug: string;
  number: string;
  title: string;
  audience: string;
  summary: string;
  goals: string[];
  technology: string;
  landingPath: string;
  priceFrom: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "ugyfelszerzo-weboldal",
    number: "01",
    title: "Ügyfélszerző weboldal",
    audience: "Szolgáltató vállalkozásoknak",
    summary:
      "Céges weboldal, amely bizalmat épít, és egyértelmű utat ad az ajánlatkéréshez.",
    goals: [
      "Bizalomépítés",
      "Ajánlatkérés",
      "Kapcsolatfelvétel",
      "SEO-alapok",
      "Mérhetőség",
    ],
    technology:
      "Egyedi fejlesztés vagy WordPress – a projekt igényei alapján választunk.",
    landingPath: "/ceges-weboldal-keszites",
    priceFrom: "199 000 Ft-tól",
  },
  {
    slug: "landing-kampanyoldal",
    number: "02",
    title: "Landing / kampányoldal",
    audience: "Google Ads, Meta Ads és célzott kampányokhoz",
    summary:
      "Egyetlen ajánlatra fókuszáló oldal, amelyből a hirdetésre kattintó látogató érdeklődő lesz.",
    goals: ["Egyetlen ajánlat", "Erős CTA", "Mérhető konverzió"],
    technology: "Gyors betöltésre optimalizált, könnyű felépítés.",
    landingPath: "/landing-oldal-keszites",
    priceFrom: "99 000 Ft-tól",
  },
  {
    slug: "webshop",
    number: "03",
    title: "Webshop",
    audience: "Online értékesítéshez",
    summary:
      "Webáruház termékkatalógussal, fizetéssel és átlátható rendeléskezeléssel.",
    goals: [
      "Termékértékesítés",
      "Checkout",
      "Fizetés",
      "Rendeléskezelés",
      "Mérhetőség",
    ],
    technology:
      "WooCommerce vagy egyedi megoldás – a termékkör és a folyamatok alapján.",
    landingPath: "/webshop-keszites",
    priceFrom: "449 000 Ft-tól",
  },
  {
    slug: "egyedi-uzleti-rendszer",
    number: "04",
    title: "Egyedi üzleti rendszer",
    audience: "Ha a megszokott eszközök már szűknek bizonyulnak",
    summary:
      "Webes rendszer a saját folyamataidra: kevesebb kézi munka, átláthatóbb működés.",
    goals: [
      "CRM",
      "Ügyfélportál",
      "Admin felület",
      "Ajánlatkezelés",
      "Workflow és automatizáció",
      "Belső üzleti rendszer",
    ],
    technology: "Modern webes stack, adatbázissal és jogosultságkezeléssel.",
    landingPath: "/webalkalmazas-fejlesztes",
    priceFrom: "Egyedi ajánlat",
  },
];

// Az árcsomagok tartaléka. Az élő adat a `pricing_packages` táblából jön,
// a supabase/migrations/20260928120000_conversion_repositioning.sql
// ugyanezekkel az értékekkel tölti fel.
export type PricingPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  audience: string;
  outcome: string;
  scope_note: string;
  price_label: string;
  currency: string;
  price_suffix: string;
  badge_text: string;
  cta_text: string;
  cta_url: string;
  features: string[];
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
};

export const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  {
    id: "fallback-landing-sprint",
    slug: "landing-sprint",
    name: "Landing Sprint",
    description: "Célzott kampányoldal / szolgáltatáslanding",
    audience:
      "Ha egy konkrét szolgáltatást vagy kampányt szeretnél gyorsan, mérhetően elindítani.",
    outcome:
      "Egy fókuszált oldal, amely a hirdetési forgalmat ajánlatkéréssé alakítja.",
    scope_note: "Egy oldal, egy ajánlat, egy fő konverziós cél.",
    price_label: "99 000",
    currency: "Ft",
    price_suffix: "-tól",
    badge_text: "",
    cta_text: "Ajánlatot kérek",
    cta_url: "/kapcsolat?csomag=landing-sprint",
    features: [
      "Egyoldalas, egy ajánlatra fókuszáló felépítés",
      "Konverzióra tervezett szerkezet és CTA-k",
      "Ajánlatkérő / kapcsolatfelvételi űrlap",
      "Mobilra optimalizált kialakítás",
      "SEO-alapok",
      "Analitika és konverziómérés beállítása",
    ],
    sort_order: 10,
    is_featured: false,
    is_visible: true,
  },
  {
    id: "fallback-ugyfelszerzo-web",
    slug: "ugyfelszerzo-web",
    name: "Ügyfélszerző Web",
    description: "Professzionális céges weboldal",
    audience:
      "Szolgáltató vállalkozásoknak, akiknek a weboldal a fő bizalomépítő és ajánlatkérési csatorna.",
    outcome:
      "Céges weboldal, amely bemutat, bizalmat épít és érdeklődőket gyűjt.",
    scope_note:
      "Többoldalas céges weboldal; a pontos oldalszámot és tartalmat az ajánlat rögzíti.",
    price_label: "199 000",
    currency: "Ft",
    price_suffix: "-tól",
    badge_text: "Ajánlott",
    cta_text: "Ajánlatot kérek",
    cta_url: "/kapcsolat?csomag=ugyfelszerzo-web",
    features: [
      "Többoldalas céges weboldal",
      "Szolgáltatásoldalak ajánlatkérő CTA-kkal",
      "Kapcsolat- és ajánlatkérő űrlap",
      "Mobilra optimalizált kialakítás",
      "SEO-alapok",
      "Analitika és konverziómérés",
      "Süti-hozzájárulás kezelése",
      "Könnyen kezelhető adminfelület",
      "Betanítás és átadás",
    ],
    sort_order: 20,
    is_featured: true,
    is_visible: true,
  },
  {
    id: "fallback-business-lead",
    slug: "business-lead",
    name: "Business / Lead",
    description: "Komplexebb lead rendszer, több funkcióval",
    audience:
      "Ha több szolgáltatásod, több érdeklődési utad van, és a beérkező megkereséseket rendszerben kezelnéd.",
    outcome:
      "Weboldal és lead-kezelő rendszer egyben: gyűjt, rendszerez és értesít.",
    scope_note:
      "Az Ügyfélszerző Web tartalma, kiegészítve lead-kezeléssel és bővített méréssel.",
    price_label: "299 000",
    currency: "Ft",
    price_suffix: "-tól",
    badge_text: "",
    cta_text: "Ajánlatot kérek",
    cta_url: "/kapcsolat?csomag=business-lead",
    features: [
      "Az Ügyfélszerző Web minden eleme",
      "Több ajánlatkérési út (pl. audit, kalkulátor, foglalás)",
      "Beérkező megkeresések kezelése adminfelületen",
      "E-mail-értesítés új érdeklődőről",
      "Blog / tudástár modul",
      "Bővített mérés: CTA- és űrlapesemények",
    ],
    sort_order: 30,
    is_featured: false,
    is_visible: true,
  },
  {
    id: "fallback-webshop",
    slug: "webshop",
    name: "Webshop",
    description: "E-commerce rendszer",
    audience: "Ha termékeket szeretnél online értékesíteni.",
    outcome: "Működő webáruház a termékkatalógustól a rendeléskezelésig.",
    scope_note:
      "A termékszámot, a fizetési és szállítási módokat az ajánlat rögzíti.",
    price_label: "449 000",
    currency: "Ft",
    price_suffix: "-tól",
    badge_text: "",
    cta_text: "Ajánlatot kérek",
    cta_url: "/kapcsolat?csomag=webshop",
    features: [
      "Termékkatalógus",
      "Kosár és checkout",
      "Online fizetés integráció",
      "Szállítási opciók",
      "Rendeléskezelés",
      "Analitika és konverziómérés",
      "Webshop betanítás",
    ],
    sort_order: 40,
    is_featured: false,
    is_visible: true,
  },
  {
    id: "fallback-egyedi-webapp",
    slug: "egyedi-webapp",
    name: "Egyedi Webapp",
    description: "Személyre szabott ajánlat",
    audience:
      "Ha CRM-re, ügyfélportálra, ajánlatkezelőre vagy belső rendszerre van szükséged.",
    outcome: "A saját folyamataidra szabott webes rendszer.",
    scope_note: "Igényfelmérés után részletes, írásos ajánlatot adunk.",
    price_label: "Egyedi ajánlat",
    currency: "",
    price_suffix: "",
    badge_text: "",
    cta_text: "Egyeztetést kérek",
    cta_url: "/kapcsolat?csomag=egyedi-webapp",
    features: [
      "Igényfelmérés és folyamattervezés",
      "Egyedi adminfelület és jogosultságok",
      "Integrációk és automatizációk",
      "Továbbfejleszthető architektúra",
    ],
    sort_order: 50,
    is_featured: false,
    is_visible: true,
  },
];

export function isNumericPrice(label: string) {
  return /\d/.test(label);
}

export type FaqEntry = { question: string; answer: string };

// Árazási scope – csak olyan állítás, amely üzletileg meghatározott.
// A még el nem döntött pontok (pl. módosítási körök száma, domain/tárhely díja)
// a migrációban inaktív GYIK-elemként szerepelnek, az adminban véglegesíthetők.
export const DEFAULT_PRICING_FAQ: FaqEntry[] = [
  {
    question: "Ki adja a szövegeket és a képeket?",
    answer:
      "Alapesetben a tartalmat te biztosítod, mi segítünk a szerkezet kialakításában és abban, hogy mit érdemes kiemelni. Szövegírás és képválogatás külön kérhető, ezt az ajánlatban tüntetjük fel.",
  },
  {
    question: "A domain és a tárhely kinek a nevén lesz?",
    answer:
      "A domain a te nevedre kerül, és a tárhely-hozzáférések is nálad lesznek. Ha még nincs domained vagy tárhelyed, segítünk a kiválasztásban és a beállításban. Hogy ezek díja része-e a projektnek, azt az árajánlat egyértelműen rögzíti.",
  },
  {
    question: "Benne van az analitika és a konverziómérés?",
    answer:
      "Igen, a csomagok tartalmazzák az analitika és a konverziómérés beállítását. A mérés a süti-hozzájárulás szabályai szerint működik: hozzájárulás nélkül nem futnak analitikai sütik.",
  },
  {
    question: "Mit jelent pontosan a „SEO-alapok”?",
    answer:
      "Technikai alapbeállításokat: egyedi oldalcímek és leírások, helyes címsor-szerkezet, sitemap és robots beállítás, mobilbarát és gyors betöltésű felépítés, képek alt szövegei. Nem jelent garantált helyezést, és nem tartalmaz folyamatos SEO-munkát vagy linképítést – ez külön szolgáltatás.",
  },
  {
    question: "Kell süti-hozzájárulás (cookie consent) a weboldalamra?",
    answer:
      "Ha a weboldal analitikai vagy marketing sütiket használ, igen. Ilyenkor hozzájárulás-kezelőt építünk be, hogy a mérés csak a látogató engedélyével induljon el.",
  },
  {
    question: "Mennyi idő alatt készül el?",
    answer:
      "Egy egyszerűbb oldal jellemzően néhány hét alatt elkészül, az összetettebb rendszerek hosszabb időt igényelnek. A pontos ütemezést az egyeztetéskor, írásban rögzítjük – és nagyban függ attól is, mikor áll rendelkezésre a tartalom.",
  },
  {
    question: "Mi van, ha később új funkció kell?",
    answer:
      "Bővíthető rendszert építünk, így később is hozzáadható például foglalás, CRM, automatizáció, webshop vagy ügyfélportál. A plusz funkciókat egyedi ajánlat alapján készítjük el.",
  },
  {
    question: "Kié lesz a weboldal és milyen hozzáféréseket kapok?",
    answer:
      "A domain, a tartalom és a beérkező adatok a te vállalkozásodhoz tartoznak. Átadáskor megkapod az admin-, tárhely- és analitikai hozzáféréseket, így nem függsz tőlünk.",
  },
  {
    question: "Mi történik az átadás után?",
    answer:
      "Betanítást adunk az adminfelület használatához. Karbantartást, frissítéseket és további fejlesztést külön megállapodás alapján vállalunk.",
  },
];

export const AUDIT_HELP_TOPICS = [
  "Kevés az érdeklődő / ajánlatkérés",
  "Elavult a weboldal megjelenése",
  "Mobilon nem működik jól",
  "Nem jelenünk meg a Google-ben",
  "Nem tudjuk, mi működik (mérés)",
  "Kampányhoz kellene landing oldal",
  "Egyéb",
] as const;

export const ABOUT_SUMMARY = {
  title: "Közvetlenül azzal dolgozol, aki megépíti",
  text: "Nincs felesleges közvetítői lánc. Közvetlenül azzal egyeztetsz, aki megtervezi és megvalósítja a rendszeredet. Speciális feladatoknál bevált szakemberekkel dolgozunk együtt.",
} as const;
