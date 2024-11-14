const express = require("express");
const app = express();
const db = require("./db");

const port = process.env.PORT || 3000;
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
