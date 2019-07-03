import request from '@/utils/request'

export function login(params) {
  return request({
    url: '/user/login',
    method: 'post',
    params
  })
}

export function faceLogin(params) {
  return request({
    url: 'user/faceLogin',
    method: 'post',
    params,

  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'post',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getFuzzyInfo(query) {
  return request({
    url: '/transaction/fuzzyList',
    method: 'get',
    params: query,
  })
}

export function ClientUserSupervise(params) {
  return request({
    url:'/transaction/ClientUser',
    method:'get',
    params
  })

}
