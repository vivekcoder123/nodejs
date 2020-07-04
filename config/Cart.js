'use strict';

const config = require('./config');


class Cart {
    static addToCart(product = null, qty = 1, cart) {
        if(!this.inCart(product._id, cart)) {
            let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
            let prod = {
              id: product._id,
              title: product.name,
              price: product.final_price,
              shipping_price: product.shipping_price,
              qty: qty,
              slug:product.slug,
              vendor:product.vendor,
              image: product.images[0],
              formattedPrice: format.format(product.final_price)
            };
            cart.items.push(prod);
            this.calculateTotals(cart);
        }
    }

    static removeFromCart(id = 0, cart) {
        for(let i = 0; i < cart.items.length; i++) {
            let item = cart.items[i];
            if(item.id == id) {
                cart.items.splice(i, 1);
                this.calculateTotals(cart);
            }
        }

    }

    static updateCart(ids = [], qtys = [], cart) {
        let map = [];
        let updated = false;

        ids.forEach(id => {
           qtys.forEach(qty => {
              map.push({
                  id: id,
                  qty: parseInt(qty, 10)
              });
           });
        });
        map.forEach(obj => {
            cart.items.forEach(item => {
               if(item.id === obj.id) {
                   if(obj.qty > 0 && obj.qty !== item.qty) {
                       item.qty = obj.qty;
                       updated = true;
                   }
               }
            });
        });
        if(updated) {
            this.calculateTotals(cart);
        }
    }

    static inCart(productID = 0, cart) {
        let found = false;
        cart.items.forEach(item => {
           if(item.id==productID) {
               found = true;
           }
        });
        return found;
    }

    static calculateTotals(cart) {
        cart.totals = 0.00;
        cart.withoutShippingTotals=0.00;
        cart.items.forEach(item => {
            let price = item.price;
            let qty = item.qty;
            let amount = price * qty;
            cart.withoutShippingTotals+=amount;
            cart.totals += amount+item.shipping_price;
        });
        this.setFormattedTotals(cart);
    }

   static emptyCart(request) {
        
        if(request.session) {
            request.session.cart.items = [];
            request.session.cart.totals = 0.00;
            request.session.cart.formattedTotals = '';
        }


    }

    static updateProductQuantity(productID,qty,cart) {
        cart.items.forEach(item => {
           if(item.id==productID) {
               item.qty=qty;
           }
        });
        this.calculateTotals(cart);
    }

    static setFormattedTotals(cart) {
        let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
        let totals = cart.totals;
        cart.formattedTotals = format.format(totals);
    }

}

module.exports = Cart;