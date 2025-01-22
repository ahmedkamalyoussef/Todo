const express = require('express');
const { ObjectId } = require("mongodb");


const router = express.Router();
const { getConnectedClient } = require('./database');

const getCollection = () => {
   const client = getConnectedClient();
   console.log(client);
   const collection = client.db("todosdb").collection("todos");
   return collection;
}


// Get /Todos
router.get('/todos', async (req, res) => {
   const collection = getCollection();
   const todos = await collection.find({}).toArray();
   res.status(200).json(todos);
});


// Post /ToDos
router.post('/todos', async (req, res) => {
   let { todo } = req.body;

   if (!todo) {
      return res.status(400).json({ error: "Todo field is required" });
   }

   todo = (typeof todo === 'string') ? todo : JSON.stringify(todo); 

   const collection = getCollection();
   const newTodo = await collection.insertOne({ todo, status: false });

   res.status(201).json({ todo, status: false, _id: newTodo.insertedId });
});


// Delete /ToDos
router.delete('/todos/:id', async (req, res) => {
   const collection = getCollection();
   const _id = new ObjectId(req.params.id);

   const deletedTodo = await collection.deleteOne({ _id });
   res.status(201).json(deletedTodo);
});


// Put /ToDos/:id
router.put('/todos/:id', async (req, res) => {
   const collection = getCollection();
   const _id = new ObjectId(req.params.id);
   const { status } = req.body;

   if(typeof status !== 'boolean') {
      return res.status(400).json({ error: "invalid status" });
   }
   const updatedTodo = await collection.updateOne({ _id }, { $set: { status: !status } });
   res.status(201).json(updatedTodo);
});

module.exports = router;