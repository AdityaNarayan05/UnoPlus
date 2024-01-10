const mongoose = require("mongoose");
const colors = require('colors');

const URL="mongodb+srv://nlaxmi886:gO2bsTzK66J98KkT@cluster0.fkec4kq.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
        console.log("Database has connected successfully!");
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
    }
}

module.exports = connectDB;

