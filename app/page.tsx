import { AmbientUi } from "@/components/site/ambient-ui";
import { About, BehindScenes, Clients, Services } from "@/components/site/content-sections";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Portfolio } from "@/components/site/portfolio";
import { GalleryAgenda } from "@/components/site/gallery-agenda";
import { getPublicSiteData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const data = await getPublicSiteData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aadesignmedia.com.br";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AA Design & Media",
    url: siteUrl,
    description: data.settings.hero_description,
    email: data.settings.email,
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
    areaServed: "São Paulo",
    sameAs: data.settings.instagram ? [data.settings.instagram] : []
  };

  return (
    <>
      <AmbientUi />
      <Header logoUrl={data.settings.logo_url} />
      <main>
        <Hero settings={data.settings} />
        <Portfolio projects={data.projects} />
        <GalleryAgenda photographs={data.photographs} events={data.events} />
        <Services services={data.services} />
        <About settings={data.settings} equipment={data.equipment} />
        <BehindScenes items={data.behindScenes} />
        <Clients clients={data.clients} testimonials={data.testimonials} />
        <Contact settings={data.settings} />
      </main>
      <Footer settings={data.settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </>
  );
}
