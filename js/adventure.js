var Adventures = {};
Adventures.currentAdventure;
Adventures.currentStep;
Adventures.currentUser;
Adventures.nextStep;
Adventures.playerHealth;
Adventures.playerCoins;

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
        Adventures.resetGame();
        return
    }

    if (Adventures.nextStep >= 990) {
        Adventures.victory()
        Adventures.resetGame();
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
    $('.restart').prop("value",Adventures.currentAdventure)
    Adventures.setImage(message["image"]);
    Adventures.updatePlayerStatsDisplay();
};

Adventures.updatePlayerStatsDisplay = function(){
    $("#playerHealth").prop("value", Adventures.playerHealth)
    $("#playerCoins").text(Adventures.playerCoins)
};


Adventures.playerDied = function(){
    Adventures.resetGame();
    $(".situation-text").text("You died because of your bad decisions!")
    Adventures.setImage('dead.jpg');
    //  to not hide all options of adventures
    $(".adventure > .options-list").hide()
    $(".restart-list").show()
    Adventures.updatePlayerStatsDisplay();
};

Adventures.victory = function() {
    Adventures.resetGame();
    $(".situation-text").text("YOU SURVIVED! WELL DONE!")
    Adventures.setImage('victory.jpg');
    //  to not hide all options of adventures
    $(".adventure > .options-list").hide()
    $(".restart-list").show()
    Adventures.updatePlayerStatsDisplay();
};


Adventures.start = function(){
    $(document).ready(function () {
        Adventures.currentAdventure=undefined;
        Adventures.currentUser=undefined;
        Adventures.getStories();
        $("#loading-gif").hide();
        $(".adventure").hide();
        $(".welcome-screen").show();
        Adventures.bindEventHandlers();

    });
};

Adventures.restart = function(){
    Adventures.resetGame();
    Adventures.initAdventure();
}

Adventures.generateAdventureButtons = function(data){
    for (i=0; i < data.length; i++){
        var story = $("<button/>").addClass("btn btn-default btn-lg btn-block adventure-button")
        story.addClass("btn btn-default btn-lg btn-block adventure-button")
        story.attr('id',data[i]['id'])
        story.prop('value',parseInt(data[i]['id']))
        story.prop('disabled',true)
        story.text(data[i]['story_name'])
        story.off('click').on('click',Adventures.initAdventure);
        $("#stories").append(story)
    };
}


Adventures.bindEventHandlers = function(){
    $(".new-game").off('click').on('click',Adventures.start)
    $(".restart").off('click').on('click',Adventures.restartGame),
    $("#nameField").unbind().keyup(Adventures.checkName);
    $(".game-option").off('click').on('click',Adventures.chooseOption);
    $(".save-game").off('click').on('click',Adventures.saveGame);
    $(".restart").off('click').on('click',Adventures.restart);
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
    if (!Adventures.currentAdventure){
    Adventures.currentAdventure = $(this).val()}
    if(!Adventures.currentUser){
    Adventures.currentUser = $("#nameField").val()
    }
    $("#loading-gif").show()
    $.ajax("/start",{
        type: "POST",
        data: {"user": Adventures.currentUser
            ,
            "adventure_id": Adventures.currentAdventure
        },
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            $("#nameField").val('')
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

Adventures.resetGame = function(){
    $.ajax("/reset", {
        type: "POST",
        data: {"user":
            Adventures.currentUser,
            "adventure": Adventures.currentAdventure
        },
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log(data['success'])
        }
    })
}

Adventures.getStories = function(){
    $.ajax("/getStories", {
        type:"GET",
        dataType: "json",
        success: function(data){
            $('.adventure-button').remove()
            Adventures.generateAdventureButtons(data["stories"]);
        }
    })
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

