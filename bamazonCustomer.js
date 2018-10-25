let mysql = require("mysql");
let inquirer = require("inquirer");
let confirm = require('inquirer-confirm');

// create the connection information for the sql database
let connection = mysql.createConnection({
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
  //console.log("connected as id " + connection.threadId);
  if (err) throw err;
  console.log("Welcome to Quarks Black Market Sales!");
  // run the start function after the connection is made to prompt the user
  start();
});

// function which displays availvible products and prompts the user type id number of product they wish to buy.  
function start() {
  queryAllProducts();
};

function queryAllProducts() {
  connection.query("SELECT * FROM products", function(err, results) {
    //console.log(results);
    console.log("Here is what we have for sale today...");
    console.log("-----------------------------------");
    //console.log("ID#   | Product Name | Type | Price(Latinum) | Stock");
    for (let i = 0; i < results.length; i++) {
      console.log("ID# " + results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | Price $" + results[i].price + " | Stock " + results[i].stock_quantity);
    }
    console.log("-----------------------------------");
    buyStuff(results);
  });
}

// function to handle buying stuff
function buyStuff(results) {
  // The app should then prompt users with two messages.
  inquirer
    // prompt for info about the item being purchased
    .prompt([
          // The first should ask them the ID of the product they would like to buy.
        {
          name: "itemID",
          type: "input",
          message: "Type the ID number of the item you wish to purchase.",
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
          message: "How many do you wish to purchase?",
          validate: function(value) {
            if (isNaN(value) === false) {
            return true;
            }
            return false;
        }
        }
      ])
    .then(function(answer) {
      // get the information of the chosen item
      //console.log(answer.itemID);
      //console.log(answer.quantity);
      //console.log(results);
      let chosenItem;
      //console.log(results[3].item_id);
      for (let i = 0; i < results.length; i++) {
        if (results[i].item_id === parseInt(answer.itemID)) {
          chosenItem = results[i];
        }
      }  
      // determine if there is enough of that item
      if (parseInt(answer.quantity) <= chosenItem.stock_quantity) {
        newQuantity = chosenItem.stock_quantity - parseInt(answer.quantity);
        // the quantity was high enough, so update db, let the user know, 
        //console.log(chosenItem.item_id)
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            // This means updating the SQL database to reflect the remaining quantity.
            {
              stock_quantity: newQuantity
            },
            {
              item_id: chosenItem.item_id
            }
          ],
          function(error) {
            if (error) throw err;
            console.log(newQuantity);
            // fulfill the customer's order.
            console.log("Transaction completed!");
            // Once the update goes through, show the customer the total cost of their purchase.
            let totalCost = parseInt(answer.quantity) * chosenItem.price
            console.log("Total Cost is $" + totalCost);
            console.log("I'm sure I must have something else you would like!");
              // ask if they wish to continue
              let confirm = require('inquirer-confirm');
              confirm('Would you like to buy something else?')
                .then(function confirmed() 
                {
                  // start over
                  start();
                }, function cancelled() 
                {
                  console.log('sorry to hear that');
                  let code = 0;
                  process.exit(code);
                });
          }
        );
      }
      else {
        // If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
        console.log("I told you I don't have that many! Try again...");
        // start over
        buyStuff(results);
      }

    });
};
