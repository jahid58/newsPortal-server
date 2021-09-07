const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 3000;
const uri = ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntakd.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const newsCollection = client.db("newsPortal").collection("news");
  const adminCollection = client.db("newsPortal").collection("admins");

  app.get("/getNews", (req, res) => {
    newsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/description/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    newsCollection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminCollection
      .insertOne(admin)
      .then((result) => {
        res.send(result.insertedCount > 0);
      })
      .catch((err) => console.log(err));
  });
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;

    adminCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });
  app.post("/addNews", (req, res) => {
    const file = req.files.file;
    const headline = req.body.headline;
    const description = req.body.description;

    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    newsCollection
      .insertOne({ headline, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      })
      .catch((err) => console.log(err));
  });
});

app.listen(process.env.PORT || port);
