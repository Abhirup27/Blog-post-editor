const bodyparser = require("body-parser");
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {

    // Create unique filename with original extension

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});
const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');
 const tailwindClassMap = {
  h1: 'text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight',
  h2: 'text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-3 leading-tight',
  h3: 'text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2',
  h4: 'text-xl font-medium text-gray-600 dark:text-gray-400 mb-2',
  h5: 'text-lg font-medium text-gray-500 dark:text-gray-500 mb-1',
  h6: 'text-base font-medium text-gray-400 dark:text-gray-600 mb-1',
  p: 'text-base leading-relaxed text-gray-600 dark:text-gray-300 mb-4',
  ul: 'list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4',
  ol: 'list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4',
   li: 'ml-4',
  img: 'rounded-lg max-w-full h-auto'
};

app.use(bodyparser.urlencoded({
    extended: true
}));

function processHtml(htmlContent, imageData) {
  try {

    const images = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
    
    // Load HTML content
    const $ = cheerio.load(htmlContent);

    // Replace image placeholders
    $('span').each((_, element) => {
      const text = $(element).text();

      //console.log(text);
         if (text.startsWith('<IMG:') && text.endsWith('>')) {
        const index = parseInt(text.match(/<IMG:(\d+)>/)[1]);
        console.log("THE INDEX:"+ index);
        if (images[index]) {
          const imageInfo = images[index];

          const imgElement = `<img src="${imageInfo.src}" alt="${imageInfo.alt || ''}" width="${imageInfo.width || ''}" height="${imageInfo.height || ''}" class="${tailwindClassMap.img}">`;
          $(element).replaceWith(imgElement);
        }
      }
    });

    // Add Tailwind classes
    Object.entries(tailwindClassMap).forEach(([tag, classes]) => {
      $(tag).each((_, element) => {
        const existingClasses = $(element).attr('class') || '';
        const newClasses = `${existingClasses} ${classes}`.trim();
        $(element).attr('class', newClasses);
      });
    });

    return $.html();
  } catch (error) {
    console.error('Error processing HTML:', error);
    return htmlContent;
  }
}

app.post('/process-content-safe', (req, res) => {
  const { htmlContent } = req.body;
  
  if (!htmlContent) {
    return res.status(400).json({ error: 'No HTML content provided' });
  }


  const sanitizedHtml = sanitizeHtml(htmlContent, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'br', 'b','i','u','span', 'img'],
    allowedAttributes: {
      '*': ['class']
    }
  });

  const processedHtml = processHtml(sanitizedHtml);
  res.json({ processedHtml });
});
app.get("/", (req, res) => {
     
    res.render("index.ejs");

});

app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

  
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});
const port = process.env.PORT || 8080;

// Error handler for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});


app.use(express.static('public'));
 app.listen(port, () => {
    console.log("server running");
 });


app.post('/publish', (req, res) => {
  console.log(req.body);
   const  htmlContent  = req.body.Body;
  
  // if (!htmlContent) {
  //   return res.status(400).json({ error: 'No HTML content provided' });
  // }


  const sanitizedHtml = sanitizeHtml(htmlContent, {
     allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'br', 'b','i','u','span', 'img'],
    allowedAttributes: {
      '*': ['class']
    }
  });

  const processedHtml = processHtml(sanitizedHtml, req.body.imageData);
  console.log(processedHtml);
  res.render("post.ejs", { post: processedHtml });
});

app.get('/test', (req, res) => {
  res.render("tailwind.ejs");
});


