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
                <div class="review" v-for="reviewItem in approvedReviews">
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
  computed: {
    approvedReviews() {
      return this.reviews.filter(el => el.approved);
    }
  },
  methods: {
    handleAddReviewClick() {
      fetch(API_URL + '/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: this.author, text: this.text, approved: false }),
      })
        .then(response => response.json())
        .then(serverReviewItem => this.message = 'You comment has been added and is awaiting moderation');
    },
  },
});

Vue.component('moderate-reviews', {
  props: ['reviews'],
  template: `
              <div class="reviewModeration container">
                <h2>REVIEW MODERATION</h2>
                <div class="review" v-for="reviewItem in unmoderatedReviews">
                  <blockquote>
                    {{ reviewItem.text }}
                  </blockquote>
                  <h5>{{ reviewItem.author }}</h5>
                  <button type="button" name="button" @click="handleApproveReviewClick(reviewItem)">Approve</button>
                  <button type="button" name="button" @click="handleDeleteReviewClick(reviewItem)">Delete</button>
                </div>
                <p v-if="unmoderatedReviews.length === 0">There are no reviews to moderate</p>
              </div>
            `,
  computed: {
    unmoderatedReviews() {
      return this.reviews.filter(el => !el.approved);
    }
  },
  methods: {
    handleApproveReviewClick(reviewItem) {
      fetch(API_URL + '/reviews/' + reviewItem.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true })
      })
        .then(response => response.json())
        .then(serverReviewItem => {
          this.$emit('onapprove', serverReviewItem);
        });
    },
    handleDeleteReviewClick(reviewItem) {
      fetch(API_URL + '/reviews/' + reviewItem.id, {
        method: 'DELETE',
      })
        .then(() => {
          this.$emit('ondelete', reviewItem);
        });
    },
  }
});

Vue.component('log-in', {
  props: ['authorized'],
  template: `
              <div class="ShippingAddressLogIn">
                <h5>ALREADY REGISTED?</h5>
                <p>Please log in below</p>

                <form>
                  <label for="ShippingAddressLogInEmail">
                    LOGIN<span>*</span>
                  </label>
                  <input id="ShippingAddressLogInEmail" required type="text" name="ShippingAddressLogInEmail" v-model="username">

                  <label for="ShippingAddressLogInPassword">
                    PASSWORD <span>*</span>
                  </label>
                  <input id="ShippingAddressLogInPassword" required type="password" name="ShippingAddressLogInPassword" v-model="password">

                  <p>* Required Fileds</p>
                  <p v-if="wrongData">Wrong login or password</p>

                  <button type="button" name="button" @click="handleLoginCLick">LOG IN</button>

                  <a href="#">Forgot Password ?</a>
                </form>
              </div>
            `,
  data() {
    return {
      username: '',
      password: '',
      wrongData: false,
    }
  },
  methods: {
    handleLoginCLick() {
      fetch(API_URL + '/auth' + '?username=' + this.username + '&password=' + this.password)
        .then(response => response.json())
        .then(users => {
          if (users.length === 0) {
            this.wrongData = true;
          } else {
            this.$emit('onlogin', users[0]);
          }
        });
    }
  }
});

Vue.component('log-out', {
  props: ['authorized'],
  template: `
              <div class="ShippingAddressLogOut">
                <h5>YOU ARE LOGGED IN</h5>
                <p>Press the button below to log out</p>

                <form>
                  <button type="button" name="button" @click="handleLogoutCLick">LOG OUT</button>
                </form>
              </div>
            `,
  methods: {
    handleLogoutCLick() {
      this.$emit('onlogout')
    },
  },
});

Vue.component('register', {
  template: `
              <div class="ShippingAddressRegister">
                <h5>REGISTER</h5>
                <p>Register with us for future convenience</p>

                <form>
                  <label for="ShippingAddressRegisterEmail">
                    LOGIN<span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterEmail" required type="text" name="ShippingAddressLogInEmail" v-model="username">

                  <label for="ShippingAddressRegisterPassword">
                    PASSWORD <span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterPassword" required type="password" name="ShippingAddressLogInPassword" v-model="password">

                  <p>* Required Fileds</p>
                  <p v-if="registerSuccess">You have been successfully registered</p>
                  <p v-if="takenName">This login has already been taken</p>

                  <button type="button" name="button" @click="handleRegisterClick">REGISTER</button>
                </form>
              </div>
            `,
  data() {
    return {
      username: '',
      password: '',
      registerSuccess: false,
      takenName: false,
    }
  },
  methods: {
    handleRegisterClick() {
      this.takenName = false;

      fetch(API_URL + '/auth' + '?username=' + this.username)
        .then(response => response.json())
        .then(users => {
          if (users.length !== 0) {
            this.takenName = true;
          } else {
            this.addNewUser();
          }
        });
    },
    addNewUser() {
      fetch(API_URL + '/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: this.username, password: this.password }),
      })
        .then(response => response.json())
        .then(users => this.registerSuccess = true);
    },
  },
});

Vue.component('change-user-data', {
  props: ['current_user'],
  template: `
              <div class="ShippingAddressChange">
                <h5>CHANGE LOGIN DATA</h5>
                <p>Enter new values in the fields below</p>

                <form>
                  <label for="ShippingAddressRegisterEmail">
                    LOGIN<span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterEmail" required type="text" name="ShippingAddressLogInEmail" v-model="username">

                  <label for="ShippingAddressRegisterPassword">
                    PASSWORD <span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterPassword" required type="password" name="ShippingAddressLogInPassword" v-model="password">

                  <p>* Required Fileds</p>
                  <p v-if="changeSuccess">Login data has been successfully changed</p>

                  <button type="button" name="button" @click="handleChangeUserDataClick">REGISTER</button>
                </form>
              </div>
            `,
  data() {
    return {
      username: '',
      password: '',
      changeSuccess: false,
    }
  },
  methods: {
    handleChangeUserDataClick() {
      this.changeSuccess = false;

      fetch(API_URL + '/auth/' + this.current_user.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...this.current_user, username: this.username, password: this.password }),
      })
        .then(response => response.json())
        .then(user => {
          this.changeSuccess = true;
          this.$emit('ondatachange', user);
        });
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
    authorized: false,
    currentUser: null,
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
            this.cart = this.cart.filter(el => el.id !== cartItem.id);
          });
      }
    },
    handleOnApproveReview(reviewItem) {
      const itemIdx = this.reviews.findIndex(el => el.id === reviewItem.id);
      Vue.set(this.reviews, itemIdx, reviewItem);
    },
    handleOnDeleteReview(reviewItem) {
      this.reviews = this.reviews.filter(el => el.id !== reviewItem.id);
    },
    handleOnLogin(user) {
      this.authorized = true;
      this.currentUser = user;
    },
    handleOnLogout() {
      this.authorized = false;
    },
    handleOnDataChange(user) {
      this.currentUser = user;
    },
  },
});
