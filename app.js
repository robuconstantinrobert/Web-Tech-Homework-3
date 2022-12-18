const express = require('express')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/food-items', async (req, res) => {

    try {
        // Check if request body is present
        if (Object.keys(req.body).length === 0) {
          return res.status(400).json({ message: 'body is missing' });
        }
    
        // Check if request body properties are missing
        if (!req.body.name || !req.body.category || !req.body.calories) {
          return res.status(400).json({ message: 'malformed request' });
        }
    
        // Check if calories is positive
        if (req.body.calories < 0) {
          return res.status(400).json({ message: 'calories should be a positive number' });
        }
    
        // Check if category is valid
        if (!['MEAT', 'DAIRY', 'VEGETABLE'].includes(req.body.category)) {
          return res.status(400).json({ message: 'not a valid category' });
        }
    
        // Create new food item
        let foodItem = new FoodItem({
          name: req.body.name,
          category: req.body.category,
          calories: req.body.calories
        });
        await foodItem.save();
    
        res.status(201).json({ message: 'created' });
      } catch (err) {
        console.warn(err.stack);
        res.status(500).json({ message: 'server error' });
      }
})

module.exports = app







