const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/user-routes');
const ingredientRoutes = require('./routes/ingredients-routes');
const inventoryRoutes = require('./routes/inventory-routes');
const supplierRoutes = require('./routes/supplier-routes');
const categoryRoutes = require('./routes/categories-routes');
const inventoryOrderRoutes = require('./routes/inventory-orders-routes');
const subCategoryRoutes = require('./routes/sub-category-routes');
const authrouter = require('./routes/auth-routes')

app.use('/user', userRoutes); 


app.use(express.json());
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/resources/static/assets/uploads'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(authrouter, ingredientRoutes, inventoryRoutes, supplierRoutes, categoryRoutes, inventoryOrderRoutes, subCategoryRoutes);
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});
app.get('/', (req, res) => {
    res.send('Welcome to Trello Project Management');
});


// Start the server
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});