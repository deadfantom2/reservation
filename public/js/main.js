$(document).ready(function(){
    $('.delete-reservation').on('click',function(e){
        $target = $(e.target);
        var id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/reservations/'+id,
            success: function(response){
                alert('Deleting Reservation');
                window.location.href='/reservations';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});
