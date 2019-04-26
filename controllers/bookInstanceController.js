var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');

const { body, validationResult} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Status= {
    available: 'Available',
    maintenance: 'Maintenance',
    loaned: 'Loaned',
    reserved: 'Reserved'
}

exports.bookinstance_list = function(req,res, next) {
    
    BookInstance.find()
        .populate('book')
        .select('book title imprint status due_back due_back_formatted')
        .sort([['book', 'ascending']])
        .exec(function (err,list_bookinstances) {
                if (err) { return next (err);}
                res.render('bookinstance_list',{ title: 'Book Instance List', bookinstance_list: list_bookinstances});
        });
};

exports.bookinstance_detail = function(req,res) {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err,bookinstance) {
            if(err) { return next(err);}
            if (bookinstance==null) {
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail',{ title: 'Boo:', bookinstance: bookinstance});
        })
};

exports.bookinstance_create_get = function(req,res, next){
    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err);}
            res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, status: Status});
        });
};

exports.bookinstance_create_post = [
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 2}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),                

    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    (req,res,next) => {

        const errors = validationResult(req);

        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
                Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err);}
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, status: Status, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance});
                });
                return;
        } else {
            bookinstance.save(function (err) {
                if (err) { return next(err);}
                res.redirect(bookinstance.url);
            });
        }
    }
];

exports.bookinstance_update_get = function(req,res, next){
    async.parallel({
        book_list: function(callback) {
            Book.find().exec(callback);
        },
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback);
        }
    }, function(err, result) {
        if (err) {return next(err);}
        res.render('bookinstance_form', {title: 'Update BookInstance', bookinstance: result.bookinstance, book_list: result.book_list, status: Status})
        });    
}

exports.bookinstance_update_post = [
    body('book', 'Book must not be empty').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must not be empty').isLength({min: 1}).trim(),
    body('status', 'Status must not be empty').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').escape(),
    
    
    (req,res,next) => {
        const errors = validationResult(req);

        var bookInstance = new BookInstance( {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            Book.find({}, function(err, result) {
                if (err) { return next(err);}
                for (let i = 0; i < Status.length; i++) {
                    if (this.bookInstance.status == Status[i]) { Status[i].checked='true'}
                };
                for (let i = 0; i < result.book.length; i++) {
                    if (this.bookInstance.book == result.book[i]) { result.book[i].selected='true'}
                };
                res.render('bookinstance_form', { title: 'Update BookInstance', book_list: result.book, status: Status, errors: errors.array()})
            });
        } else {
            BookInstance.findByIdAndUpdate(req.params.id,bookInstance,function(err, result){
                if (err) { return next(err);}
                res.redirect('/catalog/bookinstances');
            });
        }
    }
]

exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, thebookinstance){
            if (err) { return next(err);}
            res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: thebookinstance});
    });
}

exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.params.id, function deleteBookInstance(err){
        if (err) {return next(err);}
        res.redirect('/catalog/bookinstances');
    })

}

