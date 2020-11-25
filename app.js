//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//create new monngoDB and delete array because their place replace with mongo, array static when we restart nodemon then enter dara lost thats why we use mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// create item Schema
const itemsSchema = mongoose.Schema({
  name: String,

});


//create mongoose model based on a Schema
const Item = mongoose.model("Item", itemsSchema);

//creating new document from Itme model
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];


//for work or home
const listSchema =  mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);





app.get("/", function(req, res) {

  //mongoose find()  back as an array its find the item and inside the founditems collection

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.")
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




app.get("/:customListName", function(req, res) {
  // /work or /home then this url print on console Screen
  //console.log(req.params.customListName);
  const customListName = req.params.customListName;
// findOne returns if query matches, first document is returned, otherwise null.
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
         //create when List now exist
         //console.log("Doesn't exist!");
         const list = new List({
           name: customListName,
           items: defaultItems
         });list.save();
         //created new list then all we have now call list.save that into the lists collection

         res.redirect("/"+ customListName );
      }else{
        //show existing list
        //console.log("Exists!");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });





});





app.post("/", function(req, res) {

  const itemName = req.body.newItem;// from input
  const listName = req.body.list;//button get value

  const itemextra = new Item({
    name: itemName
  });

  if(listName === "Today"){
    itemextra.save();
      res.redirect("/");
  }else{

    List.findOne({name: listName},  function(err, foundList){
     
      foundList.items.push(itemextra);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
  //mongoose shortcut by saying that will save item into our collection of items

});



app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;// by ID

   const listName = req.body.listname;//get by hidden input



  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){

     if(!err){

         console.log("Successfully deleted checked item");

         res.redirect("/");

       }

    });
  }
  

  else{

  //   //custom listTitle

  //   //3 things

  //   //First which list you would like to find

  //   //second what update we would like to make -- the array of items //*pull use for remove element from the array *// 

  //   //third is callback - find one is find the list

     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){

       if(!err){

         res.redirect("/" + listName);

      }
   });
 
 }

});



app.get("/about", function(req, res) {
  res.render("about");
});


// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port)

// app.listen(port, function() {
//   console.log("Server started Successfully");
// });

app.listen(3000, function(){
  console.log("Server started on port 3000");
  });