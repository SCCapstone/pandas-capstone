import React from 'react';
import './ProfilePicModal.css';

const baseUrl = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_";

const emojiOptions = [
  { emoji: "🌸", bgColor: "#F9D5E5", filename: "cherry_blossom.png", URL: `${baseUrl}cherry_blossom.png` },
  { emoji: "☕", bgColor: "#D7CCC8", filename: "coffee.png", URL: `${baseUrl}coffee.png` },
  { emoji: "🎧", bgColor: "#B39DDB", filename: "headphone.png", URL: `${baseUrl}headphone.png` },
  { emoji: "📚", bgColor: "#FFE0B2", filename: "books.png", URL: `${baseUrl}books.png` },
  { emoji: "🧃", bgColor: "#A5D6A7", filename: "beverage-box.png", URL: `${baseUrl}beverage-box.png` },
  { emoji: "💻", bgColor: "#90CAF9", filename: "computer.png", URL: `${baseUrl}computer.png` },
  { emoji: "🐓", bgColor: "#EF9A9A", filename: "rooster.png", URL: `${baseUrl}rooster.png`  },
  { emoji: "🌈", bgColor: "#FFD54F", filename: "rainbow.png", URL: `${baseUrl}rainbow.png` },
  { emoji: "🍄", bgColor: "#EF9A9A", filename: "mushroom.png", URL: `${baseUrl}mushroom.png` },
  { emoji: "✨", bgColor: "#FFF59D", filename: "sparkles.png", URL: `${baseUrl}sparkles.png` },
  { emoji: "🌙", bgColor: "#B0BEC5", filename: "crescent_moon.png", URL: `${baseUrl}crescent_moon.png` },
  { emoji: "🌞", bgColor: "#FFECB3", filename: "sun_with_face.png", URL: `${baseUrl}sun_with_face.png` },
  { emoji: "🍓", bgColor: "#F48FB1", filename: "strawberry.png", URL: `${baseUrl}strawberry.png` },
  { emoji: "🧸", bgColor: "#D7CCC8", filename: "teddy-bear_1f9f8.png", URL: `${baseUrl}teddy-bear_1f9f8.png` },
  { emoji: "🪴", bgColor: "#C8E6C9", filename: "potted-plant.png", URL: `${baseUrl}potted-plant.png` },
  { emoji: "📀", bgColor: "#CE93D8", filename: "cd.png", URL: `${baseUrl}cd.png` },
  { emoji: "🎮", bgColor: "#81D4FA", filename: "video_game.png", URL: `${baseUrl}video_game.png` },
  { emoji: "🫶", bgColor: "#FFCDD2", filename: "heart-hands.png", URL: `${baseUrl}heart-hands.png` },
  { emoji: "🌴", bgColor: "#B39DDB", filename: "palm-tree.png" , URL: `${baseUrl}palm-tree.png`},
  { emoji: "🦄", bgColor: "#F8BBD0", filename: "unicorn.png", URL: `${baseUrl}unicorn.png` }, 
  { emoji: "🪩", bgColor: "#FFD180", filename: "mirror-ball.png", URL: `${baseUrl}mirror-ball.png` },
  { emoji: "🌊", bgColor: "#80DEEA", filename: "water-wave.png", URL: `${baseUrl}water-wave.png` },
  { emoji: "🍉", bgColor: "#FFAB91", filename: "watermelon.png", URL: `${baseUrl}watermelon.png` },
  { emoji: "🕯️", bgColor: "#F0EAD6", filename: "candle.png", URL: `${baseUrl}candle.png` },
  { emoji: "🌟", bgColor: "#FFE082", filename: "glowing-star_1f31f.png", URL: `${baseUrl}glowing-star_1f31f.png` },
  { emoji: "🛼", bgColor: "#F8BBD0", filename: "roller-skate.png", URL: `${baseUrl}roller-skate.png` },
  { emoji: "🐟", bgColor: "#81D4FA", filename: "fish.png", URL: `${baseUrl}fish.png` },
  { emoji: "🥤", bgColor: "#A7FFEB", filename: "beverage-box.png", URL: `${baseUrl}beverage-box.png` },
  { emoji: "🏀", bgColor: "#FFE082", filename: "basketball.png", URL: `${baseUrl}basketball.png` },
  { emoji: "🛹", bgColor: "#B2EBF2", filename: "skateboard.png", URL: `${baseUrl}skateboard.png` },
  { emoji: "🎸", bgColor: "#EF9A9A", filename: "guitar.png", URL: `${baseUrl}guitar.png` },
  { emoji: "🐷", bgColor: "#F8BBD0", filename: "pig-face.png", URL: `${baseUrl}pig-face.png` },
  { emoji: "👥", bgColor: "#B0BEC5", filename: "busts-in-silhouette.png", URL: `${baseUrl}busts-in-silhouette.png` },
  { emoji: "👤", bgColor: "#FFD54F", filename: "bust-in-silhouette.png", URL: `${baseUrl}bust-in-silhouette.png` },
];

interface ProfilePicModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (emoji: string, URL: string) => void;
}

const ProfilePictureModal: React.FC<ProfilePicModalProps> = ({ isOpen, onRequestClose, onSelect }) => {
  if (!isOpen) return null;

  const handleSelectEmoji = (emoji: string, URL:string) => {
    onSelect(emoji, URL);
  };

  return (
    <div className="pfp-modal" onClick={onRequestClose}>
      <div className="pfp-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="pfp-modal-close-button" onClick={onRequestClose}>
          &times;
        </button>
        <h3>Pick your profile picture</h3>
        <div className="emoji-grid">
          {emojiOptions.map(({ emoji, bgColor, URL }) => (
            <button
              key={emoji}
              onClick={() => handleSelectEmoji(emoji, URL)}
              className="emoji-button"
              style={{
                backgroundColor: bgColor,
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transform:"transition: transform 0.3s ease-in-out, background-color 0.3s ease"
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
