import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

function Footer() {
  const { t } = useTranslation()

  const socialLinks = [
    {
      label: 'Visit Averion website',
      path: 'https://averiontech.vercel.app',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      label: 'Contact Averion by email',
      path: 'mailto:averiontech47@gmail.com',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ]

  const productLinks = [
    { label: t('nav.home'),    path: '/' },
    { label: t('nav.about'),   path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
    { label: t('nav.signIn'),  path: '/login' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy',     path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Cookie Declaration', path: '/cookies' },
  ]

  return (
    <footer aria-label="Site footer" className="bg-[#020408] border-t border-white/5 px-8 py-16">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* ── Brand ── */}
          <div className="md:col-span-2">
            <Link to="/" aria-label="Averion — go to homepage">
              <img src="/images/logo.svg" alt="Averion logo" className="h-8 w-auto mb-4" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>

            {/* Social links */}
            <nav aria-label="Social and contact links">
              <ul className="flex items-center gap-3 mt-6 list-none">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    
                      href={social.path}
                      aria-label={social.label}
                      target={social.path.startsWith('http') ? '_blank' : undefined}
                      rel={social.path.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Product links ── */}
          <nav aria-label="Product navigation">
            <h2 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Product
            </h2>
            <ul className="flex flex-col gap-3 list-none">
              {productLinks.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Legal links ── */}
          <nav aria-label="Legal navigation">
            <h2 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Legal
            </h2>
            <ul className="flex flex-col gap-3 list-none">
              {legalLinks.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            © 2026 Averion. {t('footer.rights')}
          </p>
          <div
            role="status"
            aria-label="System status: all systems operational"
            className="flex items-center gap-1.5">
            <div aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-gray-400 text-xs">All systems operational</p>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer