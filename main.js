calculateStats();
refreshActionButtons();
updateTechnologyButtons();

actionTabButton.addEventListener('click', function (event) {
    actionTab(event, 'actionplace');
});
charTab.addEventListener('click', function (event) {
    actionTab(event, 'charcontent');
});
mapTab.addEventListener('click', function (event) {
    actionTab(event, 'mapcontent');
    if (window.mapView) window.mapView.resize();
    requestAnimationFrame(function () {
        if (window.mapView) window.mapView.resize();
    });
    // Firefox may resolve the new layout one frame later than Chrome.
    setTimeout(function () {
        if (window.mapView) window.mapView.resize();
    }, 0);
});
researchTab.addEventListener('click', function (event) {
    actionTab(event, 'researchplace');
});
habitsTab.addEventListener('click', function (event) {
    actionTab(event, 'habitscontent');
});
craftTab.addEventListener('click', function (event) {
    actionTab(event, 'craftplace');
});
buildTab.addEventListener('click', function (event) {
    actionTab(event, 'buildplace');
});
optionsTab.addEventListener('click', function (event) {
    actionTab(event, 'optionsplace');
});

charContent.style.display = 'none';
mapContent.style.display = 'none';
researchContent.style.display = 'none';
habitsContent.style.display = 'none';
craftContent.style.display = 'none';
buildContent.style.display = 'none';
optionsContent.style.display = 'none';
actionContent.style.display = 'block';
actionTabButton.classList.add('active');
