const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    brandWebsite: {
        type: String
    },
    brandName: {
        type: String
    },
    logoofWebsite: {
        type: String
    },
    
    
    brandDescription: {
        type: String
    },
    keywords: {
        type: String
    },
    typography:[],
    themesOfLogo:[]
});





const WebSiteScrap = mongoose.model('WebSiteScrap',urlSchema);


module.exports = {WebSiteScrap}