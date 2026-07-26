import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white mt-24">
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-ink-soft max-w-xs">
            Modern, gyors és konverzióra optimalizált weboldalak magyar kis- és középvállalkozások számára.
          </p>
          <div className="flex items-center gap-3 text-ink-soft">
            <a href="#" aria-label="Facebook (helyőrző)" className="hover:text-brand"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram (helyőrző)" className="hover:text-brand"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn (helyőrző)" className="hover:text-brand"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-4">Navigáció</h4>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link to="/" className="hover:text-brand">Főoldal</Link></li>
            <li><Link to="/szolgaltatasok" className="hover:text-brand">Szolgáltatások</Link></li>
            <li><Link to="/referenciak" className="hover:text-brand">Referenciák</Link></li>
            <li><Link to="/arak" className="hover:text-brand">Árak</Link></li>
            <li><Link to="/rolunk" className="hover:text-brand">Rólunk</Link></li>
            <li><Link to="/blog" className="hover:text-brand">Blog</Link></li>
            <li><Link to="/kapcsolat" className="hover:text-brand">Kapcsolat</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-4">Szolgáltatások</h4>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>WordPress weboldalak</li>
            <li>Céges weboldalak</li>
            <li>Landing oldalak</li>
            <li>Webshopok</li>
            <li>Weboldal újratervezés</li>
            <li>WordPress karbantartás</li>
            <li>SEO optimalizálás</li>
            <li>Egyedi Next.js fejlesztés</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-4">Kapcsolat</h4>
          <ul className="space-y-3 text-sm text-ink-soft">
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-brand" /><span>hello@pandadesign.hu</span></li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-brand" /><span>+36 30 000 0000 (helyőrző)</span></li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-brand" /><span>Budapest, Magyarország</span></li>
          </ul>
          <div className="mt-5 space-y-2 text-sm">
            <Link to="/adatkezeles" className="block text-ink-soft hover:text-brand">Adatkezelési tájékoztató</Link>
            <Link to="/sutik" className="block text-ink-soft hover:text-brand">Süti tájékoztató</Link>
            <Link to="/aszf" className="block text-ink-soft hover:text-brand">Általános szerződési feltételek</Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} PandaDesign. Minden jog fenntartva.</p>
          <p className="max-w-2xl md:text-right">
            A weboldalon szereplő árak tájékoztató jellegűek. A végleges ajánlat az egyedi igények felmérése után készül el.
          </p>
        </div>
      </div>
    </footer>
  );
}