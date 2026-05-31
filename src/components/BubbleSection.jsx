import { useTranslation } from '../hooks/useTranslation'

function BubbleSection() {
  const { t } = useTranslation()

  const steps = [
    {
      number: '01',
      title: t('bubble.step1Title'),
      desc: t('bubble.step1Desc'),
      size: 'small',
    },
    {
      number: '02',
      title: t('bubble.step2Title'),
      desc: t('bubble.step2Desc'),
      size: 'medium',
    },
    {
      number: '03',
      title: t('bubble.step3Title'),
      desc: t('bubble.step3Desc'),
      size: 'large',
    },
  ]

  return (
    <section className="bg-[#04080f] py-28 px-8 relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <p className="text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3">
              {t('bubble.badge')}
            </p>
            <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
              {t('bubble.heading1')}<br />
              <span className="text-gray-500">{t('bubble.heading2')}</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-12 max-w-md">
              {t('bubble.subtext')}
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-5 group">
                  <div className={`rounded-full flex items-center justify-center flex-shrink-0 border-2 font-bold text-sm transition-all duration-300
                    ${step.size === 'small' ? 'w-10 h-10 border-blue-800 text-blue-600 group-hover:border-blue-500 group-hover:text-blue-400' :
                      step.size === 'medium' ? 'w-12 h-12 border-blue-700 text-blue-500 group-hover:border-blue-400 group-hover:text-blue-300' :
                      'w-14 h-14 border-blue-600 text-blue-400 group-hover:border-blue-400 group-hover:text-blue-200'}`}>
                    {step.number}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-white font-bold text-base mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#04080f] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <img src="/images/woman-laptop.jpg" alt="Professional working"
              className="w-full h-[500px] object-cover rounded-2xl"
              onError={e => { e.target.src = 'https://placehold.co/800x500/0d1117/1d4ed8?text=Averion+Training' }} />

            {/* Floating card */}
            <div className="absolute bottom-8 left-8 z-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-green-400 text-xs font-semibold">{t('bubble.activeProtection')}</p>
              </div>
              <p className="text-white text-2xl font-bold">94%</p>
              <p className="text-gray-400 text-xs mt-0.5">{t('bubble.statLabel')}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default BubbleSection
