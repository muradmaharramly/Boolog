import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi';
import '../styles/_faq.scss';

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is Boolog?",
      answer: "Boolog is a modern, open-source blogging platform designed specifically for developers, designers, and tech enthusiasts to share knowledge, tutorials, and insights."
    },
    {
      question: "Is Boolog free to use?",
      answer: "Yes! Boolog is completely free for both readers and writers. We believe in democratizing access to technical knowledge."
    },
    {
      question: "Who can publish articles on Boolog?",
      answer: "Only administrators can publish blog posts on Boolog. This ensures content quality, consistency, and a curated reading experience for all users."
    },
    {
      question: "Can I customize my profile?",
      answer: "Absolutely. You can update your avatar, add a bio, and link your social profiles. We're also rolling out more customization features soon."
    },
    {
      question: "How are the 'Trending' posts selected?",
      answer: "Our algorithm highlights posts based on real-time engagement metrics including views, likes, comments, and recency to ensure the most relevant content surfaces first."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-layout">
          {/* Left Column: Header */}
          <div className="faq-header">
            <div className="section-badge">
              <FiHelpCircle /> Frequently asked questions
            </div>
            <h2>Frequently asked <br /><span className="highlight">questions</span></h2>
            <p>Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.</p>
          </div>

          {/* Right Column: Accordion */}
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleAccordion(index)}
              >
              <div className="glow-shape left"></div>
            <div className="glow-shape right"></div>
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <span className="icon">
                    {activeIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </div>
                <div className="faq-answer">
                  <div className="answer-content">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
