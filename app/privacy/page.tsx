import type { Metadata } from "next"

import { LegalContact, LegalPage } from "@/components/legal-page"
import { siteConfig } from "@/lib/site"

const { name, operator, country, url } = siteConfig

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${name} handles your data: no accounts, no ads, no analytics and no tracking cookies.`,
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li>
      <strong className="text-foreground">{title}.</strong> {children}
    </li>
  )
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`How ${name} handles your data: what we collect, what we don't, who helps us run the site, and how to reach us about it.`}
    >
      <section>
        <h2>Who we are</h2>
        <p>
          {name} is a free collection of animated React components, run by{" "}
          {operator}, an independent developer based in {country}. This policy
          covers <a href={url}>{url.replace(/^https?:\/\//, "")}</a>, the
          documentation on it, and the component registry files it serves to
          the shadcn CLI.
        </p>
      </section>

      <section>
        <h2>The short version</h2>
        <p>
          You never need an account. There are no ads, no analytics and no
          tracking cookies on this site, and we don&apos;t sell or share your
          data with anyone. The only personal data we end up with is what you
          choose to send us yourself, such as an email.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <Item title="Server logs">
            Like almost every website, our hosting provider automatically logs
            technical details of each request, such as IP address, browser,
            the page requested and the time. These are used only to keep the
            site secure and working, and are deleted on the provider&apos;s
            normal schedule.
          </Item>
          <Item title="Messages you send us">
            If you email us, we receive your email address and whatever you
            write.
          </Item>
          <Item title="GitHub activity">
            Issues, pull requests and stars on our repository are handled by
            GitHub and are public by design. We don&apos;t copy them into any
            other system.
          </Item>
        </ul>
      </section>

      <section>
        <h2>What we don&apos;t collect</h2>
        <ul>
          <li>
            No analytics, advertising, cross-site tracking, fingerprinting or
            user profiles.
          </li>
          <li>
            Nothing you type into a demo or playground. They run entirely in
            your browser.
          </li>
          <li>
            Nothing about your project. Installing a component with the shadcn
            CLI downloads a static file from this site; your code and your
            machine&apos;s details are never sent to us.
          </li>
          <li>
            Your light or dark theme choice stays in your browser&apos;s local
            storage on your own device.
          </li>
        </ul>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>Two third parties help run the project:</p>
        <ul>
          <Item title="Our hosting provider">
            Serves the website and registry files, and keeps the short-lived
            server logs described above.
          </Item>
          <Item title="GitHub">
            Hosts the source code repository and its public issues and
            discussions.
          </Item>
        </ul>
        <p>
          Each has its own privacy policy, and links to other websites are
          covered by those sites&apos; policies, not this one.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          Server logs are used only for security and reliability. Emails are
          used only to reply to you. We don&apos;t use anything for marketing,
          profiling or automated decisions.
        </p>
      </section>

      <section>
        <h2>Where data is processed and how long we keep it</h2>
        <p>
          We operate from {country}. Our hosting provider and GitHub may
          process data in other countries, including the United States, under
          their own safeguards. Server logs are kept only as long as the
          hosting provider&apos;s standard retention. Emails are kept while
          they&apos;re useful for support, then deleted.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us what personal data we hold about you, and ask us to
          correct or delete it. Email us and we&apos;ll reply within 30 days,
          usually much sooner. If you&apos;re not satisfied with our answer,
          you may be able to complain to the data protection authority where
          you live.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          The site is served over HTTPS. Because we collect so little, there
          is very little to protect, but no website can promise perfect
          security.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The site is meant for developers and isn&apos;t aimed at children
          under 18. We don&apos;t knowingly collect their personal data. If you
          think a child has sent us personal data, email us and we&apos;ll
          delete it.
        </p>
      </section>

      <section>
        <h2>If things change</h2>
        <p>
          {name} has no analytics, sponsorships, payments or accounts today.
          If we add any of these, for example privacy-friendly analytics or a
          sponsorship program, we&apos;ll update this page and its date{" "}
          <em>before</em> collecting anything new, and explain what is
          collected and why. We won&apos;t apply new uses to data collected
          under an older version of this policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <LegalContact />
      </section>
    </LegalPage>
  )
}
