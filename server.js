const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()

const port = process.env.PORT || 4000
const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://aditya:aditya@cluster0.tsxb5lv.mongodb.net/?retryWrites=true&w=majority'

const mongoose = require('mongoose')

const csv = require('csv-parser')
const fs = require('fs')

const multer = require('multer')
const upload = multer();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/images', express.static(__dirname+'/public/images'))
app.use('public', express.static(__dirname + '/public'))




mongoose.connect(mongoUrl, {useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('mongodb connected')
}).catch((err)=>{
    console.log(err)
})


const record = mongoose.Schema({
    studentName:{type:String, required:true},
    gender:{type:String, required:true},
    company:{type:String, required:true},
    package:{type:Number, required:true},
    year:{type:Number, required:true}
})

const Record = mongoose.model("Record", record)


// home page
app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname+"/home.html"))
})

app.get('/api/v1/index', (req, res)=>{
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.post("/api/v1/upload", (req, res)=>{
  // res.send("<h1>aditya</h1>")
  res.sendFile(path.join(__dirname + "/public/login.html"))
  console.log('a')
})

//from csv
app.post("/api/v1/fromcsv", (req, res)=>{
    
  fs.createReadStream('public/students.csv')
  .pipe(csv())
  .on('data', (data)=>{
    console.log(data);
    const student = new Record(data);
    student.save();
  })
  .on('end', ()=>{  
    console.log('csv data saved')
  });
  // res.send("<h1>ok</h1>")
  console.log("csv sent....")
});   
  

app.get('/api/v1/data', function(req, res) {
  let count;
  Record.countDocuments({}, function(err, count) {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching data from MongoDB');
    } else {
      let maleCount = 0;
      let femaleCount = 0;
      let maxPackageCompany = '';
      let maxPackage = 0;
      Record.find({}, function(err, records) {
        records.forEach(record => {
          if (record.gender === 'male') {
            maleCount++;
          } else if (record.gender === 'female') {
            femaleCount++;
          }
          if (record.package > maxPackage) {
            maxPackage = record.package;
            maxPackageCompany = record.company;
          }
        });
        res.send(`
          <html>
            <head>
              <title>Records</title>
            </head>
            <body>
              <div>Total Entries: ${count}</div>
              <div>Male: ${maleCount}</div>
              <div>Female: ${femaleCount}</div>
              <div>Company with Maximum Package: ${maxPackageCompany} (${maxPackage})</div>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Gender</th>
                    <th>Company</th>
                    <th>Package</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map(record => `
                    <tr>
                      <td>${record.studentName}</td>
                      <td>${record.gender}</td>
                      <td>${record.company}</td>
                      <td>${record.package}</td>
                      <td>${record.year}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
      });
    }
  });
});

  
app.get('/api/v1/graph', (req, res)=>{
  res.sendFile(path.join(__dirname + '/public/graph.html'))
})
           
app.get('/api/v1/graphData', (req, res)=>{
  Record.find({}, function(err, records) {
    console.log('data sent') 
   res.send(records)
  });        
})        

app.set('view engine', path.join(__dirname, 'views'))

app.listen(port, ()=>{
  console.log(`ok port ${port}`)
})  
    