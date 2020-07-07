const moment = require('moment');

module.exports = {
	select: function(selected, options){
        return options.fn(this).replace(new RegExp(' value=\"'+ selected + '\"'), '$&selected="selected"');
    },

	generateTime: (date,format) => {
		return moment(date).format(format);
    },
    
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },

	paginate: function(options){
        let output = '';
        if(options.hash.current === 1){
            output += `<li class="page-item disabled"><a class="page-link">First</a></li>`;
        } else {
            output += `<li class="page-item"><a href="?page=1" class="page-link">First</a></li>`;
        }
        let i = (Number(options.hash.current) > 5 ? Number(options.hash.current) - 4 : 1);
        if(i !== 1){
            output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
        for(; i <= (Number(options.hash.current) + 4) && i <= options.hash.pages; i++){
            if(i === options.hash.current){
                output += `<li class="page-item active"><a class="page-link">${i}</a></li>`;
            } else {
                output += `<li class="page-item "><a href="?page=${i}" class="page-link">${i}</a></li>`;
            }
            if(i === Number(options.hash.current) + 4 && i < options.hash.pages){
                output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
            }
        }
         if(options.hash.current === options.hash.pages) {
             output += `<li class="page-item disabled"><a class="page-link">Last</a></li>`;
         } else {
             output += `<li class="page-item "><a href="?page=${options.hash.pages}" class="page-link">Last</a></li>`;
         }
        return output;
    },

    multiply: (v1,v2) => v1*v2,
    add: (v1,v2) => v1+v2,
    subtract: (v1,v2) => v1-v2,
    divide: (v1,v2) => v1/v2,
    contains: (v1,v2)=>{
        if(v1.includes(v2)){
            return true;
        }
        return false;
    },
};