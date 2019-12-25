//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://andrew-admin:test123@cluster0-nifpu.mongodb.net/todolist', {
  // mongoose.connect('mongodb://127.0.0.1:27017 /todolist', {

  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema)

const listSchema = {

  name: String,
  listItems: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

const item1 = new Item({
  name: "Wellcome to your notes"
})

const item2 = new Item({
  name: "For add note press +"
})

const item3 = new Item({
  name: "<<<- Press check box to delete a note"
})

const itemsArr = [item1, item2, item3];





app.get("/", function (req, res) {
  const day = date.getDate();

  const items = Item.find({}, (err, result) => {
    if (result.length === 0) {
      Item.insertMany(itemsArr, (err) => err ? console.log(err) : console.log("everything is ok"));
      res.redirect("/");
    }

    else { res.render("list", { listTitle: "Today", newListItems: result }) };

  });


});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const curentTitle = req.body.list1;


  const itemFromUser = new Item({
    name: item
  })

  if (curentTitle === "Today") {
    itemFromUser.save();
    res.redirect("/");
    console.log("IIIIFFFFF")

  }
  else {
    List.findOne({ name: curentTitle }, (err, foundList) => {
      console.log("ELSEEEEEE")
      foundList.listItems.push(itemFromUser);
      foundList.save();
      res.redirect("/" + curentTitle);

    })
  }
});

app.post("/delete", (req, res) => {

  const itemId = req.body.checkbox;
  const itemTitle = req.body.hiddenInp



  if (itemTitle === "Today") {
    Item.findByIdAndRemove(itemId, () => console.log("deleted"))

    res.redirect("/");

  }
  else {

    List.findOne({ name: itemTitle }, (err, foundList) => {
      foundList.listItems = foundList.listItems.filter((item) => {
        return item._id != itemId;
      })
      foundList.save();
      res.redirect("/" + itemTitle);
    }

      // List.findByIdAndUpdate({ name: itemTitle }, { $pull: { listItems: { _id: Number(itemId) } } }, (err) => {
      //   console.log(err)
      //   console.log(itemId)

      //   res.redirect("/" + itemTitle)

      // })
    )
  }
  console.log(itemId)
})




app.get("/:page", function (req, res) {
  let customListName = _.capitalize(req.params.page)
  const item = req.body.newItem;

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {

        // const userItem = new Item({
        //   name: item
        // })
        // const itemsArr = []
        // itemsArr.push(userItem)
        const listdb = new List({



          name: customListName,
          listItems: itemsArr
        })
        listdb.save();
        res.redirect("/" + customListName)

      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.listItems })
      }
    }
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
