import React from 'react';

const FinalDemo : React.FC = () => {
    return (
        <div className="FinalDemo">
            {/* Video Section */}
            <section>
                <h1 className="text-3xl font-bold mb-4">Final Demo</h1>
                <div className="aspect-w-16 aspect-h-9">
                <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/placeholder" // Replace with real video URL
                    title="Final Demo Video"
                    allowFullScreen
                />
                </div>
            </section>
        </div>
    );
};
export default FinalDemo;