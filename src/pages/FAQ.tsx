import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle, Mail } from 'lucide-react';

const FAQ: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 从翻译文件获取FAQ数据
  const faqCategories = t.faq.categories;
  
  // 将分类数据转换为扁平的FAQ列表
  const faqData = faqCategories.flatMap((category, categoryIndex) => 
    category.questions.map((question, questionIndex) => ({
      id: `${categoryIndex}-${questionIndex}`,
      question: question.question,
      answer: question.answer,
      category: category.title.toLowerCase().replace(/\s+/g, '_')
    }))
  );

  // 动态生成分类列表
  const categories = [
    { id: 'all', label: language === 'zh' ? '全部' : 'All' },
    ...faqCategories.map((category, index) => ({
      id: category.title.toLowerCase().replace(/\s+/g, '_'),
      label: category.title
    }))
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const expandAll = () => {
    setOpenItems(new Set(filteredFAQs.map(item => item.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="min-h-screen bg-dark-brick pt-20">
      {/* 英雄区块 */}
      <section className="py-20 lg:py-24 px-4 text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-8 w-20 h-20 rounded-full animate-pulse" style={{backgroundColor: 'var(--cta-blue-spray)'}}></div>
          <div className="absolute top-32 right-12 w-16 h-16 rounded-lg transform rotate-45 animate-pulse delay-300" style={{backgroundColor: 'var(--cta-purple-spray)'}}></div>
          <div className="absolute bottom-24 left-1/4 w-24 h-24 rounded-full animate-pulse delay-700" style={{backgroundColor: 'var(--accent-cyan-spray)'}}></div>
          <div className="absolute bottom-32 right-1/3 w-18 h-18 rounded-lg transform -rotate-12 animate-pulse delay-500" style={{backgroundColor: 'var(--accent-indigo-spray)'}}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <HelpCircle className="w-12 h-12 text-graffiti-blue" />
            <h1 className="font-graffiti text-5xl lg:text-7xl text-graffiti-blue drop-shadow-2xl">
              {t.faq.title}
            </h1>
          </div>
          <p className="font-chinese text-lg lg:text-xl mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed text-text-secondary">
            {t.faq.description}
          </p>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, var(--graffiti-blue), var(--graffiti-purple))' }}></div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* 搜索和筛选 */}
        <div className="content-card rounded-3xl p-8 mb-12 border-l-4 border-graffiti-blue">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-graffiti-blue w-6 h-6" />
              <input
                type="text"
                placeholder={language === 'zh' ? '搜索问题...' : 'Search questions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl transition-all duration-300 focus:scale-105 font-chinese text-lg"
                style={{
                  border: '2px solid var(--graffiti-blue)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 transform hover:-rotate-1 ${
                    selectedCategory === category.id
                      ? 'graffiti-button'
                      : 'hover-card-rotate'
                  }`}
                  style={selectedCategory === category.id ? {
                    background: 'linear-gradient(135deg, var(--cta-blue-spray), var(--cta-purple-spray))',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                  } : {
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '2px solid var(--border-color)'
                  }}
                >
                  <span className="font-condensed">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 展开/折叠控制 */}
          <div className="flex justify-between items-center">
            <span className="font-chinese text-text-secondary">
              {language === 'zh' ? '找到' : 'Found'} <span className="font-graffiti text-graffiti-blue font-black">{filteredFAQs.length}</span> {language === 'zh' ? '个问题' : 'questions'}
            </span>
            <div className="flex gap-4">
              <button
                onClick={expandAll}
                className="font-condensed font-bold hover:scale-105 transition-all duration-300 text-graffiti-blue"
              >
                {language === 'zh' ? '展开全部' : 'Expand All'}
              </button>
              <span className="text-border-color">|</span>
              <button
                onClick={collapseAll}
                className="font-condensed font-bold hover:scale-105 transition-all duration-300 text-graffiti-purple"
              >
                {language === 'zh' ? '折叠全部' : 'Collapse All'}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ列表 */}
        <div className="space-y-6">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <HelpCircle className="w-16 h-16 mx-auto text-graffiti-blue opacity-50" />
              </div>
              <p className="font-chinese text-xl text-text-secondary">
                {language === 'zh' ? '没有找到相关问题' : 'No questions found'}
              </p>
            </div>
          ) : (
            filteredFAQs.map((item) => {
              const isOpen = openItems.has(item.id);
              
              return (
                <div
                  key={item.id}
                  className="content-card rounded-3xl overflow-hidden transition-all duration-500 hover-card-rotate border-l-4"
                  style={{
                    borderLeftColor: item.category === 'general' ? 'var(--graffiti-blue)' : 
                                     item.category === 'technical' ? 'var(--graffiti-purple)' : 
                                     item.category === 'account' ? 'var(--cta-yellow-spray)' : 'var(--graffiti-blue)'
                  }}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-8 text-left flex items-center justify-between hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <h3 className="font-condensed text-xl lg:text-2xl font-bold pr-6 text-text-primary group-hover:text-graffiti-blue transition-colors duration-300">
                      {item.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-8 h-8 transition-all duration-500 group-hover:scale-110 text-graffiti-purple" />
                      ) : (
                        <ChevronDown className="w-8 h-8 transition-all duration-500 group-hover:scale-110 text-graffiti-blue" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-8 pb-8">
                      <div className="pt-6 border-t-2 border-graffiti-blue/20">
                        <p className="font-chinese text-lg leading-relaxed text-text-secondary">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 联系支持 */}
        <div className="content-card rounded-3xl p-12 text-center mt-16 border-l-4 border-graffiti-yellow relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-8 w-16 h-16 rounded-full animate-pulse" style={{backgroundColor: 'var(--cta-yellow-spray)'}}></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 rounded-lg transform rotate-45 animate-pulse delay-500" style={{backgroundColor: 'var(--graffiti-purple)'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <MessageCircle className="w-12 h-12 text-graffiti-yellow" />
              <h3 className="font-graffiti text-3xl lg:text-4xl text-graffiti-yellow drop-shadow-lg">
                {language === 'zh' ? '还有其他问题？' : 'Still have questions?'}
              </h3>
            </div>
            <p className="font-chinese text-lg lg:text-xl mb-10 text-text-secondary leading-relaxed max-w-2xl mx-auto">
              {language === 'zh' ? '我们的支持团队随时为您提供帮助' : 'Our support team is here to help'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://t.me/yescoin_support"
                target="_blank"
                rel="noopener noreferrer"
                className="graffiti-button flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 transform hover:-rotate-1"
                style={{
                  background: 'linear-gradient(135deg, var(--cta-blue-spray), var(--cta-purple-spray))',
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                }}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="font-condensed text-lg">{language === 'zh' ? 'Telegram 支持' : 'Telegram Support'}</span>
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;