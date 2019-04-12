const API_URL = 'http://localhost:3000';

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

Vue.component('review', {
  props: ['reviews'],
  template: `
              <div class="reviewsWrapper container">
                <h2>REVIEWS</h2>
                <div class="review" v-for="reviewItem in reviews">
                  <blockquote>
                    {{ reviewItem.text }}
                  </blockquote>
                  <h5>{{ reviewItem.author }}</h5>
                </div>

                <h4>Add review</h4>
                <form class="addReview" v-if="!message">
                  <input type="text" name="" v-model="author" placeholder="Your name">
                  <textarea name="name" rows="8" cols="80" v-model="text" placeholder="Say something"></textarea>
                  <button type="button" name="button" @click="handleAddReviewClick">Submit</button>
                </form>
                <p v-if="message">{{ message }}</p>
              </div>
            `,
  data: function () {
    return {
      author: null,
      text: null,
      message: null,
    }
  },
  methods: {
    handleAddReviewClick() {
      fetch(API_URL + '/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: this.author, text: this.text }),
      })
        .then(response => response.json())
        .then(serverReviewItem => this.message = 'You comment has been added and is awaiting moderation');
    },
  },
});

const app = new Vue({
  el: '#app',
  data: {
    items: [],
    searchQuery: '',
    cart: [],
    responseCode: null,
    reviews: [],
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

    fetch(API_URL + '/reviews')
      .then(response => response.json())
      .then(reviewItems => this.reviews = reviewItems);
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
