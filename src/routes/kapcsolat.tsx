import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/kapcsolat")({
  head: () => ({
    meta: [
      { title: "Kapcsolat — PandaDesign" },
      { name: "description", content: "Kérj díjmentes konzultációt weboldal, webshop vagy egyedi fejlesztés kapcsán. Magyar nyelvű, közvetlen kommunikáció." },
      { property: "og:title", content: "Kapcsolat — PandaDesign" },
      { property: "og:description", content: "Írj nekünk egy rövid üzenetet és 1 munkanapon belül válaszolunk." },
      { property: "og:url", content: "/kapcsolat" },
    ],
    links: [{ rel: "canonical", href: "/kapcsolat" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Add meg a neved (min. 2 karakter)").max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Érvénytelen email cím").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().min(1, "Válassz szolgáltatást"),
  budget: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Írj néhány mondatot a projektről (min. 10 karakter)").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Kérjük fogadd el az adatkezelést" }) }),
});

type FormData = {
  name: string; company: string; email: string; phone: string;
  service: string; budget: string; deadline: string; message: string; consent: boolean;
};

const INITIAL: FormData = { name: "", company: "", email: "", phone: "", service: "", budget: "", deadline: "", message: "", consent: false };

function Contact() {
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      setState("error");
      return;
    }
    setErrors({});
    setState("success");
    setData(INITIAL);
  };

  return (
    <Section eyebrow="Kapcsolat" title="Beszéljük át a projektedet" description="Töltsd ki az űrlapot és 1 munkanapon belül visszajelzünk egy konkrét következő lépéssel.">
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-ink mb-4">Elérhetőségek</p>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 text-brand" /><span>hello@pandadesign.hu</span></li>
              <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5 text-brand" /><span>+36 30 000 0000 (helyőrző)</span></li>
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-brand" /><span>Budapest, Magyarország</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-brand text-brand-foreground p-6 shadow-elegant">
            <p className="text-sm font-semibold">Nem tudod pontosan mit szeretnél?</p>
            <p className="mt-2 text-sm text-brand-foreground/80">Semmi gond – ingyenes konzultáció keretében segítünk letisztázni az igényeket.</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          {state === "success" ? (
            <div className="rounded-2xl border bg-white p-10 shadow-elegant text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h3 className="mt-4 text-2xl font-bold text-ink">Köszönjük az üzenetedet!</h3>
              <p className="mt-2 text-ink-soft">1 munkanapon belül válaszolunk a megadott email címre.</p>
              <Button className="mt-6" variant="outline" onClick={() => setState("idle")}>Új üzenet küldése</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="rounded-2xl border bg-white p-6 md:p-8 shadow-soft space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Név *" error={errors.name}>
                  <Input value={data.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
                </Field>
                <Field label="Cégnév" error={errors.company}>
                  <Input value={data.company} onChange={(e) => set("company", e.target.value)} />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
                </Field>
                <Field label="Telefonszám" error={errors.phone}>
                  <Input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="Kért szolgáltatás *" error={errors.service}>
                  <Select value={data.service} onValueChange={(v) => set("service", v)}>
                    <SelectTrigger aria-invalid={!!errors.service}><SelectValue placeholder="Válassz…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landing">Landing oldal</SelectItem>
                      <SelectItem value="ceges">Céges weboldal</SelectItem>
                      <SelectItem value="webshop">Webshop</SelectItem>
                      <SelectItem value="ujratervezes">Weboldal újratervezés</SelectItem>
                      <SelectItem value="karbantartas">WordPress karbantartás</SelectItem>
                      <SelectItem value="seo">SEO / optimalizálás</SelectItem>
                      <SelectItem value="egyedi">Egyedi Next.js fejlesztés</SelectItem>
                      <SelectItem value="egyeb">Egyéb</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Becsült keret" error={errors.budget}>
                  <Select value={data.budget} onValueChange={(v) => set("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Válassz…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">100 000 Ft alatt</SelectItem>
                      <SelectItem value="100-250">100 000 – 250 000 Ft</SelectItem>
                      <SelectItem value="250-500">250 000 – 500 000 Ft</SelectItem>
                      <SelectItem value="500-1000">500 000 – 1 000 000 Ft</SelectItem>
                      <SelectItem value="1000+">1 000 000 Ft felett</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Kívánt határidő" error={errors.deadline} className="md:col-span-2">
                  <Input placeholder="pl. 2026. május" value={data.deadline} onChange={(e) => set("deadline", e.target.value)} />
                </Field>
                <Field label="Projekt leírása *" error={errors.message} className="md:col-span-2">
                  <Textarea rows={6} value={data.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} placeholder="Írj néhány mondatot a vállalkozásodról és arról, mire lenne szükséged." />
                </Field>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={data.consent} onCheckedChange={(v) => set("consent", v === true)} aria-invalid={!!errors.consent} />
                <label htmlFor="consent" className="text-sm text-ink-soft">
                  Elolvastam és elfogadom az <a href="/adatkezeles" className="text-brand underline">adatkezelési tájékoztatót</a>. *
                </label>
              </div>
              {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
              <Button type="submit" size="lg" variant="cta">
                Üzenet küldése
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm font-medium text-ink">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}