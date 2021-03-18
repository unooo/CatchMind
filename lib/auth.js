module.exports = {
    isCreater:function(request,response,postMakerId){
        if(request.user.id===postMakerId){
            return true;
        }else{
            return false;
        }
    }
}