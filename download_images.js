const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const images = [
  {
    name: 'hero.jpg',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&q=85'
  },
  {
    name: 'orientation.jpg',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'culture.jpg',
    url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'alatoo.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Ala_Too_Square_Bishkek_2021.jpg'
  },
  {
    name: 'museum.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/817_-_State_Historical_Museum%2C_Bishkek.jpg'
  },
  {
    name: 'bazaar.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Osh_Bazaar_in_Bishkek%2C_Kyrgyzstan.jpg'
  },
  {
    name: 'oakpark.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Oak_Park_in_Bishkek_2.jpg'
  },
  {
    name: 'alaarcha.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Ala_Archa_1.JPG'
  },
  {
    name: 'beshbarmak.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Beshbarmak%2C_national_dish_%283991850909%29.jpg'
  },
  {
    name: 'plov.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Plov.jpg'
  },
  {
    name: 'samsa.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Samsa.jpg'
  },
  {
    name: 'kymyz.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/A_bowl_of_kymyz_in_Almaty.jpg'
  },
  {
    name: 'kalpak.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Kalpak_%28K%C4%B1rg%C4%B1z%29.jpg'
  },
  {
    name: 'autumn.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Osh_Bazaar_in_Bishkek%2C_Kyrgyzstan-_dried_fruits_and_nuts.jpg'
  },
  {
    name: 'spring.jpg',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'summer.jpg',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'winter.jpg',
    url: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80'
  }
];

const destDir = path.join(__dirname, 'images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const client = url.startsWith('https') ? https : http;
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Referer': 'https://commons.wikimedia.org/'
    }
  };

  client.get(url, options, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      download(response.headers.location, dest, cb);
      return;
    }
    if (response.statusCode !== 200) {
      cb(new Error(`Failed with status ${response.statusCode} for ${url}`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => cb(null));
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    cb(err);
  });
}

let idx = 0;
function next() {
  if (idx >= images.length) {
    console.log('=== ALL IMAGES SUCCESSFULLY DOWNLOADED ===');
    return;
  }
  const item = images[idx++];
  const destPath = path.join(destDir, item.name);
  console.log(`[${idx}/${images.length}] Downloading ${item.name}...`);
  download(item.url, destPath, (err) => {
    if (err) {
      console.error(`ERROR downloading ${item.name}:`, err.message);
    } else {
      console.log(`SUCCESS: Saved ${item.name} (${fs.statSync(destPath).size} bytes)`);
    }
    next();
  });
}

next();
