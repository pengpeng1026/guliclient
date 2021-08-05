import request from '@/utils/request'

export default {
// delete /admin/product/baseTrademark/remove/{id}
// 删除BaseTrademark

// POST /admin/product/baseTrademark/save
// 新增BaseTrademark

// PUT /admin/product/baseTrademark/update
// 修改BaseTrademark

// GET /admin/product/baseTrademark/{page}/{limit}
  getTrademarkList(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  }
}