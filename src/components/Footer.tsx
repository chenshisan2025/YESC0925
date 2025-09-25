import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <footer className="bg-black text-white py-8" style={{ borderTop: '3px solid var(--cta-yellow-spray)' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4" style={{
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFCC00, #FFB347)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.3)',
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
        }}>
          {/* Social Links */}
          <div className="flex items-center space-x-8 text-3xl">
            {/* X (Twitter) Icon */}
            <a
              href="https://x.com/yescoin_globalx?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors duration-200"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            
            {/* Telegram Link */}
            <a
              href="https://t.me/Yes_CoinX"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors duration-200"
            >
              Telegram
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-sm">
            <p>{t.footer.copy}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}