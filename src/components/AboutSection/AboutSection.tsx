import React from 'react';
import { AboutContent } from '../../types/content';
import { parseMarkdownBold } from '../../utils/textUtils';

interface AboutSectionProps {
    content: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
    return (
        <section id="about" aria-labelledby="about-heading">
            <h2 className="section-heading" id="about-heading">About</h2>
            <p className="about-intro">
                {content.greeting}
            </p>
            <div className="about-content">
                {content.paragraphs.map((paragraph, index) => (
                    <p key={index}>
                        {parseMarkdownBold(paragraph)}
                    </p>
                ))}
            </div>
        </section>
    );
};
