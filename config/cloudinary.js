var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
cloud_name: 'dwrl5mija', 
api_key: '567142323937582', 
api_secret: '9tQ597Oz1GoxkVqEENRALpxGQQw' 
});
exports.cloud=cloudinary;