import React from 'react';

const WebsiteMilestone : React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 text-center">
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

      {/* GitHub Link */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">GitHub Repository</h2>
        <a
          href="https://github.com/yourusername/your-repo" // Replace with your repo URL
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-lg"
        >
          View the Code on GitHub
        </a>
        <p className="text-sm text-gray-500 mt-1">Make your repo public for easier access.</p>
      </section>
    </div>
  );
};

export default WebsiteMilestone;
