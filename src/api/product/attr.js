import request from "@/utils/request";

export default {
  // get  /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  // attrInfoList
  // 获取平台属性列表
  attrInfoList(category1Id,category2Id,category3Id){
    return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
  },
  // DELETE /admin/product/deleteAttr/{attrId}
  // deleteAttr
  // 
  deleteAttr(attrId){
    return request.delete(`/admin/product/deleteAttr/${attrId}`)
  },
  // POST /admin/product/saveAttrInfo
  // 添加属性和属性值
  addOrupdataAttr(attrInfo){
    return request.post('/admin/product/saveAttrInfo',attrInfo)
  }
};
