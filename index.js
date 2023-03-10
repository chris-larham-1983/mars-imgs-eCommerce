//Express server
const express = require('express');
const app = express();
//front-end <--> back-end communication
const cors = require('cors');
//define port
const PORT = process.env.PORT || 5000;
//facilitate the joining of directory paths together
const path = require('path');
//stripe functions
const createCheckoutSession = require('./api/checkout');
const webhook = require('./api/webhook');

//middleware
app.use(cors()); //allows the front end to communicate with the back end (REACT <--> NODE)

//facilitate access to req.body and allow stripe payment details to be sent to POST /webhook endpoint
app.use(express.json({
    verify: (req, res, buffer) => req['rawBody'] = buffer,
}));

//ensure correct directory paths in production
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
}

//ROUTES:

//register and login routes
app.use("/auth", require("./routes/jwtAuth"));

//dashboard route
app.use("/dashboard", require("./routes/dashboard"));

//create stripe checkout session
app.use("/create-checkout-session", createCheckoutSession);

//stripe webhook
app.post('/webhook', webhook);

//wishlist route
app.use("/wishlist", require("./routes/wishlist"));

//products route
app.use("/products", require("./routes/products"));

//cart route
app.use("/cart", require("./routes/cart"));

//customers route
app.use("/customers", require("./routes/customers"));

//addresses route
app.use("/addresses", require("./routes/addresses"));

//orders route
app.use("/orders", require("./routes/orders"));

//error-handling
app.use((err, req, res, next) => {
    switch(err.message) {
        case 'No product with the specified ID found in the database.':
            res.status(404).json(err.message);
            break;
        case 'Your shopping cart is empty.':
            res.status(404).json(err.message);
            break;
        case 'Customer does not exist in the database.':
            res.status(404).json(err.message);
            break;
        case 'This address is not associated with this customer id.':
            res.status(404).json(err.message);
            break;
        case 'No orders belonging to the specified customer were found in the database.':
            res.status(404).json(err.message);
            break;
        case 'No association of the specified customer ID and order ID exists in the database.':
            res.status(404).json(err.message);
            break;
        case 'An error occurred while trying to get your username.':
            res.status(500).json(err.message);
            break;
        default:
            res.status(500).send(err.message);
    }
});

//display pages correctly when the page is refreshed
app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

//start server
app.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}.`);
});