console.log("hello 42!");

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceworker.js")
        .then(function (registration) {
            console.log("Service Worker registered with scope:", registration.scope);
            fetch('http://i0.kym-cdn.com/entries/icons/original/000/002/232/bullet_cat.jpg');
        }).catch(function (err) {
        console.log("Service worker registration failed:", err);
    });
}

