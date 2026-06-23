import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lastUpdated = 'June 23, 2026'

  const sections = [
    {
      title: 'Agreement to Our Legal Terms',
      content: `We are Averion ("Company", "we", "us", or "our"). We operate the website https://averiontech.vercel.app as well as any other related products and services that refer or link to these legal terms (collectively, the "Services").\n\nAverion is a cybersecurity awareness platform that helps organisations train employees to recognise common threats, reduce human error, and make safer security decisions through interactive simulations and structured training modules.\n\nYou can contact us at averiontech47@gmail.com or by mail to Aveiro, Portugal.\n\nThese Legal Terms constitute a legally binding agreement between you and Averion. By accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. If you do not agree, you must discontinue use immediately.\n\nThe Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.`,
    },
    {
      title: 'Our Services',
      content: `Averion provides a multi-tenant cybersecurity awareness training platform. The platform allows organisations to create phishing simulations, build training modules with lessons and quizzes, track employee progress through a real-time analytics dashboard, and generate simulation content using an AI assistant called ARIA.\n\nThe information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction where such distribution or use would be contrary to law or regulation. Those who access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.`,
    },
    {
      title: 'Beta Status',
      content: `Averion is currently in beta and is available free of charge. Features may change, be added, or be removed at any time during the beta period. We will endeavour to notify registered users of significant changes by email.\n\nSubscription plans and pricing will be introduced in a future version of the platform. We will notify all registered users before any paid features are introduced and no charges will be made without your explicit consent.`,
    },
    {
      title: 'AI-Generated Content',
      content: `The platform includes an AI-powered assistant called ARIA that uses OpenAI GPT-4o to generate cybersecurity simulation questions and training content. All AI-generated content is reviewed and approved by an administrator before being made available to users within an organisation. No AI-generated content is published automatically without explicit human approval.\n\nAverion does not guarantee the accuracy, completeness, appropriateness, or fitness for purpose of any AI-generated content. Administrators are solely responsible for reviewing and approving content before it is assigned to users.\n\nWhen administrators use ARIA, their conversation content is sent to OpenAI for processing. We do not send any user personal data to OpenAI. Please refer to our Privacy Policy for full details.`,
    },
    {
      title: 'Intellectual Property Rights',
      content: `We are the owner or licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, text, photographs, and graphics (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein.\n\nOur Content and Marks are protected by copyright and trademark laws. The Content and Marks are provided for your personal, non-commercial use or internal business purpose only.\n\nAny breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.`,
    },
    {
      title: 'User Representations',
      content: `By using the Services, you represent and warrant that all registration information you submit will be true, accurate, current, and complete; you will maintain the accuracy of such information; you have the legal capacity to agree to these Legal Terms; you are not a minor in the jurisdiction in which you reside; you will not access the Services through automated or non-human means; you will not use the Services for any illegal or unauthorised purpose; and your use of the Services will not violate any applicable law or regulation.`,
    },
    {
      title: 'User Registration',
      content: `You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.\n\nAdministrator accounts are intended for use by a single individual. You may not share your account credentials with any other person. Each organisation registered on Averion is assigned a separate data environment and cannot access the data of any other organisation.`,
    },
    {
      title: 'Prohibited Activities',
      content: `You may not access or use the Services for any purpose other than that for which we make the Services available. You agree not to systematically retrieve data to create or compile a database without written permission from us; trick, defraud, or mislead us and other users; circumvent, disable, or interfere with security-related features of the Services, including Row Level Security policies, authentication mechanisms, or rate limits; use any information obtained from the Services to harass, abuse, or harm another person; use the Services in a manner inconsistent with any applicable laws or regulations; upload or transmit viruses, Trojan horses, or other malicious material; engage in any automated use of the system such as scripts, data mining, or bots; attempt to impersonate another user or person; attempt to extract, reverse engineer, or reproduce the AI system prompt or generation logic used by ARIA; or use the Services as part of any effort to compete with us or for any revenue-generating commercial enterprise without our prior written consent.`,
    },
    {
      title: 'User Generated Contributions',
      content: `The Services allow administrators to create simulation scenarios, training modules, lesson content, and quiz questions. Any content you create or upload to the platform may be treated as non-confidential with respect to our obligation to provide the service.\n\nWhen you create or make available any content, you represent and warrant that your content does not violate any applicable law, the privacy or publicity rights of any third party, or any provision of these Legal Terms. You are solely responsible for ensuring that simulation content is appropriate and lawful for use with your employees.`,
    },
    {
      title: 'Services Management',
      content: `We reserve the right, but not the obligation, to monitor the Services for violations of these Legal Terms; take appropriate legal action against anyone who violates the law or these Legal Terms; refuse, restrict access to, or disable any of your content or account; and otherwise manage the Services in a manner designed to protect our rights, property, and the integrity of the platform.`,
    },
    {
      title: 'Term and Termination',
      content: `These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right to deny access and use of the Services to any person for any reason, including breach of any representation, warranty, or covenant contained in these Legal Terms.\n\nIf we terminate your account, you are prohibited from registering a new account under your name or any third party's name. Upon termination, your right to use the Services will cease immediately. Data deletion following termination is handled in accordance with our Privacy Policy.`,
    },
    {
      title: 'Modifications and Interruptions',
      content: `We reserve the right to change, modify, or remove the contents of the Services at any time without notice. We cannot guarantee the Services will be available at all times. During the beta period, maintenance windows, updates, and unexpected downtime may occur. We will not be liable for any loss, damage, or inconvenience caused by your inability to access the Services during downtime or discontinuance.`,
    },
    {
      title: 'Governing Law',
      content: `These Legal Terms shall be governed by and defined following the laws of Portugal. Averion and yourself irrevocably consent that the courts of Portugal shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.`,
    },
    {
      title: 'Dispute Resolution',
      content: `Informal Negotiations — the Parties agree to first attempt to negotiate any dispute informally for at least 30 days before initiating any formal proceedings.\n\nBinding Arbitration — any dispute arising out of or in connection with these Legal Terms that cannot be resolved informally shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels, Avenue Louise, 146).\n\nRestrictions — any arbitration shall be limited to the dispute between the Parties individually. No arbitration shall be joined with any other proceeding.`,
    },
    {
      title: 'Disclaimer',
      content: `The Services are provided on an as-is and as-available basis. You agree that your use of the Services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Services and your use thereof, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.\n\nWe make no warranties or representations about the accuracy or completeness of the Services' content or the content of any websites linked to the Services and we will assume no liability for any errors or omissions in content.`,
    },
    {
      title: 'Limitations of Liability',
      content: `In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Services, even if we have been advised of the possibility of such damages.\n\nAverion is a training platform intended to improve security awareness. It does not guarantee that your organisation will be protected from cyberattacks as a result of using the platform.`,
    },
    {
      title: 'Indemnification',
      content: `You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand made by any third party due to or arising out of your content, use of the Services, breach of these Legal Terms, or violation of the rights of a third party.`,
    },
    {
      title: 'User Data',
      content: `We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.\n\nPlease refer to our Privacy Policy at https://averiontech.vercel.app/privacy for full details of how we collect, use, store, and protect your personal data in compliance with the General Data Protection Regulation (GDPR).`,
    },
    {
      title: 'Electronic Communications',
      content: `Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications and agree that all agreements, notices, disclosures, and other communications we provide to you electronically satisfy any legal requirement that such communication be in writing.`,
    },
    {
      title: 'Corrections',
      content: `There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.`,
    },
    {
      title: 'Miscellaneous',
      content: `These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. If any provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision is deemed severable and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment, or agency relationship created between you and us as a result of these Legal Terms or use of the Services.`,
    },
    {
      title: 'Contact Us',
      content: `To resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at averiontech47@gmail.com.\n\nAverion · Aveiro, Portugal · averiontech.vercel.app`,
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
            Legal · Terms
          </p>
          <h1 className="text-white font-bold mb-5"
            style={{ fontFamily: "'Poppins', sans-serif", fontSize: '48px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Terms and Conditions
          </h1>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            These terms govern your use of Averion and constitute a legally binding agreement between you and Averion. Please read them carefully before using the platform.
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

          {/* Notice */}
          <div className="mb-16 pl-4"
            style={{ borderLeft: '2px solid rgba(239,68,68,0.4)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: '#ef4444' }}>
              Legally Binding
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              By accessing or using Averion, you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, you must discontinue use immediately.
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
                    {section.title}
                  </h2>
                </div>
                <div className="pl-9">
                  {section.content.split('\n\n').map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed"
                      style={{
                        color: 'rgba(255,255,255,0.45)',
                        marginBottom: j < section.content.split('\n\n').length - 1 ? '16px' : '0',
                      }}>
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
              Questions about these terms
            </p>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Contact us and we will respond within 5 business days.
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

export default TermsAndConditions