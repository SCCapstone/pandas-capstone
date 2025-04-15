const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas'); // Fixed import
// Try to register Apple Color Emoji font (works on Mac)
try {
    registerFont('/System/Library/Fonts/Apple Color Emoji.ttf', { family: 'Apple Color Emoji' });
  } catch (e) {
    console.log('Apple Color Emoji font not found, falling back to system emoji font');
  }
  

// Define emojis and background colors
const emojisWithBackgrounds = [
    { emoji: "🐓", bgColor: "#EF9A9A", filename: "rooster.png" },
    { emoji: "🌸", bgColor: "#F9D5E5", filename: "cherry_blossom.png" },
    { emoji: "☕", bgColor: "#D7CCC8", filename: "coffee.png" },
    { emoji: "🎧", bgColor: "#B39DDB", filename: "headphone.png" },
    { emoji: "📚", bgColor: "#FFE0B2", filename: "books.png" },
    { emoji: "🧃", bgColor: "#A5D6A7", filename: "beverage-box.png" },
    { emoji: "💻", bgColor: "#90CAF9", filename: "computer.png" },
    { emoji: "🌈", bgColor: "#FFD54F", filename: "rainbow.png" },
    { emoji: "🍄", bgColor: "#EF9A9A", filename: "mushroom.png" },
    { emoji: "✨", bgColor: "#FFF59D", filename: "sparkles.png" },
    { emoji: "🌙", bgColor: "#B0BEC5", filename: "crescent_moon.png" },
    { emoji: "🌞", bgColor: "#FFECB3", filename: "sun_with_face.png" },
    { emoji: "🍓", bgColor: "#F48FB1", filename: "strawberry.png" },
    { emoji: "🧸", bgColor: "#D7CCC8", filename: "teddy-bear_1f9f8.png" },
    { emoji: "🪴", bgColor: "#C8E6C9", filename: "potted-plant.png" },
    { emoji: "📀", bgColor: "#CE93D8", filename: "cd.png" },
    { emoji: "🌴", bgColor: "#B39DDB", filename: "palm-tree.png" },
    { emoji: "🦄", bgColor: "#F8BBD0", filename: "unicorn.png" }, 
    { emoji: "🎮", bgColor: "#81D4FA", filename: "video_game.png" },
    { emoji: "🫶", bgColor: "#FFCDD2", filename: "heart-hands.png" },
    { emoji: "🩵", bgColor: "#B2EBF2", filename: "water-wave.png" },
    { emoji: "🪩", bgColor: "#FFD180", filename: "mirror-ball.png" },
    { emoji: "🌊", bgColor: "#80DEEA", filename: "water-wave.png" },
    { emoji: "🍉", bgColor: "#FFAB91", filename: "watermelon.png" },
    { emoji: "🕯️", bgColor: "#F0EAD6", filename: "candle.png" },
    { emoji: "🌟", bgColor: "#FFE082", filename: "glowing-star_1f31f.png" },
    { emoji: "🛼", bgColor: "#F8BBD0", filename: "roller-skate.png" },
    { emoji: "🐟", bgColor: "#81D4FA", filename: "fish.png" },
    { emoji: "🥤", bgColor: "#A7FFEB", filename: "cup-with-straw.png" },
    { emoji: "🏀", bgColor: "#FFE082", filename: "basketball.png" },
    { emoji: "🛹", bgColor: "#B2EBF2", filename: "skateboard.png" },
    { emoji: "🎸", bgColor: "#EF9A9A", filename: "guitar.png" },
    { emoji: "🐷", bgColor: "#F8BBD0", filename: "pig-face.png" },
    { emoji: "👥", bgColor: "#B0BEC5", filename: "busts-in-silhouette.png" },
    { emoji: "👤", bgColor: "#FFD54F", filename: "bust-in-silhouette.png" },
  ];
const SIZE = 400; // Final image size
const EMOJI_SIZE = 200; // Size of the emoji within the circle

const outputDir = './output_emojis_pfp_pngs';

// 3. Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 4. Process each emoji
async function processEmojis() {
  for (const { bgColor, filename } of emojisWithBackgrounds) {
    try {
      // Create canvas with circular background
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext('2d');
      
      // Draw colored circle
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Load and draw emoji image
      const emojiPath = path.join('./input_emojis', filename);
      const emojiImg = await loadImage(emojiPath);
      
      // Calculate position (centered)
      const x = (SIZE - EMOJI_SIZE) / 2;
      const y = (SIZE - EMOJI_SIZE) / 2;
      
      // Draw emoji (with transparency preserved)
      ctx.drawImage(emojiImg, x, y, EMOJI_SIZE, EMOJI_SIZE);
      
      // Save result
      const outputPath = path.join(outputDir, `circle_${filename}`);
      fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
      console.log(`Created: ${outputPath}`);
      
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  }
}

processEmojis().then(() => console.log('All emoji circles created!'));