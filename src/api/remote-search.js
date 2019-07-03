import request from '@/utils/request'

export function searchUser(name) {
  return request({
    url: '/search/user',
    method: 'get',
    params: { name }
  })
}

export function transactionList(params) {
  return request({
    url: '/transaction/list',
    method: 'post',
    params
  })
}

  export function showClientUsers() {
    return request({
      url:'/transaction/count',
      method:'get'
    })
  }

