(function () {
    function showAdblockMessage() {
        const wrapper = document.getElementById("adb-wrapper");
        if (wrapper) {
            wrapper.style.display = "flex";
        }

        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = "Please disable your Ad-blocker and refresh the page.";
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 5000);
        }
    }

    function checkAdBlock() {
        const bait = document.createElement("div");
        bait.className = "adsbox";
        bait.style.cssText =
            "position:absolute;left:-999px;top:-999px;height:10px;width:10px;";
        document.body.appendChild(bait);

        setTimeout(() => {
            const blocked =
                bait.offsetHeight === 0 ||
                bait.clientHeight === 0 ||
                getComputedStyle(bait).display === "none" ||
                getComputedStyle(bait).visibility === "hidden";

            document.body.removeChild(bait);

            if (blocked) {
                showAdblockMessage();
            }
        }, 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkAdBlock);
    } else {
        checkAdBlock();
    }
})();
