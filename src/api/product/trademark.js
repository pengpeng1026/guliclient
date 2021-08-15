import request from '@/utils/request'

export default {
// delete /admin/product/baseTrademark/remove/{id}
// 删除BaseTrademark
  delete(id){
    return  request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },

// POST /admin/product/baseTrademark/save
// 新增BaseTrademark

// PUT /admin/product/baseTrademark/update
// 修改BaseTrademark
// 以后在添加一个数据的时候，如果是添加，则不需要ID，而如果是修改，则需要ID
  addOrUpdata(trademark){
    if(trademark.id){
      return request.put('/admin/product/baseTrademark/update',trademark)
    }else{
      return request.post('/admin/product/baseTrademark/save',trademark)
    }
  },

// GET /admin/product/baseTrademark/{page}/{limit}
  getTrademarkList(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  },
  // 获取所有的品牌列表
  // /admin/product/baseTrademark/getTrademarkList
  getList(){
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }
}