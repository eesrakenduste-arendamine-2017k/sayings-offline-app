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

            //service workeri käivitus
            this.registerServiceWorker();

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
        },
        registerServiceWorker: function(){
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
                    // Registration was successful
                    console.log('ServiceWorker registration successful: ', registration);

                    Sayings.instance.registerNotifications(registration);
                }, function(err) {
                    // registration failed :(
                    console.log('ServiceWorker registration failed: ', err);
                });
            }
        },
        registerNotifications: function(registration){
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlB64ToUint8Array("BKFG-EYosOmmbOqvtaDMwfxlYnygB7RSzzZ4XsMESHS4kfFD4qqDFY-vBrIGAa6IEkYFEr5GtsWnsc2-g4l-M_o")
            })
            .then(function(subscription) {
                console.log('User is subscribed.');
                console.dir(JSON.stringify(subscription));
            })
            .catch(function(err) {
                console.log('Failed to subscribe the user: ', err);
            });
        }

    }; // Sayings LÕPP

    function urlB64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }


    // kui leht laetud käivitan rakenduse
    window.onload = function(){
        var app = new Sayings();
    };

})();
