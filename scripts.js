(function(){
    "use strict";

    var Sayings = function(){

        // SEE ON SINGLETON PATTERN
        if(Sayings.instance){
            return Sayings.instance;
        }
        Sayings.instance = this;
        
        this.new = true;

        this.sayings_list = [];
        this.isSubscribed = null;

        this.init();
    };

    window.Sayings = Sayings; // Paneme muuutuja külge

    Sayings.prototype = {

        init: function(){

            console.log('Sayings started');

            // laeme vanasõnad failist
            this.getSayings();

            // kuulame seadme liigutamist
            window.addEventListener("devicemotion", this.triggerMotion.bind(this));

        },
        triggerMotion: function(event){
            //console.log(event);
            var x_gravity = event.accelerationIncludingGravity.x;

            // kui liikumine suurem, siis laeme uue ja ootame 1s enne kui uuesti
            if(x_gravity > 10 && this.new){
                this.writeRandomSaying();
                navigator.vibrate(300);

                this.new = false;

                window.setTimeout(function(){
                    Sayings.instance.new = true;
                }, 1000);
            }

        },
        getSayings: function(){

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {

                    console.log('got json from file');
                    Sayings.instance.sayings_list = JSON.parse(this.responseText).sayings;

                    Sayings.instance.writeRandomSaying();
                }
            };
            xhttp.open("GET", "sayings.json", true);
            xhttp.send();

        },
        writeRandomSaying: function(){
            //leia random indeksiga vanasona
            var random_saying = this.sayings_list[parseInt(Math.random()*this.sayings_list.length)];
            document.querySelector("#content").innerHTML = random_saying;
        }
        
    }; // Sayings LÕPP

    // kui leht laetud käivitan rakenduse
    window.onload = function(){
        var app = new Sayings();
    };

})();
