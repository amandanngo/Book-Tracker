const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: String,
    author: String,
    listType: {
        type: String,
        enum: ['want','already','currently']
    },
    cover: String,
    userId: String
})

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
