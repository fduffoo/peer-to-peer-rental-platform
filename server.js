const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// In-memory database (an array to store rental items)
const rentalItems = [];

// POST endpoint to add items to the rental platform
app.post('/items', (req, res) => {
  const { name, description, pricePerDay, availability } = req.body;

  // Validate input
  if (!name || !description || !pricePerDay || availability === undefined) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Create a new item object
  const newItem = {
    id: rentalItems.length + 1, // Auto-incremented ID
    name,
    description,
    pricePerDay,
    availability,
  };

  // Add the new item to the in-memory array
  rentalItems.push(newItem);

  // Respond with the newly added item
  res.status(201).json(newItem);
});

// GET endpoint to retrieve all items
app.get('/items', (req, res) => {
  res.status(200).json(rentalItems);
});

// GET endpoint to retrieve a specific item by ID
app.get('/items/:id', (req, res) => {
  const { id } = req.params;
  const item = rentalItems.find((i) => i.id === parseInt(id));

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  res.status(200).json(item);
});

// Rent an item (Mark as rented for specific dates)
app.post('/items/rent/:id', (req, res) => {
    const { startDate, endDate } = req.body; // Get rental start and end dates from the request body
    const itemId = parseInt(req.params.id); // Get item ID from URL parameter
  
    // Validate that startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required.' });
    }
  
    // Parse the dates to compare them
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Ensure the start date is before the end date
    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date.' });
    }
  
    // Find the item in the in-memory database (rentalItems array)
    const item = rentalItems.find((i) => i.id === itemId);
  
    // If the item doesn't exist, return a 404 error
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
  
    // Check if the item is already rented
    if (!item.availability) {
      return res.status(400).json({ error: 'Item is already rented.' });
    }
  
    // Add rental dates to the item
    item.rental = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  
    // Mark the item as rented by setting availability to false
    item.availability = false;
  
    // Respond with the updated item and rental confirmation
    res.status(200).json({
      message: 'Item rented successfully',
      item,
    });
  });  

  // PUT endpoint to mark an item as returned
app.put('/items/return/:id', (req, res) => {
    const { id } = req.params;
    const item = rentalItems.find((i) => i.id === parseInt(id));
  
    // If the item is not found, return 404
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
  
    // If the item is already available (not rented), return an error
    if (item.availability) {
      return res.status(400).json({ error: 'Item is already available.' });
    }
  
    // Mark the item as returned and make it available again
    item.availability = true;
    delete item.rental; // Remove rental dates
  
    // Respond with the updated item status
    res.status(200).json({
      message: 'Item returned successfully.',
      item,
    });
  });  

// PUT endpoint to update an item by ID
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, pricePerDay, availability } = req.body;
  const item = rentalItems.find((i) => i.id === parseInt(id));

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  // Update item properties
  if (name) item.name = name;
  if (description) item.description = description;
  if (pricePerDay !== undefined) item.pricePerDay = pricePerDay;
  if (availability !== undefined) item.availability = availability;

  res.status(200).json(item);
});

// DELETE endpoint to remove an item by ID
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  const index = rentalItems.findIndex((i) => i.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  // Remove the item from the array
  const deletedItem = rentalItems.splice(index, 1);
  res.status(200).json({ message: 'Item deleted successfully.', deletedItem });
});

// Sample route to check the server
app.get('/', (req, res) => {
  res.send('Peer-to-Peer Rental Platform Backend is running!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Peer-to-Peer Rental Platform Backend is running on http://localhost:${PORT}`);
});
