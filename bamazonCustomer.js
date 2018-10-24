let mysql = require("mysql");
let inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "righter",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  console.log("connected as id " + connection.threadId);
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which displays availvible products and prompts the user type id number of product they wish to buy.  
function start() {
  queryAllProducts();
  buyStuff();
};

function queryAllProducts() {
  connection.query("SELECT * FROM products", function(err, results) {
    console.log(results);
    for (let i = 0; i < results.length; i++) {
      console.log("Welcome to Quarks Black Market Sales.  Here is what we have for sale today...");
      console.log("Item ID# | Product Name | Type | Price(Latinum) | Stock");
      console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | $" + results[i].price + " | " + results[i].stock_quantity);
    }
    console.log("-----------------------------------");
  });
}

// function to handle buying stuff
function buyStuff() {
  // The app should then prompt users with two messages.
  inquirer
    // prompt for info about the item being purchased
    .prompt([
          // The first should ask them the ID of the product they would like to buy.
        {
          name: "itemID",
          type: "input",
          message: "Type the ID number of the item you wish to purchase",
          validate: function(value) {
              if (isNaN(value) === false) {
              return true;
              }
              return false;
          }
        },
        // The second message should ask how many units of the product they would like to buy.
        {
          name: "quantity",
          type: "input",
          message: "How many do you wish to purchase?"
        }
      ])
    .then(function(answer) {
      // get the information of the chosen item
      let chosenItem;
        for (let i = 0; i < results.length; i++) {
          if (results[i].item_id === answer.itemID) {
            chosenItem = results[i];
          }
        }  
        // determine if there is enough of that item
        if (chosenItem.stock_quantity <= parseInt(answer.quantity)) {
          newQuantity = chosenItem.stock_quantity - parseInt(answer.quantity);
          // the quantity was high enough, so update db, let the user know, 
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              // This means updating the SQL database to reflect the remaining quantity.
              {
                stock_quantity: newQuantity
              },
              {
                item_id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              // fulfill the customer's order.
              console.log("Transaction completed!");

// Once the update goes through, show the customer the total cost of their purchase.


              // start over
              start();
            }
          );
        }
        else {
          // If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
          console.log("I told you I don't have that many! Try again...");
          // start over
          start();
        }


        





