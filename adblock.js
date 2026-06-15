async function checkAdBlocker() {
    let isBlocked = false;

    try {
        await fetch(
            new Request(
                'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
            ),
            {
                method: 'HEAD',
                mode: 'no-cors'
            }
        );
    } catch (e) {
        isBlocked = true;
    }

    if (isBlocked) {
        document.getElementById('adb-wrapper').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

window.addEventListener('load', () => {
    setTimeout(checkAdBlocker, 1500);
});
