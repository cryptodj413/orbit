import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import BentoSection from './BentoSection';
import CTASection from './CTASection';
import FAQSection from './FAQSection';
import Footer from './Footer';

const OrbitCDP: React.FC = () => {
  // Mock data for components
  const headerData = {
    logo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/ec7f8ca4f7a1029daa83d810f7cded988a0f89d807abf91960dcc45e38f409f6?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
    navLinks: ['About', 'Features', 'Security', 'Community'],
  };

  const heroData = {
    title: 'Get your finances in',
    highlightedText: 'Orbit',
    subtitle:
      'Harness the Power of Collateralized Debt Positions for Secure and Reliable Stablecoins',
    learnMoreIcon:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/95709ffcb5f442df795b6f1e07f6b7e7fd23ffbc17291cd4027e547502f604f5?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
  };

  const bentoData = {
    stats: [
      {
        title: 'Total Value Locked',
        value: '$350.240',
        change: '+21.77',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/5cb167b02d9a63cb3abae90cb136d8a212814271fd425b7a08f08d5be81f923a?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
      {
        title: 'Total Debt',
        value: '$245.015',
        change: '-0.14',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/0ae5a7181adf3ca6a0f39df00608bc996f3e088e78d219c598ebc2659c0cba25?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
    ],
    sideCardData: {
      title: 'Borrow APY',
      value: '4.0%',
      activityTitle: 'User Activity',
      activityChart:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/c48c618d4e83efb72f0ff01751dc9548d36bbdb299d7d0e896b55014d2f3cb4f?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      activityValue: '90,293',
      activityIcon:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/7ded706ae5dc90ce7a8fc8c93df748098c30760cda7d587573138822aeca27a8?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
    },
  };

  const ctaData = {
    title: 'Getting started is easy.',
    subtitle:
      'Start creating and managing your stablecoins now or explore our comprehensive guides and resources.',
    primaryButtonText: 'Open your dashboard',
    primaryButtonIcon:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/14d227dbe45f7b252fec8739de2896e835a49e9851c1e79a2a549f4113262e18?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
    secondaryButtonText: 'Read the Docs',
    secondaryButtonSubtext: 'Open App',
  };

  const faqData = {
    title: 'Frequently Asked Questions',
    faqItems: [
      {
        question: 'What is OrbitCDP?',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/72b50ccb4447b32267b0a2be24856e771c288a3c777f8a91f8fcfeb5c81ebab8?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
      {
        question:
          'What is a Collateralized Debt Position (CDP) and how does it differ from fiat-backed and algorithmic stablecoins?',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/72b50ccb4447b32267b0a2be24856e771c288a3c777f8a91f8fcfeb5c81ebab8?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
      {
        question: 'What is Blend and why do we use it?',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/5d571362bac82ba6ce22da74ae0111796fd8fa39c1b4eee43652c844552f5708?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
      {
        question: 'What is your plan for the DAO?',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/9e961d14670dc2a98cc44fe9bb8bac7602846fcf966c24f7ea8981228992606e?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
      {
        question: 'How does OrbitCDP support cross-border transactions and what are the benefits?',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/f0b0c36ee43209f698f58a9dcf87b80b0548a57e5c94d544d2fe3b3852e7b413?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      },
    ],
  };

  const footerData = {
    logoText: 'OrbitCDP',
    links: ['Homepage', 'App', 'Docs', 'Blog'],
    socialIcons: [
      'https://cdn.builder.io/api/v1/image/assets/TEMP/008cbf64ccef84f1be153bc4815b2aabcedaaca68b6d2bb54b239e7c2731fd71?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      'https://cdn.builder.io/api/v1/image/assets/TEMP/5453452229e79aac4c924f793ea71954db70109688c27eacea63fcdd0ae3a2c4?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
      'https://cdn.builder.io/api/v1/image/assets/TEMP/bf45f5ec18c7e54f5ce6537c2801acc75b8467f568800a026206f7faed4a1bd1?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68',
    ],
  };

  return (
    <div className="desktop">
      <div className="main-container">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/c1f78506953d507d294202a7920315c59e9e3cb31df11fe3ad7cff8350e22bc4?placeholderIfAbsent=true&apiKey=5f75e1e4274048f68e346e0d4a4b6f68"
          alt=""
          className="background-image"
        />
        <div className="content-wrapper">
          <Header {...headerData} />
          <HeroSection {...heroData} />
          <BentoSection {...bentoData} />
          <CTASection {...ctaData} />
          <FAQSection {...faqData} />
          <Footer {...footerData} />
        </div>
      </div>
    </div>
  );
};

export default OrbitCDP;
