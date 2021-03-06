MG_GAME_PYRAMID = function ($) {
    return $.extend(MG_GAME_API, {
        wordField:null,
        playOnceMoveOnFinalScreenWaitingTime:15000, // milliseconds
        submitButton:null,
        media:null,
        licence_info:[],
        more_info:null,
        levels:[],
        level:1,
        pass_penalty: 0, // in seconds
        level_step:3,
        words:[],
        sound: {},
        sounds: {},
        /*
         * initialize the game. called from inline script generated by the view
         */
        init: function (options) {
            onResize ();
            var game_assets_uri = $("#game_assets_uri").val();

            MG_GAME_PYRAMID.sounds = {
                fail_sound: game_assets_uri + 'audio/sound_fail.mp3',
                letter_0  : game_assets_uri + 'audio/sound0.mp3',
                letter_1  : game_assets_uri + 'audio/sound1.mp3',
                letter_2  : game_assets_uri + 'audio/sound2.mp3',
                letter_3  : game_assets_uri + 'audio/sound3.mp3',
                letter_4  : game_assets_uri + 'audio/sound4.mp3',
                letter_5  : game_assets_uri + 'audio/sound5.mp3',
                letter_6  : game_assets_uri + 'audio/sound6.mp3',
                letter_7  : game_assets_uri + 'audio/sound7.mp3',
                next_level: game_assets_uri + 'audio/nextlevel.mp3',
                try_again : game_assets_uri + 'audio/tryagain.mp3'
            };

            $.each(MG_GAME_PYRAMID.sounds, function(index, source) {
                MG_GAME_PYRAMID.sound[index] = new Sound(source);
            });

            $(window).resize(function() {
                onResize ();
            });

            $('#countdown').countdown({until: '+2m', layout: '{mnn}{sep}{snn}', onExpiry: MG_GAME_PYRAMID.liftOff});
            var settings = $.extend(options, {
                ongameinit: MG_GAME_PYRAMID.ongameinit
            });
            $("#fieldholder").hide();

            $("#new_image").click(function (event) {
                event.preventDefault();
                $('#countdown').countdown('destroy');
                $('#countdown').countdown({until: '+1s', layout: '{mnn}{sep}{snn}', onExpiry: MG_GAME_PYRAMID.liftOff});
                //location.reload();
            });

            $("footer").click(function () {
                $("input").focus();
            });

            //Sometimes 1st load counter dont starts.
            var int_time = window.setInterval(function() {
                if ($('#countdown').html() == '02:00') {
                    $('#countdown').countdown('destroy');
                    $('#countdown').countdown({until: '+2m', layout: '{mnn}{sep}{snn}', onExpiry: MG_GAME_PYRAMID.liftOff});
                }
                clearTimeout(int_time);
            }, 1000);

            $("#pass").click(function () {
                var periods = $('#countdown').countdown('getTimes');

                var new_period = periods[0] + 'y ';
                new_period+= periods[1] + 'm ';
                new_period+= periods[2] + 'w ';
                new_period+= periods[3] + 'd ';
                new_period+= periods[4] + 'h ';
                new_period+= periods[5] + 'm ';
                new_period+= periods[6] - MG_GAME_PYRAMID.pass_penalty + 's';

                if (MG_GAME_PYRAMID.pass_penalty > 0 && (periods[5]*60 + periods[6]) < (MG_GAME_PYRAMID.pass_penalty + 5)) {
                    // $("#pass").remove();
                    // you can not pass a level its too late!
                } else {
                    $('#countdown').countdown('destroy');

                    $('#countdown').countdown({until: new_period, layout: '{mnn}{sep}{snn}', onExpiry: MG_GAME_PYRAMID.liftOff});

                    // send ajax call as POST request to validate a turn
                    MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid, function (response) {
                        if (MG_API.checkResponse(response)) {
                            MG_GAME_PYRAMID.wordField.val("");
                            MG_GAME_PYRAMID.onresponse(response);
                        }
                        return false;
                    }, {
                        type:'post',
                        data:{ // this is the data needed for the turn
                            turn: 1,
                            played_game_id:MG_GAME_PYRAMID.game.played_game_id,
                            'submissions':[
                                {
                                    media_id:MG_GAME_PYRAMID.media.media_id,
                                    tags: "pass",
                                    pass: true
                                }
                            ]
                        }
                    });

                    var accepted = {
                        level: (MG_GAME_PYRAMID.level + 1),
                        tag: ""
                    };

                    MG_GAME_PYRAMID.levels.push(accepted);
                    MG_GAME_PYRAMID.nextlevel(true);
                    $().toastmessage("showToast", {
                        text: 'Pass!',
                        position: "tops-center",
                        type:"notice",
                        background: "white"
                    });

                    MG_GAME_PYRAMID.playSound('fail_sound');

                }
            });

            $("#container").css("height", $(window).height() - 200);

            MG_GAME_PYRAMID.wordField = $("#word");

            // submit on enter
            MG_GAME_PYRAMID.wordField.focus().keydown(function (event) {
                if (event.keyCode == 13) {
                    MG_GAME_PYRAMID.onsubmit();
                    return false;
                }
            });

            MG_GAME_PYRAMID.submitButton = $("#button-play").click(MG_GAME_PYRAMID.onsubmit);
            // Delete the default footer content.
            $("#footer").html("");
            MG_GAME_API.game_init(settings);

            $("#container").find("footer div").html("4 letters!");
            var num_sound;

            $(":input").not(".input").bind("keydown", function(event) {
                return ((event.which >= 97 && event.which <= 122) || (event.which >= 65 && event.which <= 90) || event.which === 8);
            });

            $(":input").not(".input").bind("keyup change", function(event) {
                var this_input = $(this),
                    str = $("#word").val(),
                    input_length = parseInt(str.length, 10);

                str = str.replace(/[^\w\s]|_/g, "");

                // special chars are forbidden at kb level and the game also complains
                // if the user inputs it.
                // however, just to be safe, strip the special chars if still present
                // forbid: `~!@#$%^&*()_=+{}|<>./?;:[]\",'
                // allowed: -
                str = str.replace(/[`~!@#$%^&*()_=+{}|<>./?;:\[\]\\",']/g, "");
                //console.log(str);

                if (event.keyCode != '13' && event.keyCode != '8' && event.keyCode != '46' && event.keyCode != '32') {
                    //num_sound = (input_length -1) % 8;
                    num_sound = (input_length -1) < 7 ? (input_length -1) : 7; //modified by Jack Guan 13/09/2013


                    if (input_length > MG_GAME_PYRAMID.level  + 3) {
                        MG_GAME_PYRAMID.playSound('fail_sound');

                        /*
                        // this removes extra characters
                        this_input.val(function(index, value){
                            return value.substr(0, value.length-1);
                        });
                        */
                    } else {
                        MG_GAME_PYRAMID.playSound('letter_' + num_sound);
                    }
                }

                return event.which != 32;
            })
        },

        playSound: function (index) {
            MG_GAME_PYRAMID.sound[index].play(MG_GAME_PYRAMID.sounds[index]);
        },
        /*
         * display games turn
         */
        renderTurn: function (response) {
            if(MG_GAME_PYRAMID.level <= 1) {
//                $("#stage").hide();

                $("#image_container").html("");

                var turn_info = {
                    url: response.turn.medias[0].full_size,
                    url_full_size: response.turn.medias[0].full_size,
                    licence_info: MG_GAME_API.parseLicenceInfo(response.turn.licences)
                };

                $("#template-turn").tmpl(turn_info).appendTo($("#image_container")).after(function () {
                    onResize ();
                });

                $("#licences").html("");
                $("#template-licence").tmpl(MG_GAME_PYRAMID.licence_info).appendTo($("#licences"));

                $("#more_info").html("");

                if (MG_GAME_PYRAMID.more_info != null &&
                    MG_GAME_PYRAMID.more_info.hasOwnProperty("url"))
                    $("#template-more-info").tmpl(MG_GAME_PYRAMID.more_info).appendTo($("#more_info"));

                $("a[rel='zoom']").fancybox({overlayColor:'#000'});

                $("#stage").fadeIn(1000, function () {
                    MG_GAME_PYRAMID.busy = false;
                    MG_GAME_PYRAMID.wordField.focus();
                });
            }

            MG_GAME_PYRAMID.wordField.focus();
        },

        /*
         * display the final turn
         */
        renderFinal:function () {
            var matched_words = 0;
            for (var i in MG_GAME_PYRAMID.levels) {
                var level = MG_GAME_PYRAMID.levels[i];
                if (level.tag.tag != undefined) {
                    matched_words++;
                }
            }

            $("#stage").hide();

            $('#game_description').hide();

            $("#fieldholder").hide().html("");

            $("#input_area").html("");
            $("#input_area").hide();

            //  text is "You matched # words with the random people."
            var final_words = {};
            final_words[0] = 'Better luck next time!';
            final_words[1] = 'A good start!';
            final_words[2] = 'You\'re getting warmed up!';
            final_words[3] = 'Pretty Good!';
            final_words[4] = 'Amazing!';
            final_words[5] = 'That\'s awesome!';
            final_words[6] = 'You\'re an expert!';
            final_words[7] = 'That\'s incredible!';
            final_words[8] = 'You\'re on fire!';
            final_words[9] = 'I bow to your greatness!';

            //finalMsg:"You reached " + (MG_GAME_PYRAMID.level+MG_GAME_PYRAMID.level_step -1) + " letters! How far can you go?"
            var final_info = {
                finalMsg: "You matched " + matched_words + " with the random people.",
                finalMsg_2ndline: final_words[matched_words]
            };

            $("#template-final-info").tmpl(final_info).appendTo($("#fieldholder"));
            $("#fieldholder").show();
            $("#gamearea").hide();
            $("#content").find("header").hide();
            $("#content").find("footer").hide();

            var level_info = {
                tag: "",
                width: 0
            }

            var fix = $("#fieldholder");
            for (var i in MG_GAME_PYRAMID.levels) {
                var level = MG_GAME_PYRAMID.levels[i];
                if (level.tag.tag != undefined) {
                    fix.find(".level_" + level.level).html(level.tag.tag);
                    fix.find(".level_" + level.level).removeClass("level_" + level.level).addClass("word_level_" + level.level);
                }
            }

            $("#licences").html("");
            $("#template-licence").tmpl(MG_GAME_PYRAMID.licence_info).appendTo($("#licences"));

            $("#more_info").html("");

            if (MG_GAME_PYRAMID.more_info != null && MG_GAME_PYRAMID.more_info.hasOwnProperty("url"))
                $("#template-more-info").tmpl(MG_GAME_PYRAMID.more_info).appendTo($("#more_info"));


            $("#image_container").html("");
            if (MG_GAME_PYRAMID.game.play_once_and_move_on == 1) {
                var info = {
                    remainingTime:null,
                    play_once_and_move_on_url:null
                };
                info.remainingTime = (MG_GAME_NEXTAG.playOnceMoveOnFinalScreenWaitingTime / 1000);
                info.play_once_and_move_on_url = MG_GAME_NEXTAG.game.play_once_and_move_on_url;

                $("#template-final-info-play-once").tmpl(info).appendTo($("#fieldholder"));
                $("#template-final-summary-play-once").tmpl(info).appendTo($("#image_container"));
                $("#box1").hide();
                window.setTimeout(function () {
                    window.location = info.play_once_and_move_on_url;
                }, MG_GAME_PYRAMID.playOnceMoveOnFinalScreenWaitingTime);

                var updateRemainingTime = function () {
                    MG_GAME_PYRAMID.playOnceMoveOnFinalScreenWaitingTime -= 1000;
                    if (MG_GAME_PYRAMID.playOnceMoveOnFinalScreenWaitingTime >= 1) {
                        $('#remainingTime').text(MG_GAME_PYRAMID.playOnceMoveOnFinalScreenWaitingTime / 1000);
                        window.setTimeout(updateRemainingTime, 1000);
                    }
                }
                window.setTimeout(updateRemainingTime, 1000);
            }

            $("#image_review img").height(($(window).height() - 30 - 89 - 100 - 40) / 2);

            onResize ();

            $("a[rel='zoom']").fancybox({overlayColor:'#000'});

            MG_GAME_API.releaseOnBeforeUnload();

            $("#button-play-again").click(function (event) {
                event.preventDefault();
                MG_GAME_PYRAMID.playSound('next_level');
                location.reload();
            });

            $("#stage").fadeIn(1000, function () {
                MG_GAME_PYRAMID.busy = false;
                MG_GAME_PYRAMID.wordField.focus();
            });
        },

        /*
         * evaluate each response from /api/games/play calls (POST or GET)
         */
        onresponse:function (response) {
            MG_GAME_API.curtain.hide();

            if ($.trim(MG_GAME_PYRAMID.game.more_info_url) != "")
                MG_GAME_PYRAMID.more_info = {url:MG_GAME_PYRAMID.game.more_info_url, name:MG_GAME_PYRAMID.game.name};

            MG_GAME_PYRAMID.media = response.turn.medias[0]

            var accepted = {
                level:1,
                tag:""
            };

            var turn = response.turn;
            for (i_img in turn.tags.user) {
                var media = turn.tags.user[i_img];
                for (i_tag in media) {
                    // PASSING: If we find the passing tag, we just skip it.
                    if (i_tag == MG_GAME_PYRAMID.passStringFiltered) {
                        continue;
                    }
                    var tag = media[i_tag];

                    if (turn.medias[0].tag_accepted) {
                        accepted.level = turn.medias[0].level;
                        accepted.tag = tag;
/*
                        var myArray = ['Our test sample agrees!', "You've guessed it!", 'Your word matched!'];
                        $().toastmessage("showToast", {
                            text: myArray[Math.floor(Math.random() * myArray.length)],
                            position:"tops-center",
                            type:"notice"
                        });
*/
                        MG_GAME_PYRAMID.levels.push(accepted);
                        MG_GAME_PYRAMID.nextlevel(false);
                    } else {
                    		// no match -- feedback
                        var myArray = ['No match. Try again?', "None of the random people said that!", "Sorry, the random people don't agree!"];
                        $().toastmessage("showToast", {
                            text: myArray[Math.floor(Math.random() * myArray.length)],
                            position:"tops-center",
                            type:"notice",
                            background: "red"
                        });
                        MG_GAME_PYRAMID.playSound('fail_sound');
                    }
                }
            }

            if (turn.licences.length) {
                for (licence in turn.licences) { // licences
                    var found = false;
                    for (l_index in MG_GAME_PYRAMID.licence_info) {
                        if (MG_GAME_PYRAMID.licence_info[l_index].id == turn.licences[licence].id) {
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                        MG_GAME_PYRAMID.licence_info.push(turn.licences[licence]);
                }
            }
            MG_GAME_API.renderTurn(response);
        },


        /*
         * on callback for the submit button
         */
        onsubmit:function () {
            if (!MG_GAME_PYRAMID.busy) {
                var tags = $.trim(MG_GAME_PYRAMID.wordField.val());
                if (tags == "") {
                    $().toastmessage("showToast", {
                        text:"<p>Oops! Type something!</p>",
                        position:"tops-center",
                        type:"notice",
                        background: "#F1F1F1"
                    });
                    MG_GAME_PYRAMID.playSound('try_again');

                } else if (tags.length < (MG_GAME_PYRAMID.level + MG_GAME_PYRAMID.level_step)) {
                    $().toastmessage("showToast", {
                        text: "Not enough letters!",//"That wasn't a " + (MG_GAME_PYRAMID.level + MG_GAME_PYRAMID.level_step) + " letters word!",
                        position:"tops-center",
                        type:"notice",
                        background: "#F1F1F1"
                    });
                    MG_GAME_PYRAMID.playSound('try_again');
                }
                else if (tags.length > (MG_GAME_PYRAMID.level + MG_GAME_PYRAMID.level_step)) {
                    $().toastmessage("showToast", {
                        text:"too many letters!",
                        position:"tops-center",
                        type:"notice",
                        background: "#F1F1F1"
                    });
                    MG_GAME_PYRAMID.playSound('try_again');
                }
                // check if these special characters are present, and if present, complain
                // forbid: `~!@#$%^&*()_=+{}|<>./?;:[]\",'
                // TODO: Turn this into a function maybe..
                else if (/[`~!@#$%^&*()_=+{}|<>./?;:\[\]\\",']/g.test(tags)) {
                    $().toastmessage("showToast", {
                        text:"Special characters are not allowed!",
                        position:"tops-center",
                        type:"notice",
                        background: "#F1F1F1"
                    });
                    MG_GAME_PYRAMID.playSound('try_again');
                }
                else if($.inArrayIn(tags, MG_GAME_PYRAMID.words) !== -1){
                    $().toastmessage("showToast", {
                        text:"You already tried that!",
                        position:"tops-center",
                        type:"notice",
                        background: "#F1F1F1"
                    });
                    MG_GAME_PYRAMID.playSound('try_again');
                } else {

                    // everything done here before nlp stuff was introduced
                    function mgApiAction() {
                        MG_GAME_PYRAMID.words.push(tags);
                        // text entered
                        //MG_GAME_API.curtain.show();
                        //MG_GAME_PYRAMID.busy = true;

                        // send ajax call as POST request to validate a turn
                        MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid, function (response) {
                            if (MG_API.checkResponse(response)) {
                                MG_GAME_PYRAMID.wordField.val("");
                                MG_GAME_PYRAMID.onresponse(response);
                            }
                            return false;
                        }, {
                            type:'post',
                            data:{ // this is the data needed for the turn
                                turn: 1,
                                played_game_id: MG_GAME_PYRAMID.game.played_game_id,
                                'submissions':[
                                    {
                                        media_id: MG_GAME_PYRAMID.media.media_id,
                                        pass: false,
                                        tags: tags.toLowerCase()
                                    }
                                ]
                            }
                        });
                    }

                    // ajax call to the nlp api
                    $.ajax({
                        type: "GET",
                        //url: "http://localhost:8139/possible_wordcheck",
                        url: MG_PYRAMID.nlp_api_url + "/possible_wordcheck",
                        timeout: 5000,
                        data: { input: tags },
                        dataType: "json",
                        error: function( o ) {
                            //console.log(o);
                            console.log('error with nlp api, so proceeding with the game');
                            mgApiAction();
                        }
                    }).done(function( o ) {
                        //console.log(o);
                        var is_word = o.response;
                        if (!is_word) {
                            //console.log(tags+' is not a word.');
                            $().toastmessage("showToast", {
                                text:"That's not a word...",
                                position:"tops-center",
                                type:"notice",
                                background: "#F1F1F1"
                            });
                            MG_GAME_PYRAMID.playSound('try_again');
                        }
                        else {
                            //console.log(tags+' could be a word.');
                            //console.log('nlp api call done, result not false so proceeding with game');
                            mgApiAction();
                        }
                    });

                }
            }
            return false;
        },

        /*
         * this method appears to be not used
         */
        submit:function () {
            MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid, function (response) {
                if (MG_API.checkResponse(response)) { // we have to check whether the API returned a HTTP Status 200 but still json.status == "error" response
                    MG_GAME_API.game = $.extend(MG_GAME_API.game, response.game);
                    MG_GAME_API.settings.ongameinit(response);
                }
            });
            return false;
        },

        /*
         * process /api/games/play get request responses
         */
        ongameinit:function (response) {
            MG_GAME_PYRAMID.onresponse(response);
        },

        liftOff:function () {
            MG_GAME_PYRAMID.renderFinal();
        },

        nextlevel:function (skip) {
            MG_GAME_PYRAMID.level++;
            MG_GAME_PYRAMID.wordField.attr("placeholder", "Enter a " + (MG_GAME_PYRAMID.level + MG_GAME_PYRAMID.level_step) + " letter word");
            $("#content").find("footer").removeClass("footer_level_" + MG_GAME_PYRAMID.level -1).addClass("footer_level_" + MG_GAME_PYRAMID.level);
            //$("#content").find("footer").removeClass("level_" + MG_GAME_PYRAMID.level -1).addClass("level_" + MG_GAME_PYRAMID.level);
            $("input#word").removeClass("level_" + MG_GAME_PYRAMID.level -1).addClass("level_" + MG_GAME_PYRAMID.level);
// Comment out. Pass button should be same color, regardless of level
//             $("#pass").removeClass("level_" + MG_GAME_PYRAMID.level -1).addClass("level_" + MG_GAME_PYRAMID.level);

            if (skip !== true) {
                var myArray = ['Awesome!', "Great job! Bet you can't get this one!", 'Nice!', 'Cool!', "One of the random people agrees!"];
                $().toastmessage("showToast", {
                    text: myArray[Math.floor(Math.random() * myArray.length)],
                    position:"tops-center",
                    type:"notice",
                    background: "#ffcc00"
                });
                MG_GAME_PYRAMID.playSound('next_level');
            }
        }
    });
}(jQuery);


/* For the new side panel */
$('#sidepanel #tab').toggle(function () {
    $(this).attr("class", "tab_open");
    $('#sidepanel').animate({'right':0});
}, function () {
    // Question: Why does '-290' work, and '-300' push the arrow too
    // far right?
    $(this).attr("class", "tab_closed");
    $('#sidepanel').animate({'right':-290});
});

function onResize () {
    var max_height,
        gamearea = $("#gamearea");

    //$("#content header div").css("left", 0);
//    $("#input_area input").css("width", $(window).width()-195 );
    //$("#input_area input").css('cssText', "width: " + $(window).width()-150 + "px !important, border: 1px solid pink !important" );
   // $("#content").css("min-height", device_ratio*($(window).height() - ($("#header").outerHeight() + $("#content footer").outerHeight())));

    //$("#container").css("height", device_ratio*($(window).height() - 210));

        max_height = $(window).height() - 34 - $("#content header").outerHeight() - $("#content footer").outerHeight() - parseInt(gamearea.css('padding-top'), 10) - parseInt(gamearea.css('padding-bottom'), 10) - 30;
        if (max_height < 200) max_height = 200;
        $("#image_to_tag").css({'max-height': max_height, 'max-width': $(window).width() - 35});
        $("#gamearea").css("height", max_height);
/*
    } else {
        if ($("body").hasClass("touch_device")) {
            max_height = $(window).height() - $("#header").outerHeight() - $("#content header").outerHeight() - $("#content footer").outerHeight() - parseInt(gamearea.css('padding-top'), 10) - parseInt(gamearea.css('padding-bottom'), 10);
        } else {
            max_height = $(window).height() - $("#content header").outerHeight() - $("#content footer").outerHeight() - parseInt(gamearea.css('padding-top'), 10) - parseInt(gamearea.css('padding-bottom'), 10);
        }
        if (max_height < 200) max_height = 200;
        $("#image_to_tag").css({'max-height': max_height, 'max-width': $(window).width() - 45});
        $("#gamearea").css("height", max_height);
    }
*/

    //$("#content header div").centerHorizontal();
    $("#content header div").css({"width": parseInt($("#input_area").css("width"), 10) + parseInt($("#countdown").outerWidth(), 10) + 30});
    //$("#content header div input").css("border", '1px solid pink');
    $("nav .mm-inner").css('width', $(window).width());
}

(function($){
    $.extend({
        // Case insensative inArray
        inArrayIn: function(elem, arr, i){
            // not looking for a string anyways, use default method
            if (typeof elem !== 'string'){
                return $.inArrayIn.apply(this, arguments);
            }
            // confirm array is populated
            if (arr){
                var len = arr.length;
                i = i ? (i < 0 ? Math.max(0, len + i) : i) : 0;
                elem = elem.toLowerCase();
                for (; i < len; i++){
                    if (i in arr && arr[i].toLowerCase() == elem){
                        return i;
                    }
                }
            }
            // stick with inArray/indexOf and return -1 on no match
            return -1;
        }
    })
})(jQuery);
