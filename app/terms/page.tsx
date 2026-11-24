import type { Metadata } from "next"
import Link from "next/link"

import { LegalContact, LegalPage } from "@/components/legal-page"
import { siteConfig } from "@/lib/site"

const { name, operator, country, url } = siteConfig

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${name}: the website, the component registry and the license the components ship under.`,
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`The terms for using ${name}: the website, the component registry and the license the components ship under.`}
    >
      <section>
        <h2>Agreement</h2>
        <p>
          These terms cover your use of{" "}
          <a href={url}>{url.replace(/^https?:\/\//, "")}</a> and the
          components published in the {name} registry. The project is run by{" "}
          {operator}, an independent developer based in {country}. By using the
          site or installing a component, you agree to these terms.
        </p>
      </section>

      <section>
        <h2>The components and their license</h2>
        <p>
          Every component is free and can be installed with the shadcn CLI.
          The components are open source under the{" "}
          <Link href="/license">MIT License</Link>. The{" "}
          <Link href="/license">full license text</Link> is what legally
          applies. If anything on this site disagrees with it, the license
          wins.
        </p>
        <p>In short:</p>
        <ul>
          <li>
            <strong className="text-foreground">You can</strong> use, copy,
            change and share the components in any project, personal or
            commercial, including closed-source and paid apps.
          </li>
          <li>
            <strong className="text-foreground">You must</strong> keep the
            copyright and license notice if you share the source code itself.
          </li>
          <li>
            <strong className="text-foreground">We&apos;d appreciate</strong>{" "}
            a credit link to{" "}
            <a href={url}>{url.replace(/^https?:\/\//, "")}</a>, but it&apos;s
            not required.
          </li>
        </ul>
      </section>

      <section>
        <h2>The name and brand</h2>
        <p>
          The license covers the component code only. The {name} name, logo
          and website design remain ours. Please don&apos;t use them for your
          own project or in a way that suggests we endorse it.
        </p>
      </section>

      <section>
        <h2>Contributions</h2>
        <p>
          If you contribute to the public repository, you confirm you have the
          right to do so, and you license your contribution under the MIT
          License, like the rest of the project. You keep the copyright to
          what you wrote. We may edit, refactor or remove contributions after
          they&apos;re merged.
        </p>
      </section>

      <section>
        <h2>If we add paid offerings later</h2>
        <p>
          {name} is completely free today, with no sponsorships or paid
          products. We may add some in the future, such as sponsorships,
          premium components or templates. If we do:
        </p>
        <ul>
          <li>
            Components that are already published stay free under the license
            they were released with. A later paid product never changes the
            license of a component you already installed.
          </li>
          <li>
            Prices, billing, cancellation and refund terms will be shown before
            you pay, and will apply in addition to these terms.
          </li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t try to disrupt, overload or break into the site, scrape it
          in a way that slows it down for others, or use it to spread malware.
          We may block access that does.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The site and every component are provided &ldquo;as is&rdquo;,
          without warranty of any kind, express or implied, including
          merchantability, fitness for a particular purpose and
          non-infringement. The components are interface code, not
          safety-critical software. Review and test anything you install before
          you ship it.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent the law allows, we aren&apos;t liable for any indirect
          or consequential loss, such as lost profits or lost data, arising
          from the site or the components. Because the project is free, our
          total liability for any claim is zero, unless the law where you live
          says otherwise.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as the project grows. The date at the top
          shows the current version. Continuing to use the site after an
          update means you accept the new terms.
        </p>
      </section>

      <section>
        <h2>Resolving a problem</h2>
        <p>
          Most problems can be solved with a quick email. Please write to us
          with the details first, and we&apos;ll work with you in good faith.
          Both sides agree to try resolving a dispute this way for at least 30
          days before starting formal proceedings, unless the law gives you the
          right to go to court sooner.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of {country}, and the courts of{" "}
          {country} have jurisdiction over any dispute. If you&apos;re a
          consumer, this doesn&apos;t take away protections you have under the
          laws of your own country.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <LegalContact />
      </section>
    </LegalPage>
  )
}
