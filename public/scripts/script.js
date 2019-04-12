const API_URL = 'http://localhost:3000';

/*Vue.component('cart', {
  props: ['cart', 'cart_total'],
  template: `
              <div class="cartWrapper">
                <h3>Cart</h3>
                <div class="cart" v-if="cart.length">
                  <p v-for="cartItem in cart">There is {{ cartItem.quantity }} item of {{ cartItem.name }} in the cart with the price of {{ cartItem.price * cartItem.quantity }} <button @click="handleRemoveClick(cartItem)">Remove</button></p>
                  <p>The sum total of items in the cart - {{ cart_total }}</p>
                </div>
                <span v-if="!cart.length">The cart is empty</span>
              </div>
            `,
  methods: {
    handleRemoveClick(cartItem) {
      this.$emit('ondelete', cartItem);
    }
  }
});*/

Vue.component('cart', {
  props: ['cart', 'cart_total'],
  template: `
              <div class="productGrid container">
                <div class="productGridCell productGridTableHeader">
                  <h3>PRODUCT DETAILS</h3>
                  <h3>UNIT PRICE</h3>
                  <h3>QUANTITY</h3>
                  <h3>SHIPPING</h3>
                  <h3>SUBTOTAL</h3>
                  <h3>ACTION</h3>
                </div>

                <div class="productGridCell productGridTableRow" v-for="cartItem in cart">
                  <div class="productGridDetails first">
                    <h5>{{ cartItem.name }}</h5>
                    <h6>Color: &nbsp;<span>Red</span></h6>
                    <h6>Size: &nbsp;<span>Xll</span></h6>
                  </div>

                  <h5>{{ cartItem.price }}</h5>
                  <input type="number" name="quantity" v-model='cartItem.quantity'>
                  <h5>FREE</h5>
                  <h5>{{ cartItem.price * cartItem.quantity }}</h5>
                  <a href="#" @click.prevent="handleRemoveClick(cartItem)"><i class="fas fa-times-circle"></i></a>
                </div>
              </div>
            `,
  methods: {
    handleRemoveClick(cartItem) {
      this.$emit('ondelete', cartItem);
    }
  }
});

const app = new Vue({
  el: '#app',
  data: {
    items: [],
    searchQuery: '',
    cart: [],
    responseCode: null,
  },
  mounted() {
    fetch(API_URL + '/products')
      .then(response => {
        this.responseCode = response.status;
        return response.json();
      })
      .then(items => {
        this.items = items.map((item, i) => {
          item.picSrc = `img/product${i + 1}.jpg`;
          return item;
        });
      });

    fetch(API_URL + '/cart')
      .then(response => response.json())
      .then(cartItems => this.cart = cartItems);
  },
  computed: {
    filteredItems() {
      const regEx = new RegExp(this.searchQuery, 'i');
      return this.items.filter(item => regEx.test(item.name));
    },
    cartTotal() {
      return this.cart.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
    }
  },
  methods: {
    handleBuyClick(item) {
      const el = this.cart.find(el => el.name === item.name);
      if (el !== undefined) {
        fetch(API_URL + '/cart/' + item.id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: el.quantity + 1 }),
        })
          .then(response => response.json())
          .then(serverCartItem => {
            const itemIdx = this.cart.findIndex(el => el.id === item.id);
            Vue.set(this.cart, itemIdx, serverCartItem);
          });
      } else {
        fetch(API_URL + '/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...item, quantity: 1 }),
        })
          .then(response => response.json())
          .then(serverCartItem => this.cart.push(serverCartItem));
      }
    },

    handleEmptyCartClick() {
      fetch(API_URL + '/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([]),
      })
        .then(() => {
          this.cart = [];
        })
    },

    handleRemoveClick(cartItem) {
      if (cartItem.quantity > 1) {
        fetch(API_URL + '/cart/' + cartItem.id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: cartItem.quantity - 1 }),
        })
          .then(response => response.json())
          .then(serverCartItem => {
            const itemIdx = this.cart.findIndex(el => el.id === cartItem.id);
            Vue.set(this.cart, itemIdx, serverCartItem);
          });
      } else {
        fetch(API_URL + '/cart/' + cartItem.id, {
          method: 'DELETE'
        })
          .then(() => {
            this.cart = this.cart.filter(el => el.id !== cartItem.id)
          });
      }
    }
  },
});
