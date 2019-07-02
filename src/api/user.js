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
    headers: {
      'content-type': 'multipart/form-data',
      'processData':false,
      'cache': false
    }
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
