import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Team: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const teamMembers = [
    {
      name: t.team.members[0].name,
      role: t.team.members[0].role,
      description: '项目发起人，街头涂鸦文化的传播者',
      avatar: 'Boss',
      color: 'graffiti-yellow',
      social: {
        twitter: '#',
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: t.team.members[1].name,
      role: t.team.members[1].role,
      description: '视觉创意总监，街头艺术的灵魂设计师',
      avatar: 'Art',
      color: 'graffiti-pink',
      social: {
        twitter: '#',
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: t.team.members[2].name,
      role: t.team.members[2].role,
      description: '区块链技术专家，智能合约的守护者',
      avatar: 'Dev',
      color: 'graffiti-blue',
      social: {
        twitter: '#',
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: t.team.members[3].name,
      role: t.team.members[3].role,
      description: '社群运营专家，连接每一个街头艺术家',
      avatar: 'CM',
      color: 'graffiti-green',
      social: {
        twitter: '#',
        github: '#',
        linkedin: '#'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-dark-brick pt-20">
      {/* 英雄区块 */}
      <section className="py-20 lg:py-24 px-4 text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-8 w-20 h-20 rounded-full animate-pulse" style={{backgroundColor: 'var(--cta-yellow-spray)'}}></div>
          <div className="absolute top-32 right-12 w-16 h-16 rounded-lg transform rotate-45 animate-pulse delay-300" style={{backgroundColor: 'var(--cta-pink-spray)'}}></div>
          <div className="absolute bottom-24 left-1/4 w-24 h-24 rounded-full animate-pulse delay-700" style={{backgroundColor: 'var(--accent-green-spray)'}}></div>
          <div className="absolute bottom-32 right-1/3 w-18 h-18 rounded-lg transform -rotate-12 animate-pulse delay-500" style={{backgroundColor: 'var(--accent-blue-spray)'}}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="font-graffiti text-5xl lg:text-7xl mb-6 lg:mb-8 text-graffiti-yellow drop-shadow-2xl">
            {t.team.title}
          </h1>
          <p className="font-chinese text-lg lg:text-xl mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed text-text-secondary">
            {t.team.description}
          </p>
        </div>
      </section>

      {/* 团队成员 */}
      <section className="py-16 lg:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="content-card p-8 lg:p-10 text-center group hover-card-rotate transition-all duration-500 relative overflow-hidden"
              >
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 transform rotate-12 group-hover:rotate-45 transition-transform duration-500">
                  <div className={`w-full h-full bg-${member.color} rounded-lg`}></div>
                </div>
                
                {/* 头像 */}
                <div 
                  className={`w-28 h-28 lg:w-32 lg:h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-black group-hover:animate-bounce transition-all duration-300 shadow-2xl bg-${member.color} ${
                    member.color === 'graffiti-yellow' ? 'text-text-primary' : 'text-white'
                  }`}
                >
                  {member.avatar}
                </div>
                
                {/* 基本信息 */}
                <h3 className="font-condensed text-2xl lg:text-3xl font-black mb-2 text-text-primary group-hover:text-graffiti-yellow transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="font-condensed text-lg font-bold mb-4 text-graffiti-yellow">
                  {member.role}
                </p>
                <p className="font-chinese text-sm lg:text-base leading-relaxed mb-6 text-text-secondary">
                  {member.description}
                </p>
                
                {/* 社交链接 */}
                <div className="flex justify-center gap-4">
                  <a 
                    href={member.social.twitter}
                    className="p-2 rounded-full bg-bg-secondary hover:bg-graffiti-blue transition-colors duration-300 group/social"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5 text-text-secondary group-hover/social:text-white transition-colors duration-300" />
                  </a>
                  <a 
                    href={member.social.github}
                    className="p-2 rounded-full bg-bg-secondary hover:bg-text-primary transition-colors duration-300 group/social"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-5 h-5 text-text-secondary group-hover/social:text-bg-primary transition-colors duration-300" />
                  </a>
                  <a 
                    href={member.social.linkedin}
                    className="p-2 rounded-full bg-bg-secondary hover:bg-graffiti-blue transition-colors duration-300 group/social"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5 text-text-secondary group-hover/social:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 团队价值观 */}
      <section className="py-16 lg:py-20 px-4 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-graffiti text-4xl lg:text-5xl text-center mb-12 lg:mb-16 text-graffiti-yellow drop-shadow-2xl">
            {t.team.values.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            <div className="content-card p-8 lg:p-10 text-center hover-card-rotate group">
              <div className="text-4xl lg:text-5xl mb-6 group-hover:animate-pulse">🎨</div>
              <h3 className="font-condensed text-xl lg:text-2xl font-black mb-4 text-text-primary group-hover:text-graffiti-pink transition-colors duration-300">
                {t.team.values.creativity.title}
              </h3>
              <p className="font-chinese text-sm lg:text-base leading-relaxed text-text-secondary">
                {t.team.values.creativity.description}
              </p>
            </div>
            <div className="content-card p-8 lg:p-10 text-center hover-card-rotate group">
              <div className="text-4xl lg:text-5xl mb-6 group-hover:animate-pulse">🤝</div>
              <h3 className="font-condensed text-xl lg:text-2xl font-black mb-4 text-text-primary group-hover:text-graffiti-blue transition-colors duration-300">
                {t.team.values.community.title}
              </h3>
              <p className="font-chinese text-sm lg:text-base leading-relaxed text-text-secondary">
                {t.team.values.community.description}
              </p>
            </div>
            <div className="content-card p-8 lg:p-10 text-center hover-card-rotate group">
              <div className="text-4xl lg:text-5xl mb-6 group-hover:animate-pulse">🚀</div>
              <h3 className="font-condensed text-xl lg:text-2xl font-black mb-4 text-text-primary group-hover:text-graffiti-green transition-colors duration-300">
                {t.team.values.innovation.title}
              </h3>
              <p className="font-chinese text-sm lg:text-base leading-relaxed text-text-secondary">
                {t.team.values.innovation.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 加入我们 */}
      <section className="py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-graffiti text-4xl lg:text-5xl mb-6 lg:mb-8 text-graffiti-yellow drop-shadow-2xl">
            {t.team.join.title}
          </h2>
          <p className="font-chinese text-lg lg:text-xl mb-8 lg:mb-12 leading-relaxed text-text-secondary">
            {t.team.join.description}
          </p>
          <a
            href="mailto:team@yescoin.com"
            className="graffiti-button btn-yellow-spray px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl font-black inline-flex items-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
            {t.team.join.contact}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Team;