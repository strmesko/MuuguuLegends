    //clucker actions
    //middle tab selector
    charTab.onclick = function(){
        actionTab(event, 'charcontent')
        logMessage('Character click');
    };
    actionTabButton.onclick = function(){
        actionTab(event, 'actionplace')
        logMessage('actions click');
    };
    mapTab.onclick = function(){
        actionTab(event, 'mapcontent')
        logMessage('map click');
    };
    researchTab.onclick = function(){
        actionTab(event, 'researchplace')
        logMessage('research click');
    };
    habitsTab.onclick = function(){
        actionTab(event, 'habitscontent')
        logMessage('habits click');
    };
    craftTab.onclick = function(){
        actionTab(event, 'craftplace')
        logMessage('craft click');
    };
    buildTab.onclick = function(){
        actionTab(event, 'buildplace')
        logMessage('build click');
    };
    optionsTab.onclick = function(){
        actionTab(event, 'optionsplace')
        logMessage('options click');
    };
    saveSlotButtons.forEach(function(button, index){
        button.onclick = function(){
            saveGame(index + 1);
        };
    });
    loadSlotButtons.forEach(function(button, index){
        button.onclick = function(){
            loadGame(index + 1);
        };
    });
    debugFilterButton.onclick = function(){
        toggleDebugMessages();
    };
    //left tab selector
    resourcesButton.onclick = function(){
        leftActionTab(event, 'resourcetab')
        logMessage('resourceclick');
    };
    skillsButton.onclick = function(){
        leftActionTab(event, 'skillstab')
        logMessage('skillsclick');
    };
    //craft tab selector
    craftcommon.onclick = function(){
        craftSubTab(event, 'commonplace')
        logMessage('commonclick');
    };
    craftfood.onclick = function(){
        craftSubTab(event, 'foodplace')
        logMessage('foodclick');
    };
    crafttools.onclick = function(){
        craftSubTab(event, 'toolsplace')
        logMessage('toolsclick');
    };
    //research tab selector
    researchhabits.onclick = function(){
        researchSubTab(event, 'habitsplace')
        logMessage('habitsclick');
    };
    researchknowledge.onclick = function(){
        researchSubTab(event, 'knowledgeplace')
        logMessage('knowledgeclick');
    };
    //technology selector
    habitlazybasics.onclick = function(){
        tryStartResearch(LAZY_BASICS_TECHNOLOGY);
    };
    habitdietbasics.onclick = function(){
        tryStartResearch(DIET_BASICS_TECHNOLOGY);
    };
    habitharvesttheyummies.onclick = function(){
        tryStartResearch(HARVEST_THE_YUMMIES_TECHNOLOGY);
    };
    habitcozyscience.onclick = function(){
        tryStartResearch(COZY_SCIENCE_TECHNOLOGY);
    };
    habitscientificplans.onclick = function(){
        tryStartResearch(SCIENTIFIC_PLANS_TECHNOLOGY);
    };
    knowledgepotental.onclick = function(){
        tryStartResearch(SKILL_POTENTIAL_TECHNOLOGY);
    };
    knowledgenotsoworthless.onclick = function(){
        tryStartResearch(NOT_SO_WORTHLESS_TECHNOLOGY);
    };



