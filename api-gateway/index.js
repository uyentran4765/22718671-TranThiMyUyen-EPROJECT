const express = require("express");
const httpProxy = require("http-proxy");
const morgan= require("morgan");
const proxy = httpProxy.createProxyServer();
const app = express();
app.use(morgan("tiny"));
// Route requests to the auth service
app.use("/auth", (req, res) => {
  req.url = "/auth" + req.url;
  proxy.web(req, res, { target: "http://uyen_auth_service:3000" });
});

// Route requests to the product service
app.use("/products", (req, res) => {
  req.url = "/products" + req.url;
  proxy.web(req, res, { target: "http://uyen_product_service:3001" });
});
// console.log('sdsdds')
// Route requests to the order service
app.use("/orders", (req, res) => {
  req.url = "/orders" + req.url;
  proxy.web(req, res, { target: "http://uyen_order_service:3002" });
});

// app.use()

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
