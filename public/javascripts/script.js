
 function addToCart(proId){
     $.ajax({
       url:'/add-to-cart/'+proId,
       method:'get',
       success:(response)=>{
        if(response.status){
          let count=$('#cart-count').html()
          count=parseInt(count)+1
          $("#cart-count").html(count)
        }
         //alert(response)
       },
       error:(error)=>{
        alert(error)
       }
      
     })
   }


  //     function changeQuantity(cartId,proId,count){
  //       let quantity=parseInt(document.getElementById(proId).innerHTML)
  //         count=parseInt
  //      $.ajax({
  //          url:'/change-product-quantity',
  //          data:{
  //              cart:cartId,
  //              product:proId,
  //              count:count,
  //              quantity:quantity
  //          },


  //          method:'post',
  //          success:(response)=>{
  //           if(response.removeProduct)
  //           {
  //               alert("product removed from cart")
  //               location.reload()
  //           }
  //           else{
  //               document.getElementById(proId).innerHTML=quantity+count
  //           }

  //          },
  //          error:(error)=>{
  //            alert(error)
  //          }

  //     })
  // }



   
   
   



   

