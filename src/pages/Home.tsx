import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { ArrowRight, Target, Palette, Rocket, Users, ExternalLink, TrendingUp, Shield, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  // 模拟统计数据
  const stats = [
    { label: t.home.stats.holders, value: '15,234', icon: '👥' },
    { label: t.home.stats.marketCap, value: '$2.5M', icon: '💰' },
    { label: t.home.stats.nftMinted, value: '3,456', icon: '🎨' },
    { label: t.home.stats.airdropUsers, value: '8,901', icon: '🎁' },
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: t.home.features.fair.title,
      description: t.home.features.fair.description,
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: t.home.features.culture.title,
      description: t.home.features.culture.description,
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: t.home.features.freedom.title,
      description: t.home.features.freedom.description,
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t.home.features.community.title,
      description: t.home.features.community.description,
    },
  ];

  const roadmapPhases = [
    {
      title: t.home.roadmap.phase1.title,
      description: t.home.roadmap.phase1.description,
      status: 'completed',
    },
    {
      title: t.home.roadmap.phase2.title,
      description: t.home.roadmap.phase2.description,
      status: 'current',
    },
    {
      title: t.home.roadmap.phase3.title,
      description: t.home.roadmap.phase3.description,
      status: 'upcoming',
    },
    {
      title: t.home.roadmap.phase4.title,
      description: t.home.roadmap.phase4.description,
      status: 'future',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-brick">
      {/* 英雄区块 */}
      <section className="hero-section relative py-24 lg:py-32 px-4 text-center overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-16 left-8 lg:left-16 w-24 h-24 lg:w-32 lg:h-32 rounded-full transform rotate-12 animate-pulse" style={{backgroundColor: 'var(--cta-yellow-spray)'}}></div>
          <div className="absolute top-32 right-12 lg:right-20 w-20 h-20 lg:w-24 lg:h-24 rounded-lg transform -rotate-12 animate-pulse delay-300" style={{backgroundColor: 'var(--cta-pink-spray)'}}></div>
          <div className="absolute bottom-24 left-1/4 w-16 h-16 lg:w-20 lg:h-20 rounded-full animate-pulse delay-700" style={{backgroundColor: 'var(--accent-green-spray)'}}></div>
          <div className="absolute bottom-32 right-1/3 w-20 h-20 lg:w-28 lg:h-28 rounded-lg transform rotate-45 animate-pulse delay-500" style={{backgroundColor: 'var(--accent-blue-spray)'}}></div>
          <div className="absolute top-1/2 left-12 w-12 h-12 rounded-full animate-pulse delay-1000" style={{backgroundColor: 'var(--accent-cyan)'}}></div>
          <div className="absolute top-3/4 right-16 w-16 h-16 rounded-lg transform -rotate-45 animate-pulse delay-200" style={{backgroundColor: 'var(--graffiti-orange)'}}></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="font-graffiti text-5xl sm:text-6xl lg:text-8xl xl:text-9xl mb-6 lg:mb-8 text-graffiti-yellow drop-shadow-2xl transform hover:scale-105 transition-transform duration-300">
            {t.home.title}
          </h1>
          <p className="font-condensed text-xl sm:text-2xl lg:text-3xl font-black mb-4 lg:mb-6 text-text-primary">
            {t.home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
            <Link
              to="/nft"
              className="graffiti-button btn-yellow-spray px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl font-black flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              {t.home.getStarted}
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </Link>
            <Link
              to="/team"
              className="graffiti-button btn-pink-spray px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl font-black flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              {t.home.learnMore}
              <ExternalLink className="w-5 h-5 lg:w-6 lg:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="py-16 lg:py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center content-card p-6 lg:p-8 hover-card-rotate group">
                <div className="text-4xl lg:text-5xl mb-3 lg:mb-4 group-hover:animate-bounce transition-all duration-300">{stat.icon}</div>
                <div className="font-graffiti text-2xl lg:text-4xl font-black mb-2 text-graffiti-yellow drop-shadow-lg">{stat.value}</div>
                <div className="font-condensed font-bold text-sm lg:text-base text-text-secondary uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心特色 */}
      <section className="py-20 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-graffiti text-4xl lg:text-6xl text-center mb-16 lg:mb-20 text-graffiti-yellow drop-shadow-2xl">
            {t.home.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="content-card p-8 lg:p-10 hover-card-rotate group transition-all duration-500"
              >
                <div className="mb-6 text-graffiti-yellow group-hover:text-graffiti-pink transition-colors duration-300 group-hover:scale-110 transform">{feature.icon}</div>
                <h3 className="font-condensed text-xl lg:text-2xl font-black mb-4 text-text-primary group-hover:text-graffiti-yellow transition-colors duration-300">{feature.title}</h3>
                <p className="font-chinese leading-relaxed text-sm lg:text-base text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 发展路线图 */}
      <section className="py-20 lg:py-24 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-graffiti text-4xl lg:text-6xl text-center mb-16 lg:mb-20 text-graffiti-yellow drop-shadow-2xl">
            {t.home.roadmap.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {roadmapPhases.map((phase, index) => (
              <div
                key={index}
                className={`content-card relative p-6 lg:p-8 hover-card-rotate group transition-all duration-500 border-l-4 ${
                  phase.status === 'completed'
                    ? 'border-graffiti-green'
                    : phase.status === 'current'
                    ? 'border-graffiti-yellow'
                    : phase.status === 'upcoming'
                    ? 'border-graffiti-blue'
                    : 'border-text-secondary'
                }`}
              >
                <div
                  className={`absolute -top-3 left-4 px-3 py-2 rounded-full text-sm font-black shadow-lg ${
                    phase.status === 'completed'
                      ? 'bg-graffiti-green text-white'
                      : phase.status === 'current'
                      ? 'bg-graffiti-yellow text-text-primary'
                      : phase.status === 'upcoming'
                      ? 'bg-graffiti-blue text-white'
                      : 'bg-text-secondary text-white'
                  }`}
                >
                  {phase.status === 'completed' ? '✓' : phase.status === 'current' ? '⚡' : '⏳'}
                </div>
                <h3 className="font-condensed text-lg lg:text-xl font-black mb-4 mt-2 text-text-primary group-hover:text-graffiti-yellow transition-colors duration-300">{phase.title}</h3>
                <p className="font-chinese text-sm lg:text-base leading-relaxed text-text-secondary">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心团队 */}
      <section className="py-20 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-graffiti text-4xl lg:text-6xl text-center mb-16 lg:mb-20 text-graffiti-yellow drop-shadow-2xl">
            {t.team.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {t.team.members.map((member, index) => (
              <div
                key={index}
                className="content-card p-8 lg:p-10 text-center group hover-card-rotate transition-all duration-500"
              >
                <div 
                  className={`w-24 h-24 lg:w-28 lg:h-28 mx-auto mb-6 rounded-full flex items-center justify-center text-xl lg:text-2xl font-black group-hover:animate-bounce transition-all duration-300 shadow-2xl ${
                    member.avatar === 'Boss' ? 'bg-graffiti-yellow text-text-primary' :
                    member.avatar === 'Art' ? 'bg-graffiti-pink text-white' :
                    member.avatar === 'Dev' ? 'bg-graffiti-blue text-white' :
                    member.avatar === 'CM' ? 'bg-graffiti-green text-white' : 'bg-text-secondary text-white'
                  }`}
                >
                  {member.avatar}
                </div>
                <h3 className="font-condensed text-xl lg:text-2xl font-black mb-3 text-text-primary group-hover:text-graffiti-yellow transition-colors duration-300">{member.name}</h3>
                <p className="font-chinese text-sm lg:text-base text-text-secondary">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区块 */}
      <section className="py-20 lg:py-24 px-4 bg-gradient-to-br from-graffiti-yellow/20 to-graffiti-pink/20 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full animate-pulse" style={{backgroundColor: 'var(--cta-yellow-spray)'}}></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-lg transform rotate-45 animate-pulse delay-500" style={{backgroundColor: 'var(--cta-pink-spray)'}}></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full animate-pulse delay-1000" style={{backgroundColor: 'var(--accent-blue-spray)'}}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="font-graffiti text-4xl lg:text-6xl mb-6 lg:mb-8 text-graffiti-yellow drop-shadow-2xl">
            {t.home.cta.title}
          </h2>
          <p className="font-chinese text-lg lg:text-xl mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed text-text-primary opacity-90">
            {t.home.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
            <Link
              to="/airdrop"
              className="graffiti-button btn-yellow-spray px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl font-black transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              {t.home.cta.joinAirdrop}
            </Link>
            <Link
              to="/nft"
              className="graffiti-button btn-pink-spray px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl font-black transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              {t.home.cta.mintNft}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;