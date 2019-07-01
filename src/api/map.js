import request from '@/utils/request'

export function  mapCoordinate(addr) {
  return request({
    url: '/map/getCoordinate',
    method: 'post',
    params: {addr}
  })
}

export function  searchcCoordinate(addr) {
  return request({
    url: '/map/searchcCoordinate',
    method: 'post',
    params: {addr}
  })
}


