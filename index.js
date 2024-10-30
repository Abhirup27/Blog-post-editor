// const express = require('express');
// const multer = require('multer'); // For handling multipart/form-data
 const bodyparser = require("body-parser");
// const app = express();

// // Configure multer for image uploads
// const storage = multer.memoryStorage(); // Store files in memory
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   }
// });

// const port = process.env.PORT || 8080;

// //app.use(express.json());

// app.use(express.static("public"));

// // app.set('views', [
// // join(__dirname, 'views'),
// // join(__dirname, 'utils')
// // ]);

// // app.use(bodyparser.urlencoded({
// //     extended: true
// // }));
// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb', extended: true}));
//  app.listen(port, () => {
//     console.log("server running");
//  });

// app.get("/", (req, res) => {
     
//     res.render("index.ejs");

// });
// app.post 

// app.post("/publish",  upload.single('image'), (req, res) => {
//   // Handle the uploaded file

  
//   // Process the file and send back the URL or data
//    const imageData = req.body["imageData"].toString('base64');
//   const jsondata = req.body;
//     console.log(req.body["imageData"])
//   res.json({
//     url: `data:${req.body["imageData"]};base64,${imageData}`
//   });
// });

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    // Create uploads directory if it doesn't exist
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

// Configure upload limits and file filter
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
app.use(bodyparser.urlencoded({
    extended: true
}));
app.get("/", (req, res) => {
     
    res.render("index.ejs");

});
// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create URL path for the uploaded file
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

// Serve static files from public directory
app.use(express.static('public'));
 app.listen(port, () => {
    console.log("server running");
 });


app.post('/publish', (req, res) => {
  console.log(req.body);
});