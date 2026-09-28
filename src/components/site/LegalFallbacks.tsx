import { getRouteApi, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { LegalPageSlug } from "@/lib/legal-pages";

// Tényszerű tartalék jogi oldalak arra az esetre, ha az adminban még nincs
// közzétett változat. Kizárólag a weboldal tényleges, kódból ellenőrizhető
// működését és a site_settings táblában megadott valós vállalkozási adatokat
// írják le. Az adminban (Jogi oldalak) közzétett dokumentum mindig felülírja.
//
// TODO(jogi): a végleges dokumentumokat jogász által ellenőrzött szöveggel
// kell közzétenni az adminban. Hiányzó adatok: székhely, nyilvántartási szám,
// adószám, tárhelyszolgáltató neve és címe, adatmegőrzési idők, e-mail-cím.

const rootApi = getRouteApi("__root__");

type Business = {
  siteName: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
};

function useBusiness(): Business {
  const data = rootApi.useLoaderData();

  return {
    siteName: data?.site_name?.trim() || "PandaDesign",
    legalName: data?.legal_name?.trim() || "",
    email: data?.show_contact_details ? data.email.trim() : "",
    phone: data?.show_contact_details ? data.phone.trim() : "",
    address: data?.show_contact_details
      ? [data.postal_code, data.city, data.address_line]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(" ")
      : "",
  };
}

export function LegalFallbackDocument({
  slug,
  title,
}: {
  slug: LegalPageSlug;
  title: string;
}) {
  const business = useBusiness();

  const content: Record<LegalPageSlug, ReactNode> = {
    impresszum: <Imprint business={business} />,
    adatkezeles: <PrivacyNotice business={business} />,
    "cookie-tajekoztato": <CookieNotice />,
    aszf: <Terms business={business} />,
  };

  return (
    <div className="bg-secondary/30 py-14 md:py-20">
      <article className="container-page">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white px-5 py-8 shadow-soft sm:px-8 md:px-12 md:py-12">
          <header className="border-b pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Jogi információ
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-5xl">
              {title}
            </h1>
          </header>
          <div className="mt-8 space-y-5 text-base leading-8 text-ink [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-7">
            {content[slug]}
          </div>
        </div>
      </article>
    </div>
  );
}

function ContactLines({ business }: { business: Business }) {
  return (
    <ul>
      {business.legalName && <li>Vállalkozás: {business.legalName}</li>}
      <li>Márkanév: {business.siteName}</li>
      {business.address && <li>Cím: {business.address}</li>}
      {business.phone && <li>Telefon: {business.phone}</li>}
      {business.email && <li>E-mail: {business.email}</li>}
      <li>
        Online kapcsolatfelvétel:{" "}
        <Link to="/kapcsolat" className="font-semibold text-brand underline">
          kapcsolati űrlap
        </Link>
      </li>
    </ul>
  );
}

function Imprint({ business }: { business: Business }) {
  return (
    <>
      <h2>A weboldal üzemeltetője</h2>
      <ContactLines business={business} />
      <h2>Szerzői jog</h2>
      <p>
        A weboldal szövegei, grafikai elemei és forráskódja a(z){" "}
        {business.siteName} tulajdonát képezik; felhasználásuk kizárólag
        előzetes írásbeli engedéllyel lehetséges.
      </p>
    </>
  );
}

function PrivacyNotice({ business }: { business: Business }) {
  return (
    <>
      <p>
        Ez a tájékoztató azt írja le, milyen személyes adatokat kezel a
        weboldal, milyen célból, és milyen jogaid vannak ezzel kapcsolatban.
      </p>

      <h2>1. Adatkezelő</h2>
      <ContactLines business={business} />

      <h2>2. Kezelt adatok</h2>
      <p>
        <strong>Ajánlatkérés és ingyenes weboldal-audit űrlap:</strong> név,
        e-mail-cím, telefonszám (nem kötelező), vállalkozás neve, a választott
        szolgáltatás vagy téma, költségkeret, a megadott weboldal címe és az
        üzenet szövege.
      </p>
      <p>
        <strong>Beküldéssel együtt rögzített technikai adatok:</strong> a
        beküldés időpontja, az oldal, amelyről az űrlapot elküldted, a hivatkozó
        oldal, a kampánykövető (UTM) paraméterek és a böngésző azonosítója (user
        agent). Ezek a visszaélések kiszűrését és annak megértését szolgálják,
        hogy mely csatornák hoznak megkeresést.
      </p>
      <p>
        <strong>Hozzájárulások:</strong> az adatkezelési tájékoztató
        elfogadásának ténye és időpontja, valamint – ha megadtad – a marketing
        célú megkereséshez adott hozzájárulás és annak időpontja.
      </p>

      <h2>3. Az adatkezelés célja és jogalapja</h2>
      <ul>
        <li>
          A megkeresés megválaszolása, az audit és az árajánlat elkészítése,
          szerződés előkészítése – jogalap: a te kérésedre, a szerződés
          megkötését megelőzően szükséges lépések (GDPR 6. cikk (1) b) pont).
        </li>
        <li>
          Marketing célú megkeresés – kizárólag, ha ehhez külön hozzájárultál
          (GDPR 6. cikk (1) a) pont). A hozzájárulás bármikor visszavonható.
        </li>
        <li>
          Analitikai és marketing sütik – kizárólag hozzájárulás alapján, lásd a{" "}
          <Link
            to="/cookie-tajekoztato"
            className="font-semibold text-brand underline"
          >
            süti-tájékoztatót
          </Link>
          .
        </li>
      </ul>

      <h2>4. Az adatok megőrzése</h2>
      <p>
        Az ajánlatkéréssel kapcsolatos adatokat addig kezeljük, amíg az a
        megkeresés megválaszolásához, illetve az ajánlat és a szerződés
        előkészítéséhez szükséges. A marketing célú hozzájárulás alapján kezelt
        adatokat a hozzájárulás visszavonásáig kezeljük. Törlést bármikor
        kérhetsz az elérhetőségeinken.
      </p>

      <h2>5. Adatfeldolgozók és címzettek</h2>
      <ul>
        <li>
          Supabase Inc. – az űrlapadatok tárolása védett adatbázisban
          (supabase.com).
        </li>
        <li>
          Resend – e-mail-értesítés küldése az új megkeresésről az adatkezelő
          részére (resend.com).
        </li>
        <li>A weboldal tárhelyszolgáltatója – a weboldal kiszolgálása.</li>
        <li>
          Google Ireland Ltd. – analitika (Google Analytics), kizárólag ha a
          mérés be van kapcsolva, és ahhoz hozzájárultál.
        </li>
      </ul>
      <p>
        Az adatokat nem adjuk el, és nem adjuk át harmadik félnek marketing
        célra.
      </p>

      <h2>6. Jogaid</h2>
      <p>
        Kérheted a rólad kezelt adatokhoz való hozzáférést, azok helyesbítését,
        törlését, kezelésük korlátozását, az adathordozhatóságot, és
        tiltakozhatsz az adatkezelés ellen. A hozzájárulásodat bármikor
        visszavonhatod; ez nem érinti a visszavonás előtti adatkezelés
        jogszerűségét.
      </p>
      <p>
        Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH,
        naih.hu) fordulhatsz, illetve bírósághoz is fordulhatsz. Javasoljuk,
        hogy előbb minket keress meg, hogy a problémát gyorsan orvosolni tudjuk.
      </p>
    </>
  );
}

function CookieNotice() {
  return (
    <>
      <p>
        A weboldal a működéséhez szükséges adatokat a böngésződ helyi
        tárolójában (localStorage) tárolja. Analitikai és marketing célú sütiket
        csak a hozzájárulásoddal töltünk be. A döntésedet bármikor módosíthatod
        a lábléc „Süti-beállítások” linkjével.
      </p>

      <h2>Szükséges tárolás</h2>
      <ul>
        <li>
          <strong>pandadesign.cookie-consent</strong> – a süti-döntésed
          (elfogadás, elutasítás, kategóriák) megjegyzése. Addig marad meg, amíg
          nem törlöd a böngészőből.
        </li>
        <li>
          Bejelentkezési munkamenet – kizárólag az adminisztrációs felület
          használóinál, a bejelentkezés fenntartásához.
        </li>
      </ul>

      <h2>Analitikai sütik (csak hozzájárulással)</h2>
      <p>
        Ha a mérés be van kapcsolva és hozzájárultál, a Google Analytics 4
        sütijei (_ga, _ga_*) névtelen látogatottsági statisztikát és a
        konverziók (pl. űrlapbeküldés) mérését szolgálják. Hozzájárulás nélkül
        ezek nem töltődnek be.
      </p>

      <h2>Marketing sütik (csak hozzájárulással)</h2>
      <p>
        Jelenleg nem töltünk be marketing célú sütit. Ha ez változik, azt ebben
        a tájékoztatóban feltüntetjük, és csak hozzájárulással aktiváljuk.
      </p>

      <p>
        A személyes adatok kezeléséről az{" "}
        <Link to="/adatkezeles" className="font-semibold text-brand underline">
          adatkezelési tájékoztatóban
        </Link>{" "}
        olvashatsz.
      </p>
    </>
  );
}

function Terms({ business }: { business: Business }) {
  return (
    <>
      <p>
        A(z) {business.siteName} egyedi projektek alapján dolgozik. Az adott
        megbízás feltételeit – a tartalmat, az ütemezést, a díjat és a fizetés
        módját, az átadás menetét és a hozzáférések átadását – a megrendelés
        előtt küldött írásos árajánlat és a felek közötti szerződés rögzíti.
      </p>
      <p>
        A weboldalon feltüntetett árak induló árak, tájékoztató jellegűek, és
        nem minősülnek ajánlattételnek. A végleges ár mindig az írásos
        árajánlatban szerepel.
      </p>
      <h2>Szolgáltató</h2>
      <ContactLines business={business} />
    </>
  );
}
