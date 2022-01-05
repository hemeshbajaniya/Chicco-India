try {

    $('#phoneNumber').attr("minlength", "10");
    $('#phoneNumber').attr("maxlength", "10");
    $("#phoneNumber").on("keyup change", function(){
        var mobNum = $(this).val();
        var filter = /^(0|[1-9][0-9]*)$/;

          if (filter.test(mobNum)) {
            if(mobNum.length==10){
                
                $("#checkout-place-order").attr('disabled',false);
                $("#phoneInvalidMessage").css('display','none');
                $("#phoneInvalidMessage").html("");
            
             } else {
                // alert('Please put 10  digit mobile number');
                $("#checkout-place-order").attr('disabled',true);
                $("#phoneInvalidMessage").css('display','block');
               $("#phoneInvalidMessage").html("Please enter valid mobile number");
                return false;
              }
            }
            else { 
                $("#checkout-place-order").attr('disabled',true);
                $("#phoneInvalidMessage").css('display','block');
              $("#phoneInvalidMessage").html("Please enter valid mobile number");
              return false;
           }
    
  });

    
} catch (error) {
    console.log(error);
}