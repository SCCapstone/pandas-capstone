import React from 'react';

const About : React.FC = () => {
    return (
        <div className="About">
        {/* About Section */}
        <section>
            <h2 className="text-2xl font-semibold mb-4">About the Team</h2>
            <div className="flex justify-center flex-wrap gap-8">
            <div className="text-center">
                <p className="font-medium">Natalie Crawford</p>
                <a href="https://www.linkedin.com/in/natalie-crawford" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn
                </a>
            </div>
            {/* Add more teammates like this */}
            </div>
        </section>
        </div>
    );
};
export default About;