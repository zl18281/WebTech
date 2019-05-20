function fetchData() {
    $.ajax({
        data: "",
        url: '/userLoggedIn',
        dataType: 'json',
        cache: true,
        timeout: 10000,
        type: 'get',
        success: function (data) {
            document.getElementById(88).innerText = "USERNAME: " + data.username;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}



