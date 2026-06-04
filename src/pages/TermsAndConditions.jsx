import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function TermsAndConditions() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated June 04, 2026</p>

        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">AGREEMENT TO OUR LEGAL TERMS</h2>
            <p>We are Averion ("Company", "we", "us", or "our"). We operate the website <a href="https://averiontech.vercel.app" className="text-blue-600 hover:underline">https://averiontech.vercel.app</a> (the "Site"), as well as any other related products and services that refer or link to these legal terms (collectively, the "Services").</p>
            <p className="mt-3">Averion is a cybersecurity awareness platform that helps organizations train employees to recognize common threats, reduce human error, and make safer security decisions through interactive learning.</p>
            <p className="mt-3">You can contact us by email at <a href="mailto:averiontech47@gmail.com" className="text-blue-600 hover:underline">averiontech47@gmail.com</a> or by mail to Portugal.</p>
            <p className="mt-3">These Legal Terms constitute a legally binding agreement between you and Averion. By accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE, YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
            <p className="mt-3">The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">1. OUR SERVICES</h2>
            <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction where such distribution or use would be contrary to law or regulation. Those who access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">2. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p>We are the owner or licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").</p>
            <p className="mt-3">Our Content and Marks are protected by copyright and trademark laws around the world. The Content and Marks are provided "AS IS" for your personal, non-commercial use or internal business purpose only.</p>
            <p className="mt-3">Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">3. USER REPRESENTATIONS</h2>
            <p>By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal capacity to agree to these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means; (6) you will not use the Services for any illegal or unauthorised purpose; and (7) your use of the Services will not violate any applicable law or regulation.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">4. USER REGISTRATION</h2>
            <p>You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">5. PURCHASES AND PAYMENT</h2>
            <p>We accept the following forms of payment: Visa, Mastercard, PayPal, American Express.</p>
            <p className="mt-3">You agree to provide current, complete, and accurate purchase and account information for all purchases. All payments shall be in Euros. We reserve the right to refuse any order and to correct any errors in pricing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">6. SUBSCRIPTIONS</h2>
            <p><strong>Billing and Renewal:</strong> Your subscription will continue and automatically renew unless cancelled. The billing cycle is monthly.</p>
            <p className="mt-3"><strong>Free Trial:</strong> We offer a 14-day free trial to new users who register with the Services. The account will be charged according to the user's chosen subscription at the end of the free trial.</p>
            <p className="mt-3"><strong>Cancellation:</strong> All purchases are non-refundable. You can cancel your subscription at any time by contacting us at <a href="mailto:averiontech47@gmail.com" className="text-blue-600 hover:underline">averiontech47@gmail.com</a>. Your cancellation will take effect at the end of the current paid term.</p>
            <p className="mt-3"><strong>Fee Changes:</strong> We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">7. PROHIBITED ACTIVITIES</h2>
            <p>You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:</p>
            <ul className="list-disc ml-6 mt-3 space-y-2">
              <li>Systematically retrieve data to create or compile a collection, database, or directory without written permission from us</li>
              <li>Trick, defraud, or mislead us and other users, especially to learn sensitive account information</li>
              <li>Circumvent, disable, or interfere with security-related features of the Services</li>
              <li>Use any information obtained from the Services to harass, abuse, or harm another person</li>
              <li>Use the Services in a manner inconsistent with any applicable laws or regulations</li>
              <li>Upload or transmit viruses, Trojan horses, or other malicious material</li>
              <li>Engage in any automated use of the system, such as scripts, data mining, or robots</li>
              <li>Attempt to impersonate another user or person</li>
              <li>Use the Services as part of any effort to compete with us or for any revenue-generating commercial enterprise</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">8. USER GENERATED CONTRIBUTIONS</h2>
            <p>The Services may invite you to contribute to blogs, message boards, forums, and other functionality. Any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you represent and warrant that your Contributions do not violate any applicable law, the privacy or publicity rights of any third party, or any provision of these Legal Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">9. CONTRIBUTION LICENCE</h2>
            <p>By posting your Contributions to any part of the Services, you automatically grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right and licence to host, use, copy, reproduce, disclose, sell, publish, broadcast, translate, transmit, and distribute such Contributions for any purpose, commercial or otherwise.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">10. SERVICES MANAGEMENT</h2>
            <p>We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms; (3) refuse, restrict access to, or disable any of your Contributions; and (4) otherwise manage the Services in a manner designed to protect our rights and property.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">11. TERM AND TERMINATION</h2>
            <p>These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right to deny access and use of the Services to any person for any reason, including breach of any representation, warranty, or covenant contained in these Legal Terms. If we terminate your account, you are prohibited from registering a new account under your name or any third party's name.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">12. MODIFICATIONS AND INTERRUPTIONS</h2>
            <p>We reserve the right to change, modify, or remove the contents of the Services at any time without notice. We cannot guarantee the Services will be available at all times and will not be liable for any loss, damage, or inconvenience caused by your inability to access the Services during downtime or discontinuance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">13. GOVERNING LAW</h2>
            <p>These Legal Terms shall be governed by and defined following the laws of Portugal. Averion and yourself irrevocably consent that the courts of Portugal shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">14. DISPUTE RESOLUTION</h2>
            <p><strong>Informal Negotiations:</strong> The Parties agree to first attempt to negotiate any Dispute informally before initiating arbitration.</p>
            <p className="mt-3"><strong>Binding Arbitration:</strong> Any dispute arising out of or in connection with these Legal Terms shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels, Avenue Louise, 146).</p>
            <p className="mt-3"><strong>Restrictions:</strong> Any arbitration shall be limited to the Dispute between the Parties individually. No arbitration shall be joined with any other proceeding.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">15. CORRECTIONS</h2>
            <p>There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors and to change or update information at any time without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">16. DISCLAIMER</h2>
            <p className="uppercase text-xs leading-relaxed">The services are provided on an as-is and as-available basis. You agree that your use of the services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the services and your use thereof, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">17. LIMITATIONS OF LIABILITY</h2>
            <p className="uppercase text-xs leading-relaxed">In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the services, even if we have been advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">18. INDEMNIFICATION</h2>
            <p>You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand made by any third party due to or arising out of your Contributions, use of the Services, breach of these Legal Terms, or violation of the rights of a third party.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">19. USER DATA</h2>
            <p>We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
            <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications and agree that all agreements, notices, disclosures, and other communications we provide to you electronically satisfy any legal requirement that such communication be in writing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">21. MISCELLANEOUS</h2>
            <p>These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. If any provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision is deemed severable and does not affect the validity and enforceability of any remaining provisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3">22. CONTACT US</h2>
            <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
            <div className="mt-3 text-gray-700">
              <p className="font-semibold">Averion</p>
              <p>Portugal</p>
              <p><a href="mailto:averiontech47@gmail.com" className="text-blue-600 hover:underline">averiontech47@gmail.com</a></p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TermsAndConditions