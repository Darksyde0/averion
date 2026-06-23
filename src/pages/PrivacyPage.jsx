import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function PrivacyPage() {
    const lastUpdated = 'June 23, 2026'

    const sections = [
        {
            title: '1. Who We Are',
            content: `Averion is a cybersecurity awareness training platform operated by Averion. We are based in Aveiro, Portugal and subject to the General Data Protection Regulation (GDPR) (EU) 2016/679.\n\nIf you have any questions about this Privacy Policy or how we handle your data, contact us at averiontech47@gmail.com.`,
        },
        {
            title: '2. What Data We Collect',
            content: `We collect the following personal data when you use Averion.\n\nWhen you register as an administrator: full name, email address, company name, department, job title, employee ID (optional), and password (stored as a secure hash — we never store plaintext passwords).\n\nWhen you use the platform: simulation results and scores, training module progress and quiz scores, login timestamps and session activity, and IP address and browser information collected by Supabase Auth for security purposes.\n\nWe do not collect payment information. We do not collect any sensitive personal data such as health information, racial or ethnic origin, or biometric data.`,
        },
        {
            title: '3. How We Use Your Data',
            content: `We use your personal data to provide and operate the Averion platform, to authenticate your identity and manage your account, to track your training progress and simulation results, to generate analytics and reports for your organisation's administrator, to send account-related emails such as email verification and password reset, to improve the platform based on usage patterns, and to comply with our legal obligations.\n\nWe do not use your data for advertising. We do not sell your data to third parties under any circumstances.`,
        },
        {
            title: '4. Legal Basis for Processing',
            content: `Under GDPR, we process your personal data on the following legal bases.\n\nContract performance — processing is necessary to provide the service you signed up for. Legitimate interests — we process certain data to maintain security, prevent fraud, and improve the platform. Legal obligation — we may process data to comply with applicable laws and regulations. Consent — where we ask for your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.`,
        },
        {
            title: '5. Data Sharing and Third Parties',
            content: `We share your data only with the following third-party service providers who process data on our behalf.\n\nSupabase (supabase.com) — database, authentication, and file storage. Supabase is GDPR compliant and data is stored on infrastructure within the European Union.\n\nVercel (vercel.com) — frontend hosting and content delivery.\n\nOpenAI (openai.com) — AI-generated simulation content via our ARIA feature. When administrators use ARIA, conversation content is sent to OpenAI to generate training questions. We do not send any user personal data to OpenAI.\n\nCloudflare (cloudflare.com) — bot protection on authentication forms via Cloudflare Turnstile.\n\nCookiebot (cookiebot.com) — cookie consent management on public-facing pages.\n\nWe do not share your data with any other third parties. We do not transfer your personal data outside the European Economic Area except where the third parties listed above operate under appropriate safeguards such as Standard Contractual Clauses.`,
        },
        {
            title: '6. Data Retention',
            content: `We retain your personal data for as long as your account is active or as needed to provide the service.\n\nIf you request deletion of your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.\n\nSimulation results and training records are retained for the duration of the account as they form the core value of the platform. Administrators may delete individual user records at any time through the platform.`,
        },
        {
            title: '7. Your Rights Under GDPR',
            content: `As a data subject under GDPR, you have the following rights.\n\nRight of access — you may request a copy of the personal data we hold about you. Right to rectification — you may request correction of inaccurate personal data. Right to erasure — you may request deletion of your personal data. Right to restriction of processing — you may request that we limit how we use your data. Right to data portability — you may receive your personal data in a structured, machine-readable format. Right to object — you may object to processing based on legitimate interests.\n\nTo exercise any of these rights, contact us at averiontech47@gmail.com. We will respond within 30 days. You also have the right to lodge a complaint with the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados (CNPD), at www.cnpd.pt.`,
        },
        {
            title: '8. Cookies',
            content: `We use cookies on our public-facing pages to manage cookie consent via Cookiebot and to maintain your session when logged in to the platform. Our authenticated dashboard does not use tracking cookies. We do not use advertising cookies or share cookie data with advertising networks.\n\nYou can manage your cookie preferences at any time using the cookie consent banner on our public pages.`,
        },
        {
            title: '9. Security',
            content: `We implement the following security measures to protect your personal data.\n\nAll data is transmitted over HTTPS using TLS encryption. Passwords are hashed and never stored in plaintext. Row Level Security is enforced at the database layer, ensuring each organisation can only access its own data. Authentication is handled by Supabase Auth with JWT tokens. AI generation requests are authenticated and rate limited. Bot protection is enforced on all authentication forms via Cloudflare Turnstile. Environment variables and API keys are never stored in version control.\n\nDespite these measures, no system is completely secure. If you become aware of any security issue, please contact us immediately at averiontech47@gmail.com.`,
        },
        {
            title: "10. Children's Privacy",
            content: `Averion is designed for use by organisations and their employees. It is not intended for use by individuals under the age of 16. We do not knowingly collect personal data from anyone under 16. If you believe we have inadvertently collected data from a minor, please contact us and we will delete it promptly.`,
        },
        {
            title: '11. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify registered users of significant changes by email. The date at the top of this page indicates when the policy was last updated.\n\nYour continued use of Averion after any changes constitutes your acceptance of the updated policy.`,
        },
        {
            title: '12. Contact Us',
            content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at averiontech47@gmail.com. We are based in Aveiro, Portugal and aim to respond to all enquiries within 5 business days.`,
        },
    ]

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#020408' }}>
            <Navbar />

            {/* Hero */}
            <section className="relative pt-36 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,78,216,0.12), transparent)' }} />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <p className="text-xs font-semibold tracking-widest uppercase mb-6"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Legal · Privacy
                    </p>
                    <h1 className="text-white font-bold mb-5"
                        style={{ fontFamily: "'Poppins', sans-serif", fontSize: '48px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        Privacy Policy
                    </h1>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        This policy explains what personal data Averion collects, how we use it, and your rights under the General Data Protection Regulation (GDPR) (EU) 2016/679.
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-2xl mx-auto w-full px-6">
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Content */}
            <main className="flex-1 px-6 py-20">
                <div className="max-w-2xl mx-auto">

                    {/* GDPR notice */}
                    <div className="mb-16 pl-4"
                        style={{ borderLeft: '2px solid rgba(59,130,246,0.4)' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                            style={{ color: '#3b82f6' }}>
                            GDPR Compliant
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Averion is operated from Portugal and fully subject to the General Data Protection Regulation. We are committed to protecting your personal data and respecting your privacy rights as defined under EU law.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="flex flex-col" style={{ gap: '56px' }}>
                        {sections.map((section, i) => (
                            <div key={i}>
                                <div className="flex items-baseline gap-4 mb-5">
                                    <span className="text-xs font-mono flex-shrink-0"
                                        style={{ color: 'rgba(255,255,255,0.15)' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="text-white font-semibold"
                                        style={{ fontSize: '16px', letterSpacing: '-0.01em' }}>
                                        {section.title.replace(/^\d+\.\s/, '')}
                                    </h2>
                                </div>
                                <div className="pl-9">
                                    {section.content.split('\n\n').map((para, j) => (
                                        <p key={j} className="text-sm leading-relaxed"
                                            style={{ color: 'rgba(255,255,255,0.45)', marginBottom: j < section.content.split('\n\n').length - 1 ? '16px' : '0' }}>
                                            {para}
                                        </p>
                                    ))}
                                </div>
                                {i < sections.length - 1 && (
                                    <div className="mt-14 pl-9"
                                        style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contact footer */}
                    <div className="mt-20 pt-12"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs uppercase tracking-widest font-semibold mb-3"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Get in touch
                        </p>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            For questions, data requests, or concerns about this policy:
                        </p>
                        <a href="mailto:averiontech47@gmail.com"
                            className="text-sm font-medium transition-colors duration-200"
                            style={{ color: '#3b82f6' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                            onMouseLeave={e => e.currentTarget.style.color = '#3b82f6'}>
                            averiontech47@gmail.com
                        </a>
                        <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
                            Averion · Aveiro, Portugal · averiontech.vercel.app
                        </p>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}

export default PrivacyPage