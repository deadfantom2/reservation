$(document).ready(function(){
  $('.delete-article').on('click',function(e){
    $target = $(e.target);
    var id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/articles/'+id,
      success: function(response){
        alert('Deleting Article');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});


$(document).ready(function(){
    $('.delete-chambre').on('click',function(e){
        $target = $(e.target);
        var id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/chambres/'+id,
            success: function(response){
                alert('Deleting Chambre');
                window.location.href='/';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});
