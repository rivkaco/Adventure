var Adventures = {};
Adventures.currentAdventure;
Adventures.currentStep;
Adventures.currentUser;
Adventures.nextStep;
Adventures.playerHealth;
Adventures.playerCoins;


//TODO: remove for production
Adventures.debugMode = true;
Adventures.DEFAULT_IMG = "./images/choice.jpg";


//Handle Ajax Error, animation error and speech support
Adventures.bindErrorHandlers = function () {
    //Handle ajax error, if the server is not found or experienced an error
    $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
        Adventures.handleServerError(thrownError);
    });

    //Making sure that we don't receive an animation that does not exist
    $("#situation-image").error(function () {
        Adventures.debugPrint("Failed to load img: " + $("#situation-image").attr("src"));
        Adventures.setImage(Adventures.DEFAULT_IMG);
    });
};


//The core function of the app, sends the user's choice and then parses the results to the server and handling the response.
Adventures.chooseOption = function(){
    Adventures.nextStep = $(this).val();
    Adventures.currentStep=$(this).val();
    Adventures.playerHealth+=$(this).data('h-e')
    Adventures.playerCoins+=$(this).data('c-e')

    $.ajax("/story",{
        type: "POST",
        data: {"user": Adventures.currentUser,
            "adventure": Adventures.currentAdventure,
            "next": Adventures.nextStep,
            "health":Adventures.playerHealth,
            "coins":Adventures.playerCoins},
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            $(".greeting-text").hide();
            Adventures.write(data);
        }
    });
};

Adventures.write = function (message) {
    //If statement, check user health-->if health <=0, go to death screen.
    if (Adventures.playerHealth <= 0){
        Adventures.playerDied()
        return
    }
    //Writing new choices and image to screen
    $(".situation-text").text(message["text"]).show();
    for(var i=0;i<message['options'].length;i++){
        var opt = $("#option_" + (i+1));
        opt.text(message['options'][i]['option_text']);
        opt.data('h-e',message['options'][i]['health_effects']);
        opt.data('c-e',message['options'][i]['coin_effects'])
        opt.prop("value", message['options'][i]['next_question']);
    }
    Adventures.setImage(message["image"]);
    Adventures.updatePlayerStatsDisplay();
};

Adventures.updatePlayerStatsDisplay = function(){
    $("#playerHealth").prop("value", Adventures.playerHealth)
    $("#playerCoins").text(Adventures.playerCoins)
};


Adventures.playerDied = function(){
    $(".situation-text").text("You died because of your bad decisions!")
    $(".adventure > .options-list").hide()
    $(".restart-list").show()
    Adventures.setImage('dead.jpg');
    Adventures.updatePlayerStatsDisplay();
}

Adventures.start = function(){
    $(document).ready(function () {
        $("#loading-gif").hide();
        $(".adventure").hide();
        $(".welcome-screen").show();
        Adventures.bindEventHandlers();

    });
};

Adventures.bindEventHandlers = function(){
    $(".new-game").off('click').on('click',Adventures.start)
    $(".restart").off('click').on('click',Adventures.restartGame),
    $("#nameField").unbind().keyup(Adventures.checkName);
    $(".game-option").off('click').on('click',Adventures.chooseOption);
    $(".adventure-button").off('click').on('click',Adventures.initAdventure);
    $(".save-game").off('click').on('click',Adventures.saveGame);
}


//Setting the relevant image according to the server response
Adventures.setImage = function (img_name) {
    $("#situation-image").attr("src", "./images/" + img_name);
};

Adventures.checkName = function(){
    if($(this).val() !== undefined && $(this).val() !== null && $(this).val() !== ""){
        $(".adventure-button").prop("disabled", false);
    }
    else{
        $(".adventure-button").prop("disabled", true);
    }
};

Adventures.initAdventure = function(){
    $("#loading-gif").show()
    $.ajax("/start",{
        type: "POST",
        data: {"user":
            $("#nameField").val(),
            "adventure_id": $(this).val()
        },
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            Adventures.currentUser = data['user']
            Adventures.currentStep = data['current']
            Adventures.currentAdventure = data['adventure']
            Adventures.playerHealth = data['health']
            Adventures.playerCoins =data['coins']
            console.log(data);
            Adventures.write(data);
            $("#loading-gif").hide();
            $(".adventure").show();
            $(".adventure > .options-list").show();
            $(".restart-list").hide();
            $(".welcome-screen").hide();
        }
    });
};

Adventures.saveGame = function(){
    $.ajax("/save",{
        type: "POST",
        data: {"user":
            Adventures.currentUser,
            "adventure": Adventures.currentAdventure,
            "current": Adventures.currentStep,
            "health": Adventures.playerHealth,
            "coins": Adventures.playerCoins
        },
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            alert(data['success'])
        }
    });
}

Adventures.handleServerError = function (errorThrown) {
    Adventures.debugPrint("Server Error: " + errorThrown);
    var actualError = "";
    if (Adventures.debugMode) {
        actualError = " ( " + errorThrown + " ) ";
    }
    Adventures.write("Sorry, there seems to be an error on the server. Let's talk later. " + actualError);

};

Adventures.debugPrint = function (msg) {
    if (Adventures.debugMode) {
        console.log("Adventures DEBUG: " + msg)
    }
};

Adventures.start();

