var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, requiree: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
)

AuthorSchema
.virtual('name')
.get(function() {
    return this.family_name + ', ' + this.first_name;
})

AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function() {
        return this.date_of_birth ? moment(this.date_of_birth).format("MMMM Do, YYYY") : '';
    })

AuthorSchema
.virtual('date_of_death_formatted')
.get(function() {
    return this.date_of_death ? moment(this.date_of_death).format("MMMM Do, YYYY") : '' ;
})

AuthorSchema
    .virtual('d_o_b_formatted')
    .get(function() {
        return this.date_of_birth ? moment(this.date_of_birth).format("YYYY-MM-DD") : '';
    })

AuthorSchema
.virtual('d_o_d_formatted')
.get(function() {
    return this.date_of_death ? moment(this.date_of_death).format("YYYY-MM-DD") : '' ;
})

AuthorSchema
.virtual('age_or_lifespan')
.get(function() {
    lifeSpan = this.date_of_death.getYear() - this.date_of_birth.getYear()
    switch (this.date_of_death.getMonth() - this.date_of_birth.getMonth() > 0) {
    case true:
        break;
    case false:
        switch (this.date_of_death.getMonth() - this.date_of_birth.getMonth() === 0) {
            case true:
                if (this.date_of_death.getDate() - this.date_of_birth.getDate() < 0) --lifeSpan;
                break;
            case false:
                --lifeSpan;
                break;
        }
        break;
    }
    return lifeSpan;
})

AuthorSchema
.virtual('lifespan')
.get(function() {
    doD = this.date_of_death ? moment(this.date_of_death).format("MMMM Do, YYYY") : '  ';
    doB = this.date_of_birth ? moment(this.date_of_birth).format("MMMM Do, YYYY") : '  ';
    return doB + "-" + doD;
})

AuthorSchema
.virtual('url')
.get(function() {
    return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);