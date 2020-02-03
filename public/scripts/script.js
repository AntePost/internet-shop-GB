const API_URL = 'http://localhost:3000';

Vue.component('cart', {
  props: ['cart'],
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

                <p v-if="cart.length === 0">The cart is empty</p>
              </div>
            `,
  methods: {
    handleRemoveClick(cartItem) {
      this.$emit('ondelete', cartItem);
    }
  }
});

Vue.component('cart-total', {
  props: ['cart'],
  template: `
              <div class="shoppingCartCheckoutBlock">
                <h5>SUB TOTAL &nbsp;&nbsp;&nbsp;&nbsp;\${{ cartTotal }}</h5>
                <h3>GRAND TOTAL &nbsp;&nbsp;&nbsp;&nbsp;<span>\${{ cartTotal }}</span></h3>
                <button type="button" name="button">PROCEED TO CHECKOUT</button>
              </div>
            `,
  computed: {
    cartTotal() {
      return this.cart.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
    }
  },
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
                    NEW LOGIN<span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterEmail" required type="text" name="ShippingAddressLogInEmail" v-model="username">

                  <label for="ShippingAddressRegisterPassword">
                    NEW PASSWORD <span>*</span>
                  </label>
                  <input id="ShippingAddressRegisterPassword" required type="password" name="ShippingAddressLogInPassword" v-model="password">

                  <p>* Required Fileds</p>
                  <p v-if="changeSuccess">Login data has been successfully changed</p>

                  <button type="button" name="button" @click="handleChangeUserDataClick">CHANGE DATA</button>
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

Vue.component('featured-products', {
  props: ['items'],
  template: `
              <div class="featuredFlexContainer">
                <div class="featuredFlexChild" v-for="item in featuredItems">
                  <img :src="item.picSrcMain" alt="product">
                  <div class="featuredProductHover">
                    <button type="button" name="button" @click="handleBuyClick(item)">
                      <span>Add to Cart</span>
                    </button>
                  </div>
                  <div class="featuredProductText">
                    <h3 class="featuredProductName">{{ item.name }}</h3>
                    <h3 class="featuredProductPrice">\${{ item.price }}.00</h3>
                    <h6>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                    </h6>
                  </div>
                </div>
              </div>
            `,
  computed: {
    featuredItems() {
      return this.items.filter(el => el.featured);
    },
  },
  methods: {
    handleBuyClick(item) {
      this.$emit('onbuy', item);
    },
  },
});

Vue.component('also-like-items', {
  props: ['items', 'name_of_item'],
  template: `
              <div class="alsoLikeFlexContainer">
                <div class="alsoLikeFlexChild" v-for="item in alsoLikeItems">
                  <img :src="item.picSrcAlso" alt="product">
                  <div class="alsoLikeProductHover">
                    <button type="button" name="button" @click="handleBuyClick(item)">
                      <span>Add to Cart</span>
                    </button>
                  </div>
                  <div class="alsoLikeProductText">
                    <h3 class="alsoLikeProductName">{{ item.name }}</h3>
                    <h3 class="alsoLikeProductPrice">\${{ item.price }}.00</h3>
                    <h6>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                    </h6>
                  </div>
                </div>
              </div>
            `,
  computed: {
    // Создает массив похожих товаров по названию
    alsoLikeItems() {
      const nameOfItemSplit = this.name_of_item.split(' ');
      let alsoLikeItems = this.items.filter(el => el.name.includes(nameOfItemSplit[0]));
      alsoLikeItems = shuffle(alsoLikeItems);
      alsoLikeItems = alsoLikeItems.slice(0, 4);
      alsoLikeItems = alsoLikeItems.map((el, i) => {
        el.picSrcAlso = `img/alsoLikeProduct${i + 1}.jpg`;
        return el;
      })
      return alsoLikeItems;
    },
  },
  methods: {
    handleBuyClick(item) {
      this.$emit('onbuy', item);
    },
  }
})

const app = new Vue({
  el: '#app',
  data: {
    items: [],
    cart: [],
    reviews: [],
    authorized: false,
    currentUser: null,
  },
  mounted() {
    fetch(API_URL + '/products')
      .then(response => response.json())
      .then(items => {
        this.items = items.map((item, i) => {
          item.picSrcMain = `img/product${i + 1}.jpg`;
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

    // Метод для очистки корзины. Не работает в json-server
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

// Рандомизирует массив (взято из интернета)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
