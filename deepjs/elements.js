    //retarded js element creation
    let resourcePanel = document.createElement('div');
    let mainMenu = document.createElement('div');
    let logPanel = document.createElement('div');
    let logScroll = document.createElement('div');
    let actionSelector = document.createElement('tab');
    let charTab = document.createElement('button');
    let actionTabButton = document.createElement('button');
    let mapTab = document.createElement('button');
    let researchTab = document.createElement('button');
    let habitsTab = document.createElement('button');
    let craftTab = document.createElement('button')
    let buildTab = document.createElement('button')
    let optionsTab = document.createElement('button')
    let actionContent = document.createElement('div');
    let charContent = document.createElement('div');
    let craftContent = document.createElement('div');
    let buildContent = document.createElement('div');
    let optionsContent = document.createElement('div');
    let saveSlotButtons = [];
    let loadSlotButtons = [];
    let saveSlotLabels = [];
    let debugFilterButton = document.createElement('button');
    let actionText = document.createElement('b2');
    let charState = document.createElement('div');
    let playerNameInput = document.createElement('input');
    let playerLevelText = document.createElement('span');
    let hpBar = document.createElement('div');
    let manaBar = document.createElement('div');
    let staminaBar = document.createElement('div');
    let expBar = document.createElement('div');
    let hpBarText = document.createElement('div');
    let manaBarText = document.createElement('div');
    let staminaBarText = document.createElement('div');
    let expBarText = document.createElement('div');
    let resourcesTab = document.createElement('div');
    let skillsTab = document.createElement('div');
    let leftSelector = document.createElement('div');
    let resourcesButton = document.createElement('button');
    let skillsButton = document.createElement('button'); 
    let mapContent = document.createElement('div');
    let researchContent = document.createElement('div');
    let habitsContent = document.createElement('div');
    let focusPointsDisplay = document.createElement('div');
    //class names for CSS shit, properties and ID
    logPanel.className = "rightbar";
    mainMenu.className = "topic";
    mainMenu.id = "mainmenu";
    mainMenu.innerHTML = "";
    resourcePanel.className = "resbl";
    actionSelector.className = "actionselect";
    charTab.innerHTML = "Inventory";
    researchTab.innerHTML = '<i class="fa fa-flask"></i> Research';
    habitsTab.innerHTML = '<i class="fa fa-leaf"></i> Habits';
    craftTab.innerHTML = "Craft";
    buildTab.innerHTML = "Build";
    actionTabButton.innerHTML = "Action";
    optionsTab.innerHTML = '<i class="fa fa-cog"></i> Options';
    actionContent.innerHTML = "";
    actionContent.className = "actionplace";
    craftContent.className = "actionplace";
    buildContent.className = "actionplace";
    charContent.innerHTML = "";
    charTab.className = "actiontab";
    craftTab.className = "actiontab";
    buildTab.className = "actiontab";
    actionTabButton.className = "actiontab";
    optionsTab.className = "actiontab";
    mapTab.className = "actiontab"
    mapTab.innerHTML = "Map";
    researchTab.className = "actiontab";
    habitsTab.className = "actiontab";
    researchContent.className = "actionplace";
    habitsContent.className = "actionplace habitsplace";
    focusPointsDisplay.className = "focuspoints";
    charContent.className = "actionplace flexplace";
    actionText.ClassName = "actiontext";
    actionText.innerText = "";
    charState.className = "charstate";
    playerNameInput.className = "charactername";
    playerNameInput.id = "charactername";
    playerNameInput.type = "text";
    playerNameInput.value = player.name;
    playerNameInput.setAttribute("aria-label", "Character name");
    playerLevelText.className = "characterlevel";
    playerLevelText.id = "characterlevel";
    playerLevelText.innerText = "lv" + player.lvl;
    hpBar.className = "hpbar";
    manaBar.className = "manabar";
    staminaBar.className = "staminabar";
    expBar.className = "expbar";
    hpBar.innerText = "\200";
    manaBar.innerText = "\200";
    staminaBar.innerText = "\200";
    expBar.innerText = "\200";
    hpBarText.className = "hpbartext";
    manaBarText.className = "manabartext";
    staminaBarText.className = "staminabartext";
    expBarText.className = "expbartext"; 
    leftSelector.className = "leftselector";
    leftSelector.innerText = "";
    resourcesButton.innerText = "resources";
    resourcesButton.className = "restab";
    skillsButton.innerText = "stats&skills";
    skillsButton.className = "restab";
    resourcesTab.className = "lefttabs";
    skillsTab.className = "lefttabs";
    skillsTab.innerText = "whoaskills";
    mapContent.innerHTML = "map";
    mapContent.className = "actionplace";
    optionsContent.className = "actionplace";
    optionsContent.style.display = "none";
    debugFilterButton.innerHTML = '<i class="fa fa-bug"></i> Debug messages: ON';
    debugFilterButton.className = "optionsbutton active";
    debugFilterButton.setAttribute('data-tooltip', 'Show or hide debug messages in the log. Cheat menu: ~');
    //storaeg.className = "res";
     //id
     charTab.id = "chartab";
     actionTabButton.id = "actiontab";
     optionsTab.id = "optionstab";
     mapTab.id = "maptab";
     researchTab.id = "researchtab";
     habitsTab.id = "habitstab";
     habitsContent.id = "habitscontent";
     focusPointsDisplay.id = "focuspoints";
     craftTab.id = "crafttab";
     buildTab.id = "buildtab";
     optionsContent.id = "optionsplace";
     debugFilterButton.id = "debugfilterbutton";
     mapContent.id = "mapcontent";
     researchContent.id = "researchplace";
     //stupidResConstructor('div', 'actionplace', 'map', 'mapplace', 'maptab', "THE MAP! DIRECTLY STOLEN FROM DORA!!!")
    //storaeg.id = "storage";
    charContent.id = "charcontent";
    actionContent.id = "actionplace";
    buildContent.id = "buildplace";
    craftContent.id = "craftplace";
    hpBar.id = "hpbar";    
    hpBarText.id = "hpbartext";        
    manaBar.id = "manabar";
    staminaBar.id = "staminabar";
    expBar.id = "expbar";
    staminaBarText.id = "staminabartext"; 
    manaBarText.id = "manabartext"; 
    expBarText.id = "expbartext";
    resourcesButton.id = "resbutton";
    skillsButton.id = "skillsbutton";
    resourcesTab.id = "resourcetab";
    skillsTab.id = "skillstab";
    logPanel.id = "gamelog";
    logScroll.id = "gamelogscroll";
    logScroll.className = "logscroll";
    //shit appear
    document.body.appendChild(resourcePanel);
    document.body.appendChild(mainMenu);
    // The clock is a separate child of the top status bar, next to the
    // coordinates and buff icons.
    if (typeof renderGameClock === 'function') renderGameClock();
    document.body.appendChild(logPanel);
    logPanel.appendChild(logScroll);
    document.body.appendChild(actionSelector);
    actionSelector.appendChild(actionTabButton);
    actionSelector.appendChild(researchTab);
    actionSelector.appendChild(habitsTab);
    actionSelector.appendChild(mapTab);
    actionSelector.appendChild(charTab);
    actionSelector.appendChild(craftTab);
    actionSelector.appendChild(buildTab);
    actionSelector.appendChild(optionsTab);
    document.body.appendChild(actionContent);
    document.body.appendChild(charContent);
    document.body.appendChild(mapContent);
    document.body.appendChild(researchContent);
    document.body.appendChild(habitsContent);
    habitsContent.appendChild(focusPointsDisplay);
    updateFocusPointsDisplay();
    document.body.appendChild(craftContent);
    document.body.appendChild(buildContent);
    document.body.appendChild(optionsContent);
    for (let slot = 1; slot <= 3; slot++) {
        const saveSlot = document.createElement('div');
        saveSlot.className = 'saveslot';
        saveSlot.id = 'saveslot' + slot;

        const slotLabel = document.createElement('span');
        slotLabel.className = 'saveslotlabel';
        slotLabel.id = 'saveslotlabel' + slot;
        slotLabel.innerText = 'Slot ' + slot + ': empty';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fa fa-floppy-o"></i>';
        saveButton.className = 'optionsbutton';
        saveButton.id = 'savegameslot' + slot;
        saveButton.setAttribute('data-tooltip', 'Save your progress to slot ' + slot + '.');

        const loadButton = document.createElement('button');
        loadButton.innerHTML = '<i class="fa fa-arrow-up"></i>';
        loadButton.className = 'optionsbutton';
        loadButton.id = 'loadgameslot' + slot;
        loadButton.setAttribute('data-tooltip', 'Load your progress from slot ' + slot + '.');

        saveSlot.appendChild(slotLabel);
        saveSlot.appendChild(saveButton);
        saveSlot.appendChild(loadButton);
        optionsContent.appendChild(saveSlot);
        saveSlotLabels.push(slotLabel);
        saveSlotButtons.push(saveButton);
        loadSlotButtons.push(loadButton);
    }
    optionsContent.appendChild(debugFilterButton);
    actionContent.appendChild(actionText);
    resourcePanel.appendChild(charState);
    charState.appendChild(playerNameInput);
    charState.appendChild(playerLevelText);
    playerNameInput.addEventListener("input", function () {
        player.name = playerNameInput.value.trim() || "You";
    });
    playerNameInput.addEventListener("blur", function () {
        if (!player.name) player.name = "You";
        playerNameInput.value = player.name;
    });
    charState.appendChild(hpBar);
    charState.appendChild(manaBar);
    charState.appendChild(staminaBar);
    charState.appendChild(expBar);
    charState.appendChild(hpBarText);
    charState.appendChild(manaBarText);
    charState.appendChild(staminaBarText);
    charState.appendChild(expBarText);
    resourcePanel.appendChild(leftSelector);
    leftSelector.appendChild(resourcesButton);
    leftSelector.appendChild(skillsButton);
    resourcePanel.appendChild(resourcesTab);
    resourcePanel.appendChild(skillsTab);

    
    //retarded resource taebl 
    function createChildElement(elementType, classname, innertext, id, parent, tooltip){
      if (checkExist(id)) return;

      const element = document.createElement(elementType);
      element.className = classname;
      element.innerText = innertext;
      element.id = id;
      document.getElementById(parent).appendChild(element);
      element.setAttribute('data-tooltip', tooltip);
    }
    function checkExist(elementId){
      return document.getElementById(elementId) !== null;
    }
    function decorateResearchNode(buttonId, iconClass, technology){
      const button = document.getElementById(buttonId);
      if (!button) return;

      const labelText = button.textContent;
      button.innerHTML = '';

      const icon = document.createElement('span');
      icon.className = 'research-node-icon';

      const technologyName = technology && technology.name ? technology.name : '';
      const subCategory = technology
        && String(technology.buttonId || '').indexOf('knowledge') === 0
          ? 'Knowledge'
          : 'Habits';
      const normalizedName = typeof normalizeItemImageName === 'function'
        ? normalizeItemImageName(technologyName)
        : String(technologyName).toLowerCase().replace(/[\s_-]+/g, '');

      const iconImage = document.createElement('img');
      iconImage.className = 'research-node-image';
      iconImage.src = 'images/science/' + subCategory + '/' + normalizedName + '.png';
      iconImage.alt = '';
      iconImage.width = 32;
      iconImage.height = 32;
      iconImage.addEventListener('error', function () {
        if (icon.querySelector('i')) return;
        iconImage.remove();
        const iconGlyph = document.createElement('i');
        iconGlyph.className = 'fa ' + iconClass;
        icon.appendChild(iconGlyph);
      });
      icon.appendChild(iconImage);

      const label = document.createElement('span');
      label.className = 'research-node-label';
      label.textContent = labelText;

      button.appendChild(icon);
      button.appendChild(label);

      const level = Number(technology && technology.level);
      button.dataset.level = String(Number.isFinite(level) ? level : 0);
      button.dataset.maxLevel = technology && Number.isFinite(Number(technology.maxLevel))
        ? String(technology.maxLevel)
        : '∞';
    }
    function getResourceCategory(resource){
      const definition = RESOURCE_DEFS[resource.id];
      return definition ? definition.category : null;
    }
    function isFoodResource(resource){
      return getResourceCategory(resource) === RESOURCE_CATEGORIES.Food;
    }
    function isRawResource(resource){
      return getResourceCategory(resource) === RESOURCE_CATEGORIES.Raw;
    }
    function isIntermediateResource(resource){
      return getResourceCategory(resource) === RESOURCE_CATEGORIES.Intermediate;
    }
    function isMushroomResource(resource){
      return !!resource
        && typeof MUSHROOM_RESOURCE_IDS !== 'undefined'
        && MUSHROOM_RESOURCE_IDS.indexOf(resource.id) !== -1;
    }
    function isFruitResource(resource){
      return !!resource
        && typeof FRUIT_RESOURCE_IDS !== 'undefined'
        && FRUIT_RESOURCE_IDS.indexOf(resource.id) !== -1;
    }
    function isNutResource(resource){
      return !!resource
        && typeof NUT_RESOURCE_IDS !== 'undefined'
        && NUT_RESOURCE_IDS.indexOf(resource.id) !== -1;
    }
    function getHerbDefinitionForResource(resource){
      return resource && typeof getHerbDefinition === 'function'
        ? getHerbDefinition(resource.id)
        : null;
    }
    function isHerbResourceEntry(resource){
      return getHerbDefinitionForResource(resource) !== null;
    }
    function isEdibleHerbResource(resource){
      const herb = getHerbDefinitionForResource(resource);
      return !!herb && typeof HERB_USE !== 'undefined' && herb.use === HERB_USE.Edible;
    }
    function isMedicalHerbResource(resource){
      const herb = getHerbDefinitionForResource(resource);
      return !!herb && typeof HERB_USE !== 'undefined' && herb.use === HERB_USE.Medical;
    }
    function isSpiceHerbResource(resource){
      const herb = getHerbDefinitionForResource(resource);
      return !!herb && typeof HERB_USE !== 'undefined' && herb.use === HERB_USE.Spice;
    }
    function isAlchemyHerbResource(resource){
      const herb = getHerbDefinitionForResource(resource);
      return !!herb && typeof HERB_USE !== 'undefined'
        && (herb.use === HERB_USE.Alchemical || herb.use === HERB_USE.Magical);
    }
    function isVegetableFoodResource(resource){
      return !!resource && typeof isVegetableResource === 'function'
        && isVegetableResource(resource.id);
    }
    function isCropFoodResource(resource){
      return !!resource && typeof isCropResource === 'function'
        && isCropResource(resource.id);
    }
    function isFlourFoodResource(resource){
      return !!resource && typeof isFlourResource === 'function'
        && isFlourResource(resource.id);
    }
    function getResourceTree(){
      let tree = document.getElementById('resourcetree');
      if (tree) return tree;

      tree = document.createElement('ul');
      tree.id = 'resourcetree';
      tree.className = 'tree resource-tree';
      resourcesTab.appendChild(tree);
      return tree;
    }
    function ensureResourceBranch(parentId, branchId, label, tooltip){
      const existingBranch = document.getElementById(branchId);
      if (existingBranch) return document.getElementById(branchId + '-items');

      const branch = document.createElement('li');
      branch.id = branchId;
      branch.className = 'resource-branch open';
      branch.setAttribute('data-tooltip', tooltip);

      const link = document.createElement('a');
      link.href = '#';
      link.innerText = label;
      link.setAttribute('data-tooltip', tooltip);

      const items = document.createElement('ul');
      items.id = branchId + '-items';
      items.className = 'resource-items';

      branch.appendChild(link);
      branch.appendChild(items);
      document.getElementById(parentId).appendChild(branch);
      return items;
    }
    function getFoodResourceContainer(resource){
      getResourceTree();
      ensureResourceBranch('resourcetree', 'raw-food', 'raw food', "The gordon says: IT'S A RAW!!!");
      // Fixed branch order under Raw food, regardless of which resources
      // happen to be visible. Empty branches are hidden by the tree updater.
      ensureResourceBranch('raw-food-items', 'berries', 'Berries', 'Mmmmm berries...');
      ensureResourceBranch('raw-food-items', 'mushrooms', 'Mushrooms', 'Edible mushrooms and other forest finds');
      ensureResourceBranch('raw-food-items', 'nuts', 'Nuts', 'Nuts and seeds from nut trees');
      ensureResourceBranch('raw-food-items', 'fruits', 'Fruits', 'Fruits from fruit trees');
      ensureResourceBranch('raw-food-items', 'meat', 'Meat', 'Fresh meat from creatures');
      ensureResourceBranch('raw-food-items', 'jelly', 'Jelly', 'Wobbly edible jelly');
      ensureResourceBranch('raw-food-items', 'food-herbs', 'herbs', 'Edible wild herbs gathered with Forage');

      if (isMushroomResource(resource)) return document.getElementById('mushrooms-items');
      if (isNutResource(resource)) return document.getElementById('nuts-items');
      if (isFruitResource(resource)) return document.getElementById('fruits-items');
      if (resource && resource.id === RESOURCE_IDS.BUG_MEAT) return document.getElementById('meat-items');
      if (resource && resource.id === RESOURCE_IDS.JELLY) return document.getElementById('jelly-items');
      if (isEdibleHerbResource(resource)) return document.getElementById('food-herbs-items');
      return document.getElementById('berries-items');
    }
    function getRawResourceContainer(resource){
      getResourceTree();
      ensureResourceBranch('resourcetree', 'raw-resources', 'raw resources', 'Raw unedible things to find');
      ensureResourceBranch('raw-resources-items', 'nature-resources', 'nature resources', 'Your local treasury from nature');
      ensureResourceBranch('nature-resources-items', 'vegetables', 'Vegetables', 'Vegetables grown in gardens and wild patches');
      ensureResourceBranch('nature-resources-items', 'crops', 'Crops', 'Grain and field crops');
      ensureResourceBranch('raw-resources-items', 'wild-herbs', 'herbs', 'Medical and spice herbs gathered with Forage');
      ensureResourceBranch('wild-herbs-items', 'medicinal-herbs', 'medicinal', 'Healing herbs used by herbalists');
      ensureResourceBranch('wild-herbs-items', 'spice-herbs', 'spices', 'Aromatic herbs for cooking');
      ensureResourceBranch('raw-resources-items', 'raw-meat', 'Meat', 'Raw meat from creatures');

      if (isVegetableFoodResource(resource)) return document.getElementById('vegetables-items');
      if (isCropFoodResource(resource)) return document.getElementById('crops-items');
      if (isMedicalHerbResource(resource)) return document.getElementById('medicinal-herbs-items');
      if (isSpiceHerbResource(resource)) return document.getElementById('spice-herbs-items');
      if (resource && resource.id === RESOURCE_IDS.CHICKEN_MEAT) return document.getElementById('raw-meat-items');
      return document.getElementById('nature-resources-items');
    }
    function getIntermediateResourceContainer(resource){
      getResourceTree();
      ensureResourceBranch('resourcetree', 'intermediate-resources', 'Intermediate', 'Processed and intermediate resources');
      ensureResourceBranch('intermediate-resources-items', 'masonry', 'Masonry', 'Sand, clay and mortar for construction');
      ensureResourceBranch('intermediate-resources-items', 'smithing', 'smithing', 'Heat units and refined metal bars for smithing');
      ensureResourceBranch('intermediate-resources-items', 'cooking', 'Cooking', 'Flour and other cooking intermediates');
      ensureResourceBranch('cooking-items', 'flour', 'Flour', 'Stone-ground flour made with a Big Grinding stone');
      ensureResourceBranch('cooking-items', 'maple', 'Maple', 'Maple sirup from Maple extractors');
      if (resource && resource.id === RESOURCE_IDS.MAPLE_SIRUP) {
        return document.getElementById('maple-items');
      }
      if (isFlourFoodResource(resource)) {
        return document.getElementById('flour-items');
      }
      if (resource && typeof SMITHING_RESOURCE_IDS !== 'undefined'
          && SMITHING_RESOURCE_IDS.indexOf(resource.id) !== -1) {
        return document.getElementById('smithing-items');
      }
      if (resource && resource.id === RESOURCE_IDS.MORTAR) {
        return document.getElementById('masonry-items');
      }
      if (resource && (resource.id === RESOURCE_IDS.SHAFTS
          || resource.id === RESOURCE_IDS.HANDLES
          || resource.id === RESOURCE_IDS.WOODEN_PLANK
          || resource.id === RESOURCE_IDS.WOODEN_BEAMS)) {
        return ensureResourceBranch('intermediate-resources-items', 'carpentry', 'carpentry', 'Shafts, handles, planks, beams and other carpentry materials');
      }
      if (resource && resource.id === RESOURCE_IDS.ASH) {
        return ensureResourceBranch('intermediate-resources-items', 'alchemy', 'alchemy', 'Ash and other alchemical materials');
      }
      ensureResourceBranch('intermediate-resources-items', 'herbs', 'herbs', 'Alchemical and magical herbs gathered with Forage');
      ensureResourceBranch('herbs-items', 'herbs-alchemy', 'alchemy', 'Alchemical and magical herb reagents');
      if (isAlchemyHerbResource(resource)) return document.getElementById('herbs-alchemy-items');
      return ensureResourceBranch('intermediate-resources-items', 'tailoring', 'tailoring', 'Fibers and other tailoring materials');
    }
    function getResourceContainer(resource){
      if (isVegetableFoodResource(resource) || isCropFoodResource(resource)) {
        return getRawResourceContainer(resource);
      }
      if (isFlourFoodResource(resource)) return getIntermediateResourceContainer(resource);
      if (resource && resource.id === RESOURCE_IDS.MAPLE_SIRUP) {
        return getIntermediateResourceContainer(resource);
      }
      if (resource && resource.id === RESOURCE_IDS.CHICKEN_MEAT) {
        return getRawResourceContainer(resource);
      }
      if (isFoodResource(resource)) return getFoodResourceContainer(resource);
      if (isRawResource(resource)) return getRawResourceContainer(resource);
      if (isIntermediateResource(resource)) return getIntermediateResourceContainer(resource);
      return null;
    }
    function getResourceItemId(resource){
      // "Fertile Soil" contains a space, which is not valid in an element id.
      return 'resource-' + String(resource.name).replace(/\s+/g, '-');
    }
    function formatResourceQuality(resource){
      const quality = Number.isFinite(resource.quality)
        ? resource.quality
        : RESOURCE_DEFAULT_QUALITY;
      return round2(quality);
    }
    function renderResource(resource){
      const container = getResourceContainer(resource);
      if (!container) return;

      const itemId = getResourceItemId(resource);
      let item = document.getElementById(itemId);
      if (!item) {
        item = document.createElement('li');
        item.id = itemId;
        item.className = 'resource-item';
        container.appendChild(item);
      }

      let label = item.querySelector('.resource-name');
      if (!label) {
        label = document.createElement('span');
        label.className = 'resource-name';
        item.appendChild(label);
      }
      renderItemImage(item, resource.name);
      label.innerText = resource.name + ' Q' + formatResourceQuality(resource) + ' x:' + round2(resource.amount) + resource.unitType;

      const definition = RESOURCE_DEFS[resource.id];
      const foodLines = [];
      const herb = getHerbDefinitionForResource(resource);
      const plant = typeof getPlantDefinition === 'function'
        ? getPlantDefinition(resource.id)
        : null;
      const herbLines = [];
      if (herb) {
        herbLines.push('Herb: ' + herb.useLabel);
        const biomeNames = typeof getHerbBiomeNames === 'function'
          ? getHerbBiomeNames(herb)
          : [];
        if (biomeNames.length) {
          herbLines.push('Biomes: ' + biomeNames.join(', '));
        }
        herbLines.push(
          'Tile temperature: ' + round2(herb.tempMin)
          + ' .. ' + round2(herb.tempMax)
        );
      }
      if (plant) {
        herbLines.push(plant.kind === 'crop' ? 'Crop' : 'Vegetable');
        const biomeNames = typeof getPlantBiomeNames === 'function'
          ? getPlantBiomeNames(plant)
          : [];
        if (biomeNames.length) {
          herbLines.push('Biomes: ' + biomeNames.join(', '));
        }
        herbLines.push(
          'Tile temperature: ' + round2(plant.tempMin)
          + ' .. ' + round2(plant.tempMax)
        );
        if (plant.humidityMin > -2 || plant.humidityMax < 2) {
          herbLines.push(
            'Tile humidity: ' + round2(plant.humidityMin)
            + ' .. ' + round2(plant.humidityMax)
          );
        }
      }
      const resourceTags = typeof getResourceTags === 'function'
        ? getResourceTags(resource.id)
        : [];
      if (resourceTags.length) {
        herbLines.push('Tags: ' + resourceTags.join(', '));
      }
      if (definition && definition.RestoresHunger) {
        foodLines.push('RestoresHunger: Yes');
        const tastymeter = Number(definition.Tastymeter);
        if (Number.isFinite(tastymeter)) {
          foodLines.push('Tastymeter: ' + round2(tastymeter) + '/10');
        }
        const statName = typeof getFoodStatBindingName === "function"
          ? getFoodStatBindingName(resource.id)
          : null;
        if (statName) {
          const quality = Number.isFinite(resource.quality) && resource.quality > 0
            ? resource.quality
            : RESOURCE_DEFAULT_QUALITY;
          foodLines.push(
            'Restores potential: ' + statName
            + ' (+' + round2(1 + quality / 10) + ' per unit)'
          );
        }
      } else if (herb) {
        const statName = typeof getFoodStatBindingName === "function"
          ? getFoodStatBindingName(resource.id)
          : null;
        if (statName) {
          herbLines.push('Potential affinity: ' + statName);
        }
      }
      item.setAttribute(
        'data-tooltip',
        resource.description
        + (herbLines.length ? '<br>' + herbLines.join('<br>') : '')
        + (foodLines.length ? '<br>' + foodLines.join('<br>') : '')
      );
      item.hidden = false;
    }
    function hideResourceItem(resource){
      const item = document.getElementById(getResourceItemId(resource));
      if (item) item.hidden = true;
    }
    function updateResourceBranchVisibility(branch){
      const items = document.getElementById(branch.id + '-items');
      if (!items) {
        branch.hidden = true;
        return false;
      }

      let hasVisibleItems = false;
      for (const child of items.children) {
        if (child.classList.contains('resource-branch')) {
          const childVisible = updateResourceBranchVisibility(child);
          child.hidden = !childVisible;
          if (childVisible) hasVisibleItems = true;
        } else if (child.classList.contains('resource-item') && !child.hidden) {
          hasVisibleItems = true;
        }
      }
      branch.hidden = !hasVisibleItems;
      return hasVisibleItems;
    }
    function updateResourceTreeVisibility(){
      const tree = getResourceTree();
      for (const branch of tree.children) {
        if (branch.classList.contains('resource-branch')) updateResourceBranchVisibility(branch);
      }
    }
    function renderResourceBranches(){
      getFoodResourceContainer();
      getRawResourceContainer();
      getIntermediateResourceContainer();
    }
    function renderResources(){
      renderResourceBranches();
      for (const resource of Object.values(resources)) {
        if (resource.amount > 0) {
          renderResource(resource);
        } else {
          hideResourceItem(resource);
        }
      }
      updateResourceTreeVisibility();
    }
  renderResources();
//    stupidResConstructor('ul', 'res', 'test', 'testtab', 'rawfoodtab', "WHOA TUULTIP");
    //    stupidResConstructor('ul', 'res', 'test', 'testtab', 'rawfoodtab', "WHOA TUULTIP");



    ////default TIPS
    document.getElementById('actiontab').setAttribute('data-tooltip', 'ACTIONS. take a proper job and change the world here');
    document.getElementById('chartab').setAttribute('data-tooltip', 'Your equipment and inventory.');
    document.getElementById('maptab').setAttribute('data-tooltip', 'THE MAP! DIRECTLY STOLEN FROM DORA!!!');
    document.getElementById('researchtab').setAttribute('data-tooltip', 'Discover new knowledge here');
    document.getElementById('habitstab').setAttribute('data-tooltip', 'Your habits and focus');
    document.getElementById('crafttab').setAttribute('data-tooltip', 'Just make your garbage more complicated here');
    document.getElementById('buildtab').setAttribute('data-tooltip', 'UNABLE TO COMPLY THE BULDING IN PROGRESS. UNABLE TO COMPLY THE BULDING IN PROGRESS. UNABLE TO COMPLY THE BULDING IN PROGRESS. UNABLE TO COMPLY THE BULDING IN PROGRESS. ');
    document.getElementById('optionstab').setAttribute('data-tooltip', 'Save and load your progress.');
    document.getElementById('optionsplace').setAttribute('data-tooltip', 'Game options');
    document.getElementById('resbutton').setAttribute('data-tooltip', 'The palace if your stuff. Sanctuary of garbage');
    document.getElementById('skillsbutton').setAttribute('data-tooltip', 'Faster, Smarter, Stronger...');
    document.getElementById('hpbartext').setAttribute('data-tooltip', 'Your Health status. Not mental Health of course.');
    document.getElementById('manabartext').setAttribute('data-tooltip', 'This shows your spirit fullness... or emptyness.');
    document.getElementById('staminabartext').setAttribute('data-tooltip', 'Try the way to deal with all workforce you have.');
    document.getElementById('expbartext').setAttribute('data-tooltip', 'Just progress it.');
function getSkillGroup(skillName){
    return CORE_STAT_NAMES.includes(skillName) ? "stat" : "skill";
}
function getSkillBarKey(skillName){
    const aliases = {
        Vitality: "vit",
        Perception: "per",
    };
    return aliases[skillName] || String(skillName).toLowerCase();
}
function getSkillGroupIndex(skillGroup){
    return Array.from(skillsTab.children).filter(function (element) {
        return element.dataset.skillGroup === skillGroup;
    }).length;
}
function getSkillBarColorClass(skillGroup, groupIndex){
    if (skillGroup === "stat") {
        return groupIndex % 2 === 0 ? "skillsbar-even" : "skillsbar-odd";
    }
    return groupIndex % 2 === 0 ? "skillsbar-skill-even" : "skillsbar-skill-odd";
}
function ensureSkillsDivider(){
    if (document.getElementById('skillsdivider')) return;

    const divider = document.createElement('div');
    divider.id = 'skillsdivider';
    divider.className = 'skills-divider';
    divider.innerText = '꧁≋⌇〜⋆⌁⤳✧⌁〜〜⌁⤳〜⋆≋⌇꧂';

    const firstSkill = Array.from(skillsTab.children).find(function (element) {
        return element.dataset.skillGroup === "skill";
    });
    skillsTab.insertBefore(divider, firstSkill || null);
}

const SKILL_DISPLAY_NAMES = Object.freeze({
    focus: "Focus",
    meditation: "Meditation",
    tactics: "Tactics",
    anatomy: "Anatomy",
    dodging: "Dodging",
    bullseye: "BullsEye",
    wizardy: "Wizardy",
    alchemy: "Alchemy",
    masonry: "Masonry",
    pottery: "Pottery",
    architecture: "Architecture",
    digging: "Digging",
    lumberjack: "Lumberjack",
    mining: "Mining",
    smithing: "Smithing",
    cooking: "Cooking",
    milling: "Milling",
});

function createSkillBar(skillName){
    const skillKey = getSkillBarKey(skillName);
    if (document.getElementById('skillsplace' + skillKey)) return;
    const displayName = SKILL_DISPLAY_NAMES[skillKey] || skillName;

    const skillPlace = document.createElement('div');
    const skillBarBackground = document.createElement('div');
    const skillBar = document.createElement('div');
    const skillGroup = getSkillGroup(skillKey);
    const groupIndex = getSkillGroupIndex(skillGroup);

    skillBar.className = "statprogressbar";
    skillBarBackground.className = "statprogress";
    skillPlace.className = "skillsbar " + getSkillBarColorClass(skillGroup, groupIndex);
    skillPlace.id = 'skillsplace' + skillKey;
    skillPlace.dataset.skillGroup = skillGroup;
    skillBarBackground.id = 'skillbarback' + skillKey;
    skillBar.id = 'skillbar' + skillKey;
    skillPlace.innerText = displayName;
    skillBar.innerHTML = "\200";
    if (skillGroup === "skill") ensureSkillsDivider();
    skillsTab.appendChild(skillPlace);
    skillPlace.appendChild(skillBarBackground);
    skillBarBackground.appendChild(skillBar);
    // Power sections always stay at the bottom, below every skill.
    moveToolPowersToEnd();
}
function createToolPowerRow(type) {
    const definition = ITEM_TOOL_POWER_TYPES[type];
    if (!definition) return;

    const row = document.createElement('div');
    row.className = 'toolpower-row';
    row.id = 'toolpower-' + type;
    row.setAttribute(
        'data-tooltip',
        'Highest ' + definition.label + ' among your carried and equipped items.'
    );

    const label = document.createElement('span');
    label.className = 'toolpower-label';
    label.innerText = definition.label;

    const value = document.createElement('span');
    value.className = 'toolpower-value';
    value.innerText = '0';

    row.appendChild(label);
    row.appendChild(value);
    skillsTab.appendChild(row);
}

function createToolPowerSection() {
    // Loading a save rebuilds the skills tab, so this function must be safe to
    // call again without duplicating the section.
    if (document.querySelector('.toolpowers-title')) return;

    const title = document.createElement('div');
    title.className = 'toolpowers-title';
    title.innerText = 'Tool powers';
    skillsTab.appendChild(title);

    Object.keys(ITEM_TOOL_POWER_TYPES).forEach(function (type) {
        createToolPowerRow(type);
    });
    moveToolPowersToEnd();
}

function createHousePowerRow(type) {
    const definition = HOUSE_POWER_TYPES[type];
    if (!definition) return;

    const row = document.createElement('div');
    row.className = 'housepower-row';
    row.id = 'housepower-' + type;
    row.setAttribute(
        'data-tooltip',
        'Total ' + definition.label + ' from completed buildings on the current tile.'
    );

    const label = document.createElement('span');
    label.className = 'housepower-label';
    label.innerText = definition.label;

    const value = document.createElement('span');
    value.className = 'housepower-value';
    value.innerText = '0';

    row.appendChild(label);
    row.appendChild(value);
    skillsTab.appendChild(row);
}

function createHousePowerSection() {
    // build.js loads after this file, so the section appears once the house
    // power definitions are available. It must also be safe to rebuild after
    // loading a save.
    if (typeof HOUSE_POWER_TYPES === 'undefined') return false;
    if (document.querySelector('.housepowers-title')) return true;

    const title = document.createElement('div');
    title.className = 'housepowers-title';
    title.innerText = 'House Powers';
    skillsTab.appendChild(title);

    Object.keys(HOUSE_POWER_TYPES).forEach(function (type) {
        createHousePowerRow(type);
    });
    moveToolPowersToEnd();
    return true;
}

// Skill bars are created and appended as skills level up, so the power
// sections can end up above them. Move Tool powers first and House Powers
// immediately after it, below every skill.
function moveToolPowersToEnd() {
    const toolTitle = skillsTab.querySelector('.toolpowers-title');
    const houseTitle = skillsTab.querySelector('.housepowers-title');
    if (!toolTitle && !houseTitle) return;

    const nodes = [];
    if (toolTitle) nodes.push(toolTitle);
    nodes.push.apply(
        nodes,
        Array.prototype.slice.call(skillsTab.querySelectorAll('.toolpower-row'))
    );
    if (houseTitle) nodes.push(houseTitle);
    nodes.push.apply(
        nodes,
        Array.prototype.slice.call(skillsTab.querySelectorAll('.housepower-row'))
    );

    nodes.forEach(function (node) {
        skillsTab.appendChild(node);
    });
}

function updateCharacterPowerGUI() {
    if (typeof HOUSE_POWER_TYPES !== 'undefined' && typeof createHousePowerSection === 'function') {
        createHousePowerSection();
    }

    if (typeof ITEM_TOOL_POWER_TYPES !== 'undefined') {
        Object.keys(ITEM_TOOL_POWER_TYPES).forEach(function (type) {
            const power = typeof getCharacterToolPower === 'function'
                ? getCharacterToolPower(type)
                : 0;
            // round2 is declared in engine.js, which loads after this file.
            const rounded = Math.round((Number(power) || 0) * 100) / 100;

            if (typeof player !== 'undefined' && player) {
                player[type + 'Power'] = rounded;
            }

            const row = document.getElementById('toolpower-' + type);
            if (!row) return;

            const value = row.querySelector('.toolpower-value');
            if (value) value.innerText = rounded;
        });
    }

    if (typeof HOUSE_POWER_TYPES !== 'undefined') {
        Object.keys(HOUSE_POWER_TYPES).forEach(function (type) {
            const power = typeof getCharacterHousePower === 'function'
                ? getCharacterHousePower(type)
                : 0;
            const rounded = Math.round((Number(power) || 0) * 100) / 100;

            if (typeof player !== 'undefined' && player) {
                player[type + 'Power'] = rounded;
            }

            const row = document.getElementById('housepower-' + type);
            if (!row) return;

            const value = row.querySelector('.housepower-value');
            if (value) value.innerText = rounded;
        });
    }
}

createSkillBar("str");
createSkillBar("agi");
createSkillBar("vit");
createSkillBar("per");
createSkillBar("int");
createSkillBar("ins");
createSkillBar("sou");
createSkillBar("luck");
createSkillBar("speed");
createToolPowerSection();
createHousePowerSection();
updateCharacterPowerGUI();
ensureSkillsDivider();
let tooltipElem;

document.onmouseover = function(event) { //tuultip whoa :o
  let target = event.target;

  // Hovering an icon or label inside a button must still show the button's
  // tooltip, so use the nearest ancestor that actually has one.
  const tooltipTarget = target && typeof target.closest === "function"
    ? target.closest("[data-tooltip]")
    : null;
  if (!tooltipTarget) return;

  // if thereis tooltip
  let tooltipHtml = tooltipTarget.dataset.tooltip;
  if (!tooltipHtml) return;

  // create elemunt

  tooltipElem = document.createElement('div');
  tooltipElem.className = 'tooltip';
  tooltipElem.innerHTML = tooltipHtml;
  document.body.append(tooltipElem);

  // default position are top center
  let coords = tooltipTarget.getBoundingClientRect();

  let left = coords.left + (tooltipTarget.offsetWidth - tooltipElem.offsetWidth) / 2;
  if (left < 0) left = 0; // booorder

  let top = coords.top - tooltipElem.offsetHeight - 5;
  if (top < 0) { // show tooltip on bottom if needed
    top = coords.top + tooltipTarget.offsetHeight + 5;
  }

  tooltipElem.style.left = left + 'px';
  tooltipElem.style.top = top + 'px';
};

document.onmouseout = function(e) {

  if (tooltipElem) {
    tooltipElem.remove();
    tooltipElem = null;
  }

};

// --- buff / debuff icons -------------------------------------------------
// Icons live in the bottom-left corner of the top bar with the coordinates.
function getStatusIconsPanel() {
    let panel = document.getElementById('statusicons');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'statusicons';
    panel.className = 'statusicons';
    mainMenu.appendChild(panel);
    return panel;
}

function renderStatusIcons() {
    const panel = getStatusIconsPanel();
    const sleepyStatuses = getActiveSleepynessStatuses();
    const hearthfireStatus = typeof getHearthfireStatus === 'function'
        ? getHearthfireStatus()
        : null;
    const darkStatus = typeof getDarkStatus === 'function'
        ? getDarkStatus()
        : null;
    const hungerStatus = typeof getHungerStatus === 'function'
        ? getHungerStatus()
        : null;
    const wellFedStatus = typeof getWellFedStatus === 'function'
        ? getWellFedStatus()
        : null;
    const catchedColdStatus = typeof getCatchedColdStatus === 'function'
        ? getCatchedColdStatus()
        : null;
    const earthShakingStatus = typeof getEarthShakingStatus === 'function'
        ? getEarthShakingStatus()
        : null;
    const dramaDebuffStatuses = typeof getActiveDramaDebuffStatuses === 'function'
        ? getActiveDramaDebuffStatuses()
        : [];
    const assPoisonStatus = typeof getAssPoisonStatus === 'function'
        ? getAssPoisonStatus()
        : null;
    const statuses = sleepyStatuses.slice();
    if (hearthfireStatus) statuses.push(hearthfireStatus);
    if (darkStatus) statuses.push(darkStatus);
    if (hungerStatus) statuses.push(hungerStatus);
    if (wellFedStatus) statuses.push(wellFedStatus);
    if (catchedColdStatus) statuses.push(catchedColdStatus);
    if (earthShakingStatus) statuses.push(earthShakingStatus);
    if (assPoisonStatus) statuses.push(assPoisonStatus);
    statuses.push.apply(statuses, dramaDebuffStatuses);

    const key = statuses.map(function (status) {
        return status.id + (status.stacks != null ? ':' + round2(status.stacks) : '');
    }).join('|');

    // Rebuild only when the set of active statuses changes.
    if (panel.dataset.statusKey !== key) {
        panel.dataset.statusKey = key;
        panel.innerHTML = '';

        statuses.forEach(function (status) {
            const icon = document.createElement('span');
            icon.className = 'statusicon statusicon-' + status.kind
                + ' statusicon-' + status.id;
            icon.dataset.statusId = status.id;
            icon.style.color = status.color;

            const glyph = document.createElement('i');
            glyph.className = 'fa ' + (status.icon || SLEEPYNESS_STATUS_ICON);
            glyph.setAttribute('aria-hidden', 'true');
            icon.appendChild(glyph);

            panel.appendChild(icon);
        });
    }

    // The tooltip always shows the live value, even without a rebuild.
    const sleepyness = round2((player && Number(player.sleepyness)) || 0);
    Array.prototype.forEach.call(panel.children, function (icon) {
        if (icon.dataset.statusId === 'dark') {
            const status = typeof getDarkStatus === 'function'
                ? getDarkStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'hearthfire') {
            const status = typeof getHearthfireStatus === 'function'
                ? getHearthfireStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'hungry'
            || icon.dataset.statusId === 'very-hungry'
            || icon.dataset.statusId === 'starving') {
            const status = typeof getHungerStatus === 'function'
                ? getHungerStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'well-fed') {
            const status = typeof getWellFedStatus === 'function'
                ? getWellFedStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'catched-cold') {
            const status = typeof getCatchedColdStatus === 'function'
                ? getCatchedColdStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'earth-shaking') {
            const status = typeof getEarthShakingStatus === 'function'
                ? getEarthShakingStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        if (icon.dataset.statusId === 'ass-poison') {
            const status = typeof getAssPoisonStatus === 'function'
                ? getAssPoisonStatus()
                : null;
            if (status) icon.setAttribute('data-tooltip', status.tooltip);
            return;
        }

        const dramaStatus = typeof getDramaDebuffStatusById === 'function'
            ? getDramaDebuffStatusById(icon.dataset.statusId)
            : null;
        if (dramaStatus) {
            icon.setAttribute('data-tooltip', dramaStatus.tooltip);
            return;
        }

        const status = SLEEPYNESS_STATUSES.find(function (entry) {
            return entry.id === icon.dataset.statusId;
        });
        if (!status) return;

        const lines = [
            '<b>' + status.name + '</b>',
            (status.showAbove ? 'Appears above ' : 'Appears below ')
                + status.threshold + ' sleepyness.',
        ].concat(getSleepynessEffectDescriptions(status));
        lines.push('Sleepyness: ' + sleepyness + '/' + SLEEPYNESS_LIMIT);

        icon.setAttribute('data-tooltip', lines.join('<br>'));
    });
}
  // equipment slots and separate inventory grid
  createChildElement('div', 'equipDisplay', '', 'quipdisplay', 'charcontent', 'Equipment slots. Dress your character.');
  createChildElement('div', 'inventoryPlace', '', 'inventoryPlace', 'charcontent', 'Your inventory. Resources are stored separately.');

  function renderEquipmentSlots() {
    const display = document.getElementById('quipdisplay');
    if (!display) return;

    display.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'equipheader';
    header.innerText = 'quip your char duud';
    display.appendChild(header);

    EQUIPMENT_SLOT_GROUPS.forEach(function (group) {
      const groupElement = document.createElement('div');
      groupElement.className = 'equipgroup collapsible';
      groupElement.dataset.groupId = group.id;

      if (group.id === 'pounch') {
        groupElement.classList.add('pounchgroup');
      }

      const title = document.createElement('div');
      title.className = 'equipgrouptitle';
      title.innerText = group.name;
      title.classList.add('collapsible');
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', 'true');
      title.dataset.tooltip = 'Click to hide ' + group.name + ' section.';

      const setGroupCollapsed = function (collapsed) {
        groupElement.classList.toggle('collapsed', collapsed);
        title.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        title.dataset.tooltip = (collapsed ? 'Click to show ' : 'Click to hide ')
          + group.name + ' section.';
      };

      title.addEventListener('click', function () {
        setGroupCollapsed(!groupElement.classList.contains('collapsed'));
      });

      title.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
        event.preventDefault();
        setGroupCollapsed(!groupElement.classList.contains('collapsed'));
      });

      groupElement.appendChild(title);

      const slots = document.createElement('div');
      slots.id = 'equipgroup-slots-' + group.id;
      title.setAttribute('aria-controls', slots.id);
      if (group.id === 'rings') {
        slots.className = 'equipgrid ringgrid';
      } else if (group.id === 'arms') {
        slots.className = 'equipgrid armgrid';
      } else if (group.id === 'pounch') {
        slots.className = 'equipgrid pounchgrid';
      } else {
        slots.className = 'equipgrid';
      }

      group.slots.forEach(function (slot) {
        const slotElement = document.createElement('div');
        slotElement.className = 'equipslot';
        slotElement.id = 'equipslot-' + slot.id;
        slotElement.dataset.slot = slot.id;
        slotElement.dataset.label = slot.label;
        slotElement.dataset.description = slot.description || '';
        slotElement.setAttribute(
          'data-tooltip',
          slot.label + ': empty' + (slot.description ? '<br><i>' + slot.description + '</i>' : '')
        );

        const label = document.createElement('span');
        label.className = 'equipslotlabel';
        label.innerText = slot.label;
        slotElement.appendChild(label);

        slots.appendChild(slotElement);

        if (!Object.prototype.hasOwnProperty.call(player.equipment, slot.id)) {
          player.equipment[slot.id] = null;
        }
      });

      groupElement.appendChild(slots);
      display.appendChild(groupElement);
    });
  }

  renderEquipmentSlots();
  renderEquipmentItems();
  if (typeof updatePounchSlotVisibility === "function") updatePounchSlotVisibility();

  // Inventory grid is synced by renderInventorySlots so Leaf Belt rarity
  // bonuses can add or remove visible slots at runtime.
  renderInventorySlots();
    // subtabs for crafting 
    createChildElement('button', 'craftsub', 'common', 'craftcommon', 'craftplace', 'Just a common junk to craft');
    createChildElement('button', 'craftsub', 'food', 'craftfood', 'craftplace', 'Fuel for your infinite entropy');
    createChildElement('button', 'craftsub', 'tools', 'crafttools', 'craftplace', 'First step for civilization');
    createChildElement('button', 'craftsub', 'Cultery', 'craftcultery', 'craftplace', 'Wooden cutlery and tableware');
    createChildElement('div', 'craftsubplace', '', 'commonplace', 'craftplace', '');
    // crafting panels are built by deepjs/craft.js
    createChildElement('div', 'craftsubplace', 'food', 'foodplace', 'craftplace', '');
    createChildElement('div', 'craftsubplace', 'tools', 'toolsplace', 'craftplace', '');
    createChildElement('div', 'craftsubplace', 'cultery', 'culteryplace', 'craftplace', '');
    // subtabs for research
    createChildElement('button', 'researchsub', 'Habits', 'researchhabits', 'researchplace', 'Your little quirks and habits');
    createChildElement('button', 'researchsub', 'Knowledge', 'researchknowledge', 'researchplace', 'Knowledge and self-improvement');
    createChildElement('div', 'researchsubplace', '', 'habitsplace', 'researchplace', '');
    createChildElement('ul', 'tree habit-tree', '', 'habitstree', 'habitsplace', '');
    createChildElement('li', 'habit-node open', '', 'habitlazybasicsnode', 'habitstree', '');
    createChildElement('button', 'habit-skill', LAZY_BASICS_TECHNOLOGY.name, 'habitlazybasics', 'habitlazybasicsnode', LAZY_BASICS_TECHNOLOGY.getDescription());
    decorateResearchNode('habitlazybasics', 'fa-bed', LAZY_BASICS_TECHNOLOGY);
    createChildElement('ul', 'habit-children', '', 'habitlazybasicschildren', 'habitlazybasicsnode', '');
    createChildElement('li', 'habit-node open', '', 'habitdietbasicsnode', 'habitlazybasicschildren', '');
    createChildElement('button', 'habit-skill', DIET_BASICS_TECHNOLOGY.name, 'habitdietbasics', 'habitdietbasicsnode', DIET_BASICS_TECHNOLOGY.getDescription());
    decorateResearchNode('habitdietbasics', 'fa-cutlery', DIET_BASICS_TECHNOLOGY);
    createChildElement('ul', 'habit-children', '', 'habitdietbasicschildren', 'habitdietbasicsnode', '');
    createChildElement('li', 'habit-node', '', 'habitharvesttheyummiesnode', 'habitdietbasicschildren', '');
    createChildElement('button', 'habit-skill', HARVEST_THE_YUMMIES_TECHNOLOGY.name, 'habitharvesttheyummies', 'habitharvesttheyummiesnode', HARVEST_THE_YUMMIES_TECHNOLOGY.getDescription());
    decorateResearchNode('habitharvesttheyummies', 'fa-tree', HARVEST_THE_YUMMIES_TECHNOLOGY);
    createChildElement('li', 'habit-node open', '', 'habitcozysciencenode', 'habitlazybasicschildren', '');
    createChildElement('button', 'habit-skill', COZY_SCIENCE_TECHNOLOGY.name, 'habitcozyscience', 'habitcozysciencenode', COZY_SCIENCE_TECHNOLOGY.getDescription());
    decorateResearchNode('habitcozyscience', 'fa-coffee', COZY_SCIENCE_TECHNOLOGY);
    createChildElement('ul', 'habit-children', '', 'habitcozysciencechildren', 'habitcozysciencenode', '');
    createChildElement('li', 'habit-node', '', 'habitscientificplansnode', 'habitcozysciencechildren', '');
    createChildElement('button', 'habit-skill', SCIENTIFIC_PLANS_TECHNOLOGY.name, 'habitscientificplans', 'habitscientificplansnode', SCIENTIFIC_PLANS_TECHNOLOGY.getDescription());
    decorateResearchNode('habitscientificplans', 'fa-list-ol', SCIENTIFIC_PLANS_TECHNOLOGY);
    createChildElement('div', 'researchsubplace', '', 'knowledgeplace', 'researchplace', '');
    createChildElement('ul', 'tree habit-tree', '', 'knowledgetree', 'knowledgeplace', '');
    createChildElement('li', 'habit-node open', '', 'knowledgepotentialnode', 'knowledgetree', '');
    createChildElement('button', 'habit-skill', SKILL_POTENTIAL_TECHNOLOGY.name, SKILL_POTENTIAL_TECHNOLOGY.buttonId, 'knowledgepotentialnode', SKILL_POTENTIAL_TECHNOLOGY.getDescription());
    decorateResearchNode(SKILL_POTENTIAL_TECHNOLOGY.buttonId, 'fa-graduation-cap', SKILL_POTENTIAL_TECHNOLOGY);
    createChildElement('ul', 'habit-children', '', 'knowledgepotentialchildren', 'knowledgepotentialnode', '');
    createChildElement('li', 'habit-node open', '', 'knowledgenotsoworthlessnode', 'knowledgepotentialchildren', '');
    createChildElement('button', 'habit-skill', NOT_SO_WORTHLESS_TECHNOLOGY.name, NOT_SO_WORTHLESS_TECHNOLOGY.buttonId, 'knowledgenotsoworthlessnode', NOT_SO_WORTHLESS_TECHNOLOGY.getDescription());
    decorateResearchNode(NOT_SO_WORTHLESS_TECHNOLOGY.buttonId, 'fa-heartbeat', NOT_SO_WORTHLESS_TECHNOLOGY);
    document.getElementById('researchhabits').classList.add('active');
    document.getElementById('habitsplace').style.display = 'block';


    function updateHabitToggles(){
        Object.keys(habitToggles).forEach(function (habitId) {
            const input = document.getElementById('habittoggle-' + habitId);
            if (input) input.checked = habitToggles[habitId] === true;
        });
        updateHabitSettings();
    }

    function getHabitTechnology(habit) {
        if (habit.requiredTechnology === "cozyScience") {
            return typeof COZY_SCIENCE_TECHNOLOGY === "undefined" ? null : COZY_SCIENCE_TECHNOLOGY;
        }
        if (habit.requiredTechnology === "dietBasics") {
            return typeof DIET_BASICS_TECHNOLOGY === "undefined" ? null : DIET_BASICS_TECHNOLOGY;
        }
        if (habit.requiredTechnology === "harvestTheYummies") {
            return typeof HARVEST_THE_YUMMIES_TECHNOLOGY === "undefined" ? null : HARVEST_THE_YUMMIES_TECHNOLOGY;
        }
        return typeof LAZY_BASICS_TECHNOLOGY === "undefined" ? null : LAZY_BASICS_TECHNOLOGY;
    }

    function updateHabitSettings() {
        const threshold = document.getElementById('habitsetting-dietAutoEatThreshold');
        if (threshold) {
            threshold.value = getDietAutoEatThresholdPercent();
            const valueLabel = document.getElementById('habitsettingvalue-dietAutoEatThreshold');
            if (valueLabel) valueLabel.innerText = threshold.value + '%';
        }

        const priority = document.getElementById('habitsetting-dietPriorityStat');
        if (priority) {
            priority.value = getDietPriorityStat() || '';
        }

        const harvestPriority = document.getElementById('habitsetting-harvestTreePriorityStat');
        if (harvestPriority) {
            harvestPriority.value = getHarvestTreePriorityStat() || '';
        }
    }

    function updateHabitVisibility(){
        HABIT_CATEGORIES.forEach(function (category) {
            const categoryElement = document.getElementById('habitcategory-' + category.id);
            if (!categoryElement) return;

            let hasVisibleHabit = false;
            category.habits.forEach(function (habit) {
                const item = document.getElementById('habititem-' + habit.id);
                if (!item) return;

                const technology = getHabitTechnology(habit);
                const technologyLevel = technology ? technology.level : 0;

                const visible = technologyLevel >= habit.requiredLevel;
                item.hidden = !visible;
                if (visible) hasVisibleHabit = true;
            });
            categoryElement.hidden = !hasVisibleHabit;
        });
    }

    function renderHabitCategories(){
        const content = document.getElementById('habitscontent');
        if (!content) return;

        let container = document.getElementById('habitcategories');
        if (!container) {
            container = document.createElement('div');
            container.id = 'habitcategories';
            container.className = 'habitcategories';
            content.appendChild(container);
        }
        container.innerHTML = '';

        HABIT_CATEGORIES.forEach(function (category) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'habitcategory';
            categoryElement.id = 'habitcategory-' + category.id;

            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'habitcategorytitle';
            categoryTitle.innerText = category.name;
            categoryElement.appendChild(categoryTitle);

            const list = document.createElement('ul');
            list.className = 'habitlist';

            category.habits.forEach(function (habit) {
                const item = document.createElement('li');
                item.className = 'habititem' + (habit.control ? ' habititem-setting' : '');
                item.id = 'habititem-' + habit.id;

                if (habit.control === 'range') {
                    const setting = document.createElement('label');
                    setting.className = 'habitsetting';
                    setting.setAttribute('data-tooltip', habit.description);

                    const name = document.createElement('span');
                    name.className = 'habitname';
                    name.innerText = habit.name;

                    const input = document.createElement('input');
                    input.type = 'range';
                    input.className = 'habitrange';
                    input.id = 'habitsetting-' + habit.id;
                    input.min = habit.min;
                    input.max = habit.max;
                    input.step = habit.step || 1;
                    input.value = getDietAutoEatThresholdPercent();

                    const valueLabel = document.createElement('span');
                    valueLabel.className = 'habitrangevalue';
                    valueLabel.id = 'habitsettingvalue-' + habit.id;
                    valueLabel.innerText = input.value + '%';

                    input.addEventListener('input', function () {
                        dietAutoEatThresholdPercent = clampDietAutoEatThreshold(input.value);
                        valueLabel.innerText = dietAutoEatThresholdPercent + '%';
                    });

                    setting.appendChild(name);
                    setting.appendChild(input);
                    setting.appendChild(valueLabel);
                    item.appendChild(setting);
                    list.appendChild(item);
                    return;
                }

                if (habit.control === 'select') {
                    const setting = document.createElement('label');
                    setting.className = 'habitsetting';
                    setting.setAttribute('data-tooltip', habit.description);

                    const name = document.createElement('span');
                    name.className = 'habitname';
                    name.innerText = habit.name;

                    const select = document.createElement('select');
                    select.className = 'habitselect';
                    select.id = 'habitsetting-' + habit.id;

                    const noneOption = document.createElement('option');
                    noneOption.value = '';
                    noneOption.innerText = 'None';
                    select.appendChild(noneOption);

                    CORE_STAT_NAMES.forEach(function (statKey) {
                        const option = document.createElement('option');
                        option.value = statKey;
                        option.innerText = player && player[statKey]
                            ? player[statKey].name
                            : statKey;
                        select.appendChild(option);
                    });
                    const isHarvestTreePriority = habit.id === 'harvestTreePriorityStat';
                    select.value = isHarvestTreePriority
                        ? (getHarvestTreePriorityStat() || '')
                        : (getDietPriorityStat() || '');
                    select.addEventListener('change', function () {
                        const selected = CORE_STAT_NAMES.includes(select.value)
                            ? select.value
                            : '';
                        if (isHarvestTreePriority) {
                            harvestTreePriorityStat = selected;
                            logMessage('Harvest trees priority stat: ' + (selected || 'none'));
                        } else {
                            dietPriorityStat = selected;
                            logMessage('Diet priority stat: ' + (selected || 'none'));
                        }
                    });

                    setting.appendChild(name);
                    setting.appendChild(select);
                    item.appendChild(setting);
                    list.appendChild(item);
                    return;
                }

                const label = document.createElement('label');
                label.className = 'habitswitch';
                label.setAttribute('data-tooltip', habit.description);

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = 'habittoggle-' + habit.id;
                input.checked = habitToggles[habit.id] !== false;
                input.addEventListener('change', function () {
                    if (habit.id === 'harvestTrees') {
                        if (input.checked) {
                            if (focusPoints < HARVEST_TREES_FOCUS_COST) {
                                input.checked = false;
                                habitToggles[habit.id] = false;
                                logMessage('Not enough focus points to enable ' + habit.name + ' ('
                                    + HARVEST_TREES_FOCUS_COST + ' required).');
                                return;
                            }
                            focusPoints -= HARVEST_TREES_FOCUS_COST;
                            habitToggles[habit.id] = true;
                            if (typeof previousTimedActionIds !== 'undefined'
                                && Array.isArray(previousTimedActionIds)) {
                                previousTimedActionIds = previousTimedActionIds.filter(function (actionId) {
                                    return actionId !== 'treesharvest';
                                });
                            }
                            updateFocusPointsDisplay();
                            logMessage(habit.name + ' habit enabled (-'
                                + HARVEST_TREES_FOCUS_COST + ' focus points).');
                            if (typeof startTreeHarvestIfEnabled === 'function') {
                                startTreeHarvestIfEnabled();
                            }
                        } else {
                            habitToggles[habit.id] = false;
                            focusPoints += HARVEST_TREES_FOCUS_COST;
                            updateFocusPointsDisplay();
                            logMessage(habit.name + ' habit disabled (+'
                                + HARVEST_TREES_FOCUS_COST + ' focus points refunded).');
                        }
                        return;
                    }

                    habitToggles[habit.id] = input.checked;
                    logMessage(habit.name + ' habit ' + (input.checked ? 'enabled' : 'disabled'));
                });

                const slider = document.createElement('span');
                slider.className = 'habitslider';

                const name = document.createElement('span');
                name.className = 'habitname';
                name.innerText = habit.name;

                label.appendChild(input);
                label.appendChild(slider);
                label.appendChild(name);
                item.appendChild(label);
                list.appendChild(item);
            });

            categoryElement.appendChild(list);
            container.appendChild(categoryElement);
        });

        updateHabitVisibility();
    }

    renderHabitCategories();

    // subtabs for building
