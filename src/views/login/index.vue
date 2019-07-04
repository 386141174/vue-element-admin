<template>
  <div class="login-container" v-title data-title = "天津顺水物流管理-登录">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">
          APS物流综合管理系统
        </h3>
<!--        <lang-select class="set-language" />-->
      </div>

      <el-form-item id="camera" >
        <div class="web-cam" >

          <video ref="videoElem"></video>
        </div>

        <!-- 图像画布 -->
        <canvas ref="canvas" crossorigin="anonymous" v-show="false"></canvas>
      </el-form-item>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          :placeholder="$t('login.username')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>



<!--      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual v-show="false">-->
<!--        <el-form-item prop="password">-->
<!--          <span class="svg-container">-->
<!--            <svg-icon icon-class="password" />-->
<!--          </span>-->
<!--          <el-input-->
<!--            :key="passwordType"-->
<!--            ref="password"-->
<!--            v-model="loginForm.password"-->
<!--            :type="passwordType"-->
<!--            :placeholder="$t('login.password')"-->
<!--            name="password"-->
<!--            tabindex="2"-->
<!--            autocomplete="on"-->
<!--            @keyup.native="checkCapslock"-->
<!--            @blur="capsTooltip = false"-->

<!--          />-->
<!--          <span class="show-pwd" @click="showPwd">-->
<!--            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />-->
<!--          </span>-->
<!--        </el-form-item>-->
<!--      </el-tooltip>-->

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handelFaceLogin">
        {{ $t('login.logIn') }}
      </el-button>

<!--      <div style="position:relative">-->
<!--        <div class="tips">-->
<!--          <span>{{ $t('login.username') }} : admin</span>-->
<!--          <span>{{ $t('login.password') }} : {{ $t('login.any') }}</span>-->
<!--        </div>-->
<!--        <div class="tips">-->
<!--          <span style="margin-right:18px;">-->
<!--            {{ $t('login.username') }} : editor-->
<!--          </span>-->
<!--          <span>{{ $t('login.password') }} : {{ $t('login.any') }}</span>-->
<!--        </div>-->

<!--        <el-button class="thirdparty-button" type="primary" @click="showDialog=true">-->
<!--          {{ $t('login.thirdparty') }}-->
<!--        </el-button>-->
<!--      </div>-->
    </el-form>

<!--    <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog">-->
<!--      {{ $t('login.thirdpartyTips') }}-->
<!--      <br>-->
<!--      <br>-->
<!--      <br>-->
<!--      <social-sign />-->
<!--    </el-dialog>-->
  </div>
</template>

<script>
  import LangSelect from '@/components/LangSelect'
  import SocialSign from './components/SocialSignin'
  import { faceLogin } from '@/api/user'

  export default {
  name: 'Login',
  components: { LangSelect, SocialSign },
  data() {
    const validateUsername = (rule, value, callback) => {
        callback()
    }
    // const validatePassword = (rule, value, callback) => {
    //   if (value.length < 6) {
    //     callback(new Error('密码不能少于6位'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      loginForm: {
        username: '',
        snapData: '',
        // password: '',
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        // password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      canvas: undefined,
      context: undefined,
      video: undefined,
      snap: undefined,
      mediaStreamTrack: undefined,
    }
  },
  // watch: {
  //   $route: {
  //     handler: function(route) {
  //       const query = route.query
  //       if (query)
  //         this.redirect = query.redirect
  //         this.otherQuery = this.getOtherQuery(query)
  //       }
  //     },
  //     immediate: true
  //   }
  // },
  mounted() {
    this.initWebCamera();
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    $(elem){
      return document.querySelector(elem);
    },
    initWebCamera() {
      this.canvas = this.$('canvas')
      this.context = this.canvas.getContext('2d')
      this.video = this.$refs.videoElem
      this.canvas= this.$refs.canvas;
      this.snap = this.$('#snap')

      //打开摄像头
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: true,
        }).then((stream) => {
          this.mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0];
          // video.src = window.URL.createObjectURL(stream);
          this.video.srcObject = stream;
          this.video.play();

        });

      }
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    // showPwd() {
    //   if (this.passwordType === 'password') {
    //     this.passwordType = ''
    //   } else {
    //     this.passwordType = 'password'
    //   }
    //   this.$nextTick(() => {
    //     this.$refs.password.focus()
    //   })
    // },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true

          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('登录失败')
          return false
        }
      })
    },
    handelFaceLogin() {
      // this.$refs.loginForm.validate(valid => {
          this.loading = true;
          this.context.clearRect(0,0,200,150);
          this.context.drawImage(this.video, 0, 0, 200, 150);
          this.canvas.crossOrigin = "Anonymous";
          this.loginForm.snapData = this.canvas.toDataURL('image/jpg');
          // this.getDataUri(this.loginForm.snapData,function(img) {
          //   console.log(img);
          //   this.loginForm.snapData = img;
          // })

          faceLogin(this.loginForm)
            .then(res => {
              if (res.state === 1) {
                console.log(res);
                this.$store.dispatch('user/faceLogin',this.loginForm)
                  .then(() => {
                    this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
                    this.loading = false
                    this.mediaStreamTrack && this.mediaStreamTrack.stop();

                  })
                  .catch(() => {
                    this.loading = false
                  })

              }
              // else {
              //
              //   this.$notify({
              //     title: '警告',
              //     message: '登录失败',
              //     type: 'warning'
              //   });
              // }
              this.loading = false;
            })
            .catch(() => {
              this.loading = false
            })
          // this.$store.dispatch('user/login', this.loginForm)
          //   .then(() => {
          //     this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
          //     this.loading = false
          //   })
          //   .catch(() => {
          //     this.loading = false
          //   })
      // })
    },

    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },


    created() {
      // window.addEventListener('storage', this.afterQRScan)


    },
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
.web-cam {
  border-radius: 250px;
  -webkit-mask-image: -webkit-radial-gradient(circle, white 100%, black 100%);
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  #camera {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    color: #454545;
    border: 0;
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
