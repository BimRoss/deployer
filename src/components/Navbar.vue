<template>
  <div class="nav">
    <!-- NAVIGATION BAR -->
    <nav class="animated fadeInDown level">
      <div class="level-left has-text-centered">
        <img class="logo" src="@/assets/logo.png">
        <img class="banner" src="@/assets/banner.png">
        <p class="version">{{ version }}</p>
      </div>
      <div class="level-right has-text-centered">
        <img class="photo" :src="userImage">
        <button class="button signout is-rounded is-small is-light is-outlined" @click="signOut()">
          <b>Sign Out</b>
        </button>
      </div>
    </nav>
    <!-- NAVIGATION BAR -->
    <!-- MENU BAR -->
    <div class="animated fadeInDown level">
      <div class="level-left">
        <button
          v-if="isAdmin"
          :class="{'menu-item-left': true, 'button': true, 'is-small': true, 'is-outlined': route !== 'install', 'is-dark': true}"
          @click="goTo('install')"
        >Install</button>
        <button
          v-if="isAdmin"
          :class="{'menu-item-left': true, 'button': true, 'is-small': true, 'is-outlined': route !== 'admin', 'is-dark': true}"
          @click="goTo('admin')"
        >Admin</button>
      </div>
    </div>
    <!-- MENU BAR -->
  </div>
</template>

<script>
const firebase = require("firebase");
const { shell } = require("electron");
// const { app } = require("electron").remote;
const _ = require("lodash");

export default {
  name: "Navbar",
  data() {
    return {
      help: false
    };
  },
  methods: {
    launchUrl(url) {
      if (url) {
        shell.openExternal(url);
      }
    },
    goTo(endpoint) {
      this.$router.push(endpoint);
    },
    signOut() {
      firebase.auth().signOut();
    }
  },
  computed: {
    route() {
      return this.$route.name;
    },
    userImage() {
      let user = firebase.auth().currentUser;
      return user ? firebase.auth().currentUser.photoURL : null;
    },
    users() {
      return this.$store.state.Deployer.users;
    },
    installs() {
      return this.$store.state.Deployer.installs;
    },
    userEmail() {
      let user = firebase.auth().currentUser;
      return user ? firebase.auth().currentUser.email : null;
    },
    isAdmin() {
      let user = _.find(this.users, { email: this.userEmail });
      if (user != null) {
        return user.role.includes("admin");
      } else {
        return false;
      }
    },
    version() {
      return process.env.VUE_APP_VERSION;
    }
  }
};
</script>

<style lang="sass" scoped>
  div.nav
    font-family: $font-stack
  nav.level
    height: 50px
    background: $nav-background
  nav.level:not(:last-child)
    margin-bottom: 0px
  img.logo
    height: 30px
    margin-left: 12px
  img.photo
    height: 35px
    border-radius: 50%
  img.banner
    height: 25px
    margin-left: 8px
  span.icon
    cursor: pointer
    margin-left: 8px
    margin-right: -8px
  button.menu-item-left
    margin-left: 4px
    margin-top: -2px
  button.menu-item-right
    margin-left: 4px
    margin-top: -1px
  button.signout
    margin-right: 12px
    margin-left: 12px
  p.version
    font-size: 20px
    padding-left: 4px
    padding-top: 6px
    color: darken($info, 25)
  button.help 
    border: none
</style>
