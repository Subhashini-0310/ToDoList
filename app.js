//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
//requiring lodash
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Subhashini:minchi031096@cluster0.8nb2m.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
//first we create a Schema
const itemsSchema = {
  name: String
};
//2nd we create a Mongoose Model based on that Schema
const Item = mongoose.model("Item", itemsSchema);

//3rd we create our documents
const item1 = new Item({
  name: "Welcome to your ToDoList!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
//4th Now that we have created our items(documents) we will create an Array to insert the items
const defaultItems = [item1, item2, item3];

//*We create another listSchema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//*We now create a Mongoose Model for the listSchema
const List = mongoose.model("list",listSchema);



app.get("/", function(req, res) {

Item.find({}, function(err, foundItems) {
  if (foundItems.length === 0) {
    //5th Now we use the Insertmany() function to insert the documents in the database and we also have a call back function which may or may not respond to the action performed
    Item.insertMany(defaultItems, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully saved default items to Data Base");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  }
});

});
// const day = date.getDate();


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});

//*After creating the Mongoose Model we create a document for it
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err, foundList){
    if(!err)
    {
      if(!foundList){
        //Create a new list

          const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      }
      else{
        //Show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
});


//deleting the checked items
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err)
      {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+ listName);
      }
    });
  }

});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
