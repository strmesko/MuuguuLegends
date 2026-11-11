function switchTab(evt, tabName, contentClass, tabClass) {
    var i;
    var tabcontent = document.getElementsByClassName(contentClass);
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    var tablinks = document.getElementsByClassName(tabClass);
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    var target = document.getElementById(tabName);
    target.style.display = target.classList.contains("flexplace") ? "flex" : "block";
    evt.currentTarget.className += " active";
}

function actionTab(evt, tabName) {
    switchTab(evt, tabName, "actionplace", "actiontab");
}

function leftActionTab(evt, tabName) {
    switchTab(evt, tabName, "lefttabs", "lefttabs");
}

function craftSubTab(evt, tabName) {
    switchTab(evt, tabName, "craftsubplace", "craftsubplace");
}

function researchSubTab(evt, tabName) {
    switchTab(evt, tabName, "researchsubplace", "researchsub");
}
document.addEventListener('click', function (event) {
    const link = event.target.closest('ul.tree a');
    if (!link) return;

    const parent = link.parentElement;
    if (parent.classList.contains('open')) {
        parent.classList.remove('open');
        parent.querySelectorAll(':scope .open').forEach(function (item) {
            item.classList.remove('open');
        });
    } else {
        parent.classList.add('open');
    }
    event.preventDefault();
});