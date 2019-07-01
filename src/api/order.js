import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/order/detail',
    method: 'get',
    params: { id }
  })
}
export function createOrder(params) {
  return request({
    url: '/order/save',
    method: 'post',
    params
  })
}

export function fetchPv(pv) {
  return request({
    url: '/order/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}

export function getAddr_name() {
  return request({
    url:'/order/getAddrName',
    method:'get',
  })
}
