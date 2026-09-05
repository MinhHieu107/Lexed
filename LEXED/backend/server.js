const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:5173"
}));
const port = process.env.PORT;
app.use(express.json());    
app.use("/examBank", require("./routes/examBankRoutes"))
app.use("/examBank", require("./routes/questionRoutes"))
app.use("/auth", require("./routes/authRoutes"));
app.use("/notes", require("./routes/noteRoutes"));
app.use("/progress", require("./routes/progressRoutes"));
app.use("/flashcardSets", require("./routes/flashcardSetRoutes"));
app.use("/", require("./routes/classRoutes"));
app.listen(port, ()=> {
    console.log(`This is running on port ${port}`)
})


