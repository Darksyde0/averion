import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function PrivacyPage() {
  const lastUpdated = 'June 23, 2026'

  const sections = [
    {
      title: '1. Who We Are',
      content: `Averion is a cybersecurity awareness training platform operated by Averion ("we", "us", "our"). We are based in Aveiro, Portugal and subject to the General Data Protection Regulation (GDPR) (EU) 2016/679.

If you have any questions about this Privacy Policy or how we handle your data, contact us at averiontech47@gmail.com.`,
    },
    {
      title: '2. What Data We Collect',
      content: `We collect the following personal data when you use Averion:

When you register as an administrator:
- Full name
- Email address
- Company name
- Department
- Job title
- Employee ID (optional)
- Password (stored as a secure hash — we never store plaintext passwords)

When you use the platform:
- Simulation results and scores
- Training module progress and quiz scores
- Login timestamps and session activity
- IP address and browser information (collected by Supabase Auth for security purposes)

We do not collect payment information. We do not collect any sensitive personal data such as health information, racial or ethnic origin, or biometric data.`,
    },
    {
      title: '3. How We Use Your Data',
      content: `We use your personal data for the following purposes:

- To provide and operate the Averion platform
- To authenticate your identity and manage your account
- To track your training progress and simulation results
- To generate analytics and reports for your organisation's administrator
- To send account-related emails such as email verification and password reset
- To improve the platform based on usage patterns
- To comply with our legal obligations

We do not use your data for advertising. We do not sell your data to third parties under any circumstances.`,
    },
    {
      title: '4. Legal Basis for Processing',
      content: `Under GDPR, we process your personal data on the following legal bases:

- Contract performance — processing is necessary to provide the service you signed up for
- Legitimate interests — we process certain data to maintain security, prevent fraud, and improve the platform
- Legal obligation — we may process data to comply with applicable laws and regulations
- Consent — where we ask for your consent, you may withdraw it at any time without affecting the lawfulness of prior processing`,
    },
    {
      title: '5. Data Sharing and Third Parties',
      content: `We share your data only with the following third-party service providers who process data on our behalf:

- Supabase (supabase.com) — database, authentication, and file storage. Supabase is GDPR compliant and processes data in accordance with its Data Processing Agreement. Data is stored on infrastructure within the European Union.

- Vercel (vercel.com) — frontend hosting and content delivery. Vercel processes minimal data required to serve the application.

- OpenAI (openai.com) — AI-generated simulation content via our ARIA feature. When administrators use ARIA, conversation content is sent to OpenAI to generate training questions. We do not send any user personal data to OpenAI — only the administrator's conversation with ARIA.

- Cloudflare (cloudflare.com) — bot protection on our authentication forms via Cloudflare Turnstile. Cloudflare processes minimal browser information to distinguish humans from bots.

- Cookiebot (cookiebot.com) — cookie consent management on our public-facing pages.

We do not share your data with any other third parties. We do not transfer your personal data outside the European Economic Area (EEA) except where the third parties listed above operate under appropriate safeguards such as Standard Contractual Clauses.`,
    },
    {
      title: '6. Data Retention',
      content: `We retain your personal data for as long as your account is active or as needed to provide the service.

If you request deletion of your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.

Simulation results and training records are retained for the duration of the account as they form the core value of the platform. Administrators may delete individual user records at any time through the platform.`,
    },
    {
      title: '7. Your Rights Under GDPR',
      content: `As a data subject under GDPR, you have the following rights:

- Right of access — you have the right to request a copy of the personal data we hold about you
- Right to rectification — you have the right to request correction of inaccurate personal data
- Right to erasure — you have the right to request deletion of your personal data ("right to be forgotten")
- Right to restriction of processing — you have the right to request that we limit how we use your data
- Right to data portability — you have the right to receive your personal data in a structured, machine-readable format
- Right to object — you have the right to object to processing based on legitimate interests
- Rights related to automated decision-making — we do not make any automated decisions that produce legal or similarly significant effects about you

To exercise any of these rights, contact us at averiontech47@gmail.com. We will respond within 30 days. You also have the right to lodge a complaint with the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados (CNPD), at www.cnpd.pt.`,
    },
    {
      title: '8. Cookies',
      content: `We use cookies on our public-facing pages to manage cookie consent (via Cookiebot) and to maintain your session when logged in to the platform.

Our authenticated dashboard does not use tracking cookies. We do not use advertising cookies or share cookie data with advertising networks.

You can manage your cookie preferences at any time using the cookie consent banner on our public pages.`,
    },
    {
      title: '9. Security',
      content: `We take the security of your personal data seriously. We implement the following measures:

- All data is transmitted over HTTPS using TLS encryption
- Passwords are hashed and never stored in plaintext
- Row Level Security (RLS) is enforced at the database layer, ensuring each organisation can only access its own data
- Authentication is handled by Supabase Auth with JWT tokens
- AI generation requests are authenticated and rate limited
- Bot protection is enforced on all authentication forms via Cloudflare Turnstile
- Environment variables and API keys are never stored in version control

Despite these measures, no system is completely secure. If you become aware of any security issue, please contact us immediately at averiontech47@gmail.com.`,
    },
    {
      title: '10. Children\'s Privacy',
      content: `Averion is designed for use by organisations and their employees. It is not intended for use by individuals under the age of 16. We do not knowingly collect personal data from anyone under 16. If you believe we have inadvertently collected data from a minor, please contact us and we will delete it promptly.`,
    },
    {
      title: '11. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify registered users of significant changes by email. The date at the top of this page indicates when the policy was last updated.

Your continued use of Averion after any changes constitutes your acceptance of the updated policy.`,
    },
    {
      title: '12. Contact Us',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

Email: averiontech47@gmail.com
Location: Aveiro, Portugal

We aim to respond to all enquiries within 5 business days.`,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Legal</span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
            This policy explains what personal data Averion collects, how we use it, and your rights under the General Data Protection Regulation (GDPR).
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 px-8 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* GDPR badge */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 mb-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">GDPR Compliant</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Averion is operated from Portugal and fully subject to the General Data Protection Regulation (EU) 2016/679. We are committed to protecting your personal data and respecting your privacy rights.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-10">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-white text-lg font-bold mb-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {section.title}
                </h2>
                <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
                {i < sections.length - 1 && (
                  <div className="mt-10 h-px bg-white/5" />
                )}
              </div>
            ))}
          </div>

          {/* Contact box */}
          <div className="mt-16 bg-[#04080f] border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-white text-sm font-semibold mb-2">Questions about your data?</p>
            <p className="text-gray-400 text-xs mb-4">We take your privacy seriously and will respond within 5 business days.</p>
            <a href="mailto:averiontech47@gmail.com"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition">
              averiontech47@gmail.com
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPage