const express = require('express');
const multer = require('multer'); // For handling multipart/form-data
const bodyparser = require("body-parser");
const app = express();

// Configure multer for image uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const port = process.env.PORT || 8080;

//app.use(express.json());

app.use(express.static("public"));

// app.set('views', [
// join(__dirname, 'views'),
// join(__dirname, 'utils')
// ]);

// app.use(bodyparser.urlencoded({
//     extended: true
// }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
 app.listen(port, () => {
    console.log("server running");
 });

app.get("/", (req, res) => {
     
    res.render("index.ejs");

});

app.post("/publish",  upload.single('image'), (req, res) => {
  // Handle the uploaded file
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  // Process the file and send back the URL or data
    const imageData = req.file.buffer.toString('base64');
    console.log(imageData);
  res.json({
    url: `data:${req.file.mimetype};base64,${imageData}`
  });
});