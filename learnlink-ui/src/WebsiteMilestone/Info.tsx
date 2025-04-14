import React from 'react';

const Info : React.FC = () => {
    return (
        <div className='info'>
            {/* App Explanation Section */}
            <section>
            <h2 className="text-2xl font-semibold mb-2">Why Use This App?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Our app helps students in large classes form study groups quickly and securely.
                By focusing on usability and privacy, we created a platform that encourages collaboration 
                without compromising personal data. Whether you're new to a course or looking to connect
                with classmates, our app makes it simple and safe to engage.
            </p>
            </section>

            {/* Screenshots & Images */}
            <section>
            <h2 className="text-2xl font-semibold mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <img src="/screenshots/home.png" alt="Home screen" className="rounded shadow" />
                <img src="/screenshots/chat.png" alt="Chat feature" className="rounded shadow" />
                <img src="/screenshots/group-form.png" alt="Form group screen" className="rounded shadow" />
                {/* Optional stock image */}
                <img src="https://stockvault.net/data/2020/06/15/276836/preview16.jpg" alt="Stock visual" className="rounded shadow" />
            </div>
            </section>
        </div>
    );
};
export default Info;