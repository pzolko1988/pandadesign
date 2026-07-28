import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Building2,
  ExternalLink,
  Globe,
  Image,
  Mail,
  MapPin,
  Search,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteAssetUrl,
  type SiteSettings,
} from "../lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

type AssetField = "logo_path" | "favicon_path" | "og_image_path";

const ASSET_LABELS: Record<AssetField, string> = {
  logo_path: "Logó",
  favicon_path: "Favicon",
  og_image_path: "Közösségi megosztási kép",
};

function AdminSettingsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<AssetField | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const initializePage = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        await navigate({
          to: "/admin/login",
          replace: true,
        });

        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError) {
        throw adminError;
      }

      if (!isAdmin) {
        setErrorMessage(
          "Ehhez az oldalhoz nincs adminisztrátori jogosultságod.",
        );
        return;
      }

      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "id, site_name, legal_name, tagline, email, phone, contact_recipient_email, address_line, postal_code, city, country, opening_hours, facebook_url, instagram_url, linkedin_url, base_url, default_meta_title, default_meta_description, logo_path, favicon_path, og_image_path, footer_text, copyright_text, show_contact_details",
        )
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setForm({
        ...DEFAULT_SITE_SETTINGS,
        ...(data as Partial<SiteSettings> | null),
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A weboldal-beállítások betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void initializePage();
  }, [initializePage]);

  function updateField<K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function normalizeUrl(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (
      trimmed.startsWith("/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  function getExtension(file: File) {
    const fromName = file.name.split(".").pop()?.toLowerCase();

    if (fromName && /^[a-z0-9]+$/.test(fromName)) {
      return fromName;
    }

    if (file.type === "image/svg+xml") {
      return "svg";
    }

    if (
      file.type === "image/x-icon" ||
      file.type === "image/vnd.microsoft.icon"
    ) {
      return "ico";
    }

    return "png";
  }

  async function uploadAsset(
    field: AssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Csak képfájl tölthető fel.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("A kép mérete legfeljebb 5 MB lehet.");
      return;
    }

    setUploadingField(field);
    setErrorMessage("");
    setSuccessMessage("");

    const previousPath = form[field];
    const extension = getExtension(file);
    const folder = field.replace("_path", "");
    const newPath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(newPath, file, {
          cacheControl: "3600",
          contentType: file.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: settingsError } = await supabase
        .from("site_settings")
        .update({
          [field]: newPath,
        })
        .eq("id", 1);

      if (settingsError) {
        await supabase.storage.from("site-assets").remove([newPath]);

        throw settingsError;
      }

      setForm((current) => ({
        ...current,
        [field]: newPath,
      }));

      if (previousPath) {
        const { error: deleteError } = await supabase.storage
          .from("site-assets")
          .remove([previousPath]);

        if (deleteError) {
          console.warn("A korábbi fájl nem törölhető:", deleteError);
        }
      }

      setSuccessMessage(
        `${ASSET_LABELS[field]} sikeresen feltöltve és elmentve.`,
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A kép feltöltése nem sikerült.",
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function removeAsset(field: AssetField) {
    const currentPath = form[field];

    if (!currentPath) {
      return;
    }

    const confirmed = window.confirm(
      `Biztosan törlöd ezt az elemet?\n\n${ASSET_LABELS[field]}`,
    );

    if (!confirmed) {
      return;
    }

    setUploadingField(field);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error: settingsError } = await supabase
        .from("site_settings")
        .update({
          [field]: null,
        })
        .eq("id", 1);

      if (settingsError) {
        throw settingsError;
      }

      const { error: storageError } = await supabase.storage
        .from("site-assets")
        .remove([currentPath]);

      if (storageError) {
        console.warn(
          "A fájl adatbázis-hivatkozása törölve, de a tárhelyfájl nem távolítható el:",
          storageError,
        );
      }

      setForm((current) => ({
        ...current,
        [field]: null,
      }));

      setSuccessMessage(`${ASSET_LABELS[field]} sikeresen törölve.`);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "A fájl törlése nem sikerült.",
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const siteName = form.site_name.trim();
    const metaTitle = form.default_meta_title.trim();
    const metaDescription = form.default_meta_description.trim();

    if (siteName.length < 2) {
      setErrorMessage(
        "A weboldal nevének legalább 2 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (metaTitle.length < 10) {
      setErrorMessage(
        "Az alap SEO-címnek legalább 10 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (metaDescription.length < 30) {
      setErrorMessage(
        "Az alap meta leírásnak legalább 30 karakter hosszúnak kell lennie.",
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload: SiteSettings = {
      ...form,
      id: 1,
      site_name: siteName,
      legal_name: form.legal_name.trim(),
      tagline: form.tagline.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      contact_recipient_email: form.contact_recipient_email.trim(),
      address_line: form.address_line.trim(),
      postal_code: form.postal_code.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      opening_hours: form.opening_hours.trim(),
      facebook_url: normalizeUrl(form.facebook_url),
      instagram_url: normalizeUrl(form.instagram_url),
      linkedin_url: normalizeUrl(form.linkedin_url),
      base_url: normalizeUrl(form.base_url),
      default_meta_title: metaTitle,
      default_meta_description: metaDescription,
      footer_text: form.footer_text.trim(),
      copyright_text: form.copyright_text.trim(),
    };

    try {
      const { error } = await supabase.from("site_settings").upsert(payload, {
        onConflict: "id",
      });

      if (error) {
        throw error;
      }

      setForm(payload);
      setSuccessMessage(
        "Az általános weboldal-beállítások sikeresen elmentve.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A beállítások mentése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  const logoUrl = useMemo(
    () => getSiteAssetUrl(form.logo_path),
    [form.logo_path],
  );

  const faviconUrl = useMemo(
    () => getSiteAssetUrl(form.favicon_path),
    [form.favicon_path],
  );

  const ogImageUrl = useMemo(
    () => getSiteAssetUrl(form.og_image_path),
    [form.og_image_path],
  );

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Weboldal-beállítások betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            to="/admin/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az áttekintéshez
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Általános weboldal-beállítások
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            A PandaDesign alapvető arculati, kapcsolattartási, közösségi és
            keresőoptimalizálási adatainak kezelése.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <SettingsSection
            icon={Building2}
            title="Márka és vállalkozás"
            description="A weboldal és a vállalkozás alapvető megnevezései."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id="site-name"
                label="Weboldal neve"
                required
                value={form.site_name}
                onChange={(value) => updateField("site_name", value)}
              />

              <TextField
                id="legal-name"
                label="Hivatalos cégnév"
                value={form.legal_name}
                onChange={(value) => updateField("legal_name", value)}
                placeholder="Például: PandaDesign Kft."
              />

              <div className="md:col-span-2">
                <TextField
                  id="tagline"
                  label="Rövid szlogen"
                  value={form.tagline}
                  onChange={(value) => updateField("tagline", value)}
                  placeholder="Modern weboldalak magyar vállalkozásoknak"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Image}
            title="Logó és weboldalképek"
            description="A fájlok a Supabase site-assets tárhelyére kerülnek."
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <AssetUploader
                label="Logó"
                description="PNG, WebP vagy SVG. Átlátszó háttér ajánlott."
                imageUrl={logoUrl}
                busy={uploadingField === "logo_path"}
                onUpload={(event) => void uploadAsset("logo_path", event)}
                onRemove={() => void removeAsset("logo_path")}
              />

              <AssetUploader
                label="Favicon"
                description="Négyzetes PNG, ICO vagy SVG. Ajánlott legalább 64×64 px."
                imageUrl={faviconUrl}
                busy={uploadingField === "favicon_path"}
                contain
                onUpload={(event) => void uploadAsset("favicon_path", event)}
                onRemove={() => void removeAsset("favicon_path")}
              />

              <AssetUploader
                label="Közösségi megosztási kép"
                description="Facebookhoz és más megosztásokhoz. Ajánlott: 1200×630 px."
                imageUrl={ogImageUrl}
                busy={uploadingField === "og_image_path"}
                onUpload={(event) => void uploadAsset("og_image_path", event)}
                onRemove={() => void removeAsset("og_image_path")}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Mail}
            title="Kapcsolattartási adatok"
            description="Ezeket később a kapcsolatoldal, a lábléc és a leadértesítések is használják."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id="email"
                label="Nyilvános e-mail-cím"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />

              <TextField
                id="phone"
                label="Telefonszám"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="+36 30 123 4567"
              />

              <TextField
                id="contact-recipient"
                label="Leadértesítések címzettje"
                type="email"
                value={form.contact_recipient_email}
                onChange={(value) =>
                  updateField("contact_recipient_email", value)
                }
                description="Ide érkezhetnek majd a kapcsolatfelvételi értesítések."
              />

              <TextField
                id="opening-hours"
                label="Elérhetőségi idő"
                value={form.opening_hours}
                onChange={(value) => updateField("opening_hours", value)}
                placeholder="H–P: 09:00–17:00"
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.show_contact_details}
                onChange={(event) =>
                  updateField("show_contact_details", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Kapcsolattartási adatok megjelenítése
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Kikapcsolva a nyilvános e-mail, telefonszám és cím elrejthető
                  a publikus felületeken.
                </span>
              </span>
            </label>
          </SettingsSection>

          <SettingsSection
            icon={MapPin}
            title="Címadatok"
            description="A vállalkozás nyilvános vagy hivatalos címe."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField
                  id="address-line"
                  label="Utca, házszám"
                  value={form.address_line}
                  onChange={(value) => updateField("address_line", value)}
                />
              </div>

              <TextField
                id="postal-code"
                label="Irányítószám"
                value={form.postal_code}
                onChange={(value) => updateField("postal_code", value)}
              />

              <TextField
                id="city"
                label="Település"
                value={form.city}
                onChange={(value) => updateField("city", value)}
              />

              <TextField
                id="country"
                label="Ország"
                value={form.country}
                onChange={(value) => updateField("country", value)}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Globe}
            title="Közösségi oldalak"
            description="Üresen hagyva az adott közösségi hivatkozás nem jelenik meg."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <TextField
                id="facebook-url"
                label="Facebook"
                value={form.facebook_url}
                onChange={(value) => updateField("facebook_url", value)}
                placeholder="https://facebook.com/..."
              />

              <TextField
                id="instagram-url"
                label="Instagram"
                value={form.instagram_url}
                onChange={(value) => updateField("instagram_url", value)}
                placeholder="https://instagram.com/..."
              />

              <TextField
                id="linkedin-url"
                label="LinkedIn"
                value={form.linkedin_url}
                onChange={(value) => updateField("linkedin_url", value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Search}
            title="Alap keresőoptimalizálás"
            description="Ezek az értékek a főoldal alapértelmezett böngésző- és megosztási adatai."
          >
            <div className="space-y-5">
              <TextField
                id="base-url"
                label="Éles weboldalcím"
                required
                value={form.base_url}
                onChange={(value) => updateField("base_url", value)}
                placeholder="https://pandadesign.hu"
              />

              <TextField
                id="meta-title"
                label="Alap SEO-cím"
                required
                value={form.default_meta_title}
                onChange={(value) => updateField("default_meta_title", value)}
                description={`${form.default_meta_title.length} karakter – általában 50–60 karakter körül ideális.`}
              />

              <div>
                <label
                  htmlFor="meta-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Alap meta leírás
                </label>

                <textarea
                  id="meta-description"
                  required
                  minLength={30}
                  rows={5}
                  value={form.default_meta_description}
                  onChange={(event) =>
                    updateField("default_meta_description", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  {form.default_meta_description.length} karakter – általában
                  140–160 karakter körül ideális.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Google-előnézet</p>

              <p className="mt-3 text-lg text-blue-700">
                {form.default_meta_title || "Az oldal SEO-címe"}
              </p>

              <p className="mt-1 text-sm text-green-700">
                {form.base_url || "https://pandadesign.hu"}
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {form.default_meta_description ||
                  "Az oldal meta leírása itt jelenik meg."}
              </p>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={ExternalLink}
            title="Lábléc"
            description="A lábléc szövegeit a későbbi globális fejléc- és láblécbekötés használja."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="footer-text"
                  className="mb-2 block text-sm font-semibold"
                >
                  Rövid bemutatkozás
                </label>

                <textarea
                  id="footer-text"
                  rows={4}
                  value={form.footer_text}
                  onChange={(event) =>
                    updateField("footer_text", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label
                  htmlFor="copyright-text"
                  className="mb-2 block text-sm font-semibold"
                >
                  Szerzői jogi szöveg
                </label>

                <textarea
                  id="copyright-text"
                  rows={4}
                  value={form.copyright_text}
                  onChange={(event) =>
                    updateField("copyright_text", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </SettingsSection>

          <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
            <button
              type="submit"
              disabled={saving || uploadingField !== null}
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Mentés..." : "Összes beállítás mentése"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

type SettingsSectionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-2xl border bg-background p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </span>

        <div>
          <h2 className="text-xl font-bold">{title}</h2>

          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  description,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
      />

      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

type AssetUploaderProps = {
  label: string;
  description: string;
  imageUrl: string;
  busy: boolean;
  contain?: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function AssetUploader({
  label,
  description,
  imageUrl,
  busy,
  contain = false,
  onUpload,
  onRemove,
}: AssetUploaderProps) {
  return (
    <article className="rounded-2xl border p-4">
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className={`h-full w-full ${
              contain ? "object-contain p-5" : "object-cover"
            }`}
          />
        ) : (
          <Image className="h-9 w-9 text-muted-foreground/40" />
        )}
      </div>

      <h3 className="mt-4 font-bold">{label}</h3>

      <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted">
          <Upload className="h-4 w-4" />

          {busy ? "Feltöltés..." : imageUrl ? "Csere" : "Feltöltés"}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
            disabled={busy}
            onChange={onUpload}
            className="sr-only"
          />
        </label>

        {imageUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Törlés
          </button>
        )}
      </div>
    </article>
  );
}
