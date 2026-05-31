import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#020408] border-t border-white/5 px-8 py-16">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/images/logo.svg" alt="Averion" className="h-8 w-auto mb-4" />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
              ].map((path, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {path}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Product</p>
            <div className="flex flex-col gap-3">
              {[
                { label: t('nav.home'),    path: '/' },
                { label: t('nav.about'),   path: '/about' },
                { label: t('nav.contact'), path: '/contact' },
                { label: t('nav.signIn'),  path: '/login' },
              ].map(item => (
                <Link key={item.label} to={item.path}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-200">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Legal</p>
            <div className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms of Service', 'Security'].map(item => (
                <a key={item} href="#"
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-200">
                  {item}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2026 Averion. {t('footer.rights')}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-gray-600 text-xs">All systems operational</p>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer