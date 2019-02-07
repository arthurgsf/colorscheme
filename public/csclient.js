$(document).ready(function (e) {
    $('#upform').on('submit',(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            type:'POST',
            url: $(this).attr('action'),
            data:formData,
            cache:false,
            contentType: false,
            processData: false,
            success:function(response){
                updateColors(response)
            },
            error: function(data){
                console.log("error");
                console.log(data);
            }
        });
    }));
});

function updateColors(colors){
    colors.high.forEach((color, index)=>{
        $('.high'+(index+1)).css('background-color',`rgb(${color})`);
    });
    colors.low.forEach((color, index)=>{
        $('.low'+(index+1)).css('background-color',`rgb(${color})`);
    });
}