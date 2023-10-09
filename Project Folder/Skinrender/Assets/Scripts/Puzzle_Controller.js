#pragma strict

//PlayerReferences
private var playerReference:GameObject;
//----------------
//Child Objects
public var childList:Array;
private var wallList:Array;
private var objectList:Array;

private var bFirstPass:boolean;
//----------------
public var bActive:boolean;
public var bStarted:boolean;
//Configurables---
public var reEnterBlocker:GameObject;

public var panPosition:GameObject;

public var currentState:int;

private var bChoosingSpot:boolean;
private var bChoosingTarget:boolean;
private var affectedCharacter:GameObject;
public var waypointClass:GameObject;

public var killIndicator:Sprite;
public var abilityIndicator:Sprite;

public var targetingReticleClass:GameObject;
private var targetingReticle:GameObject;

public var bloodClass:GameObject;

function Start () { 
	playerReference = GameObject.Find("Player_Character");
	
	for(var x:int = 0; x<transform.childCount;x++){ //Tile areas are used to easily place large amounts of tiles into a puzzle, the puzzle must then call a function on the tile area to delete itself and set the tiles to be children of the puzzle object.
        if(transform.GetChild(x).gameObject.tag == "tileArea"){
            transform.GetChild(x).gameObject.GetComponent(TileAreaHandler).Setup();
	    }
	}
    //Adds children of the puzzle object to appropriate arrays so that they can be depth sorted.
	wallList = new Array();
	objectList = new Array();
	childList = new Array();
	for(var object:Transform in transform){
		if(object.gameObject.tag== "wall"){
			wallList.push(object.gameObject);
			childList.push(object.gameObject);
            SetLayer(object.gameObject,9);
		}else if(object.gameObject.tag == "enemy"||object.gameObject.tag == "prop" || object.gameObject.tag == "nonVisionBlockerProp" || object.gameObject.tag == "detail"){
			objectList.push(object.gameObject);
			childList.push(object.gameObject);
			if(object.gameObject.tag == "prop"){
			    SetLayer(object.gameObject,9);//Anything on layer 9 will block an enemies vision.
			}
		} 
	}
	childList.push(playerReference);
	DepthSort();//The puzzle runs an initial depth sort of the objects to speed up the process during the rest of gameplay. 
	currentState = GameState.Playing;
}

function SetLayer(object:GameObject, layer:int){ //sets the layer of a child 
    object.layer = layer;
    for(var x:int=0;x<object.transform.childCount;x++){
        object.transform.GetChild(x).gameObject.layer = layer; 
    }
}

function Update () {
	/*var xDistance:float = (playerReference.transform.position.x - this.transform.position.x);
	var yDistance:float = (playerReference.transform.position.y - this.transform.position.y);
	var distance:float = Mathf.Sqrt((xDistance*xDistance)+(yDistance*yDistance));
	if(distance>5f){
		bActive = false;
	}else{
		bActive = true;
	}*/
    //CheckVectors();
    if(currentState == GameState.Playing){
        if(bActive==true){
            DepthSort();
            var child:Transform;
            if(playerReference.GetComponent(Player_Controller).bDisguised == false){
                for(child in transform){
                    if(child.gameObject.tag == "enemy"){
                        if(child.GetComponent(EnemyController).bFriend == true){ //UPDATES INDICATOR TO SHOW IF PLAYER CAN TALK TO NPC
                            if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.42){
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).sprite = abilityIndicator;
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = true;
                            }else{
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = false;
                            }
	                    }else if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.42){ //UPDATES INDICATOR TO SHOW IF PLAYER CAN KILL NPC
                            if(child.GetComponent(EnemyController).InPlayerArc(playerReference)==true){
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).sprite = killIndicator;
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = true;
	                        }else{
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = false;
                            }
	                    }else{
                            child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = false;
	                    }
                    }
	            }
            }else{
                if(playerReference.GetComponent(Player_Controller).bHasAbilityBartender==true){ //UPDATES INDICATOR TO SHOW IF PLAYER MAY USE BARTENDER ABILITY ON NPC
                    for(child in transform){
                        if(child.gameObject.tag == "enemy"){
                            if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.42){
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).sprite = abilityIndicator;
                                child.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = true;
                            }
	                    }
                    }
	            }
	        }
            //THIS HANDLES KILLING ENEMIES
            if(Input.GetKeyDown("space") || Input.GetMouseButtonDown(0)){
                if(playerReference.GetComponent(Player_Controller).bDisguised==false){
                    for(child in transform){
                        if(child.gameObject.tag == "enemy"){
                            if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.42){
                                if(child.GetComponent(EnemyController).bFriend==true){
                                    if(GameObject.Find("UIController").GetComponent(UI_Controller).conversationShowing == false){
                                        child.GetComponent(EnemyController).PlayConversation();
	                                }else{
                                        GameObject.Find("UIController").GetComponent(UI_Controller).SkipMessage();
                                    }
                                    break;
	                            }else{
                                    if(child.GetComponent(EnemyController).InPlayerArc(playerReference)==true){
                                        playerReference.GetComponent(Player_Controller).bKilling = true;
                                        switch(child.GetComponent(EnemyController).iVisionFacing){
                                            case 0:
                                                playerReference.GetComponent(Animator).Play("KillNorth");
                                                break;
                                            case 1:
                                                playerReference.GetComponent(Animator).Play("KillNorth");
                                                break;
                                            case 2:
                                                playerReference.GetComponent(Animator).Play("KillWest");
                                                break;
                                            case 3:
                                                playerReference.GetComponent(Animator).Play("KillWest");
                                                break;
                                            case 4:
                                                playerReference.GetComponent(Animator).Play("KillSouth");
                                                break;
                                            case 5:
                                                playerReference.GetComponent(Animator).Play("KillSouth");
                                                break;
                                            case 6:
                                                playerReference.GetComponent(Animator).Play("KillEast");
                                                break;
                                            case 7:
                                                playerReference.GetComponent(Animator).Play("KillEast");
                                                break;
                                        }
                                        
                                        var enemyType:String = child.GetComponent(EnemyController).sType;
                                        switch (enemyType){
                                            case "Guard":
                                                playerReference.GetComponent(Player_Controller).KilledGuard();
                                                break;
                                            case "Bartender":
                                                playerReference.GetComponent(Player_Controller).KilledBartender();
                                                break;
                                            case "Seduce":
                                                playerReference.GetComponent(Player_Controller).KilledSeduce();
                                                break;
                                            case "Shout":
                                                playerReference.GetComponent(Player_Controller).KilledShouter();
                                                break;
                                            case "Innocent":
                                                playerReference.GetComponent(Player_Controller).KilledInnocent();
                                                break;
                                        }
                                        playerReference.GetComponent(Player_Controller).GetItems(child.GetComponent(EnemyController).inventory);
                                        KillEnemy(child.gameObject);
                                        break;
	                                }
	                            }
                            }
                        }
                     }
                }
            }
            //THIS HANDLES ABILITIES-----------------------------------
            if(Input.GetKeyDown("f")){
                if(playerReference.GetComponent(Player_Controller).bHasAbilityBartender==true){ //If player has bartender ability, and is within range - cause the NPC to become drunk
                    for(child in transform){
                        if(child.gameObject.tag == "enemy"){
                            if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.18){
                                playerReference.GetComponent(Player_Controller).bHasAbilityBartender=false;
                                child.gameObject.GetComponent(EnemyController).BecomeDrunk();
                            }
                        }
                    }
                }
                if(playerReference.GetComponent(Player_Controller).bHasAbilitySeduce==true){ //If player has seduce ability, and is within range, set up 'ChoosingSpot' section to let the player specify a location to send the NPC
                    for(child in transform){
                        if(child.tag == "enemy"){
                            if(checkScalarDistance(playerReference.transform.position,child.transform.position)<0.18){
                                affectedCharacter = child.gameObject;
                                bChoosingSpot = true;
                                targetingReticle = Instantiate(targetingReticleClass,Camera.main.ScreenToWorldPoint(Input.mousePosition),transform.rotation);
                                GameObject.Find("GameController").GetComponent(GameController).PauseGame();
                                GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("'Left Click' wherever you want to send them!");
                            }
                        }
                    }  
                }
                if(playerReference.GetComponent(Player_Controller).bHasAbilityGuardShout==true){//If player has guard shout ability, set up the 'ChooseTarget' section to let the player specify which NPC to call over
                    bChoosingTarget = true;
                    targetingReticle = Instantiate(targetingReticleClass,Camera.main.ScreenToWorldPoint(Input.mousePosition),transform.rotation);
                    GameObject.Find("GameController").GetComponent(GameController).PauseGame();
                    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("'Left Click' on the person you want to call over!");
                }
            }
        }
    }else{
        if(bChoosingSpot==true){ //If using the seduce ability, the player chooses a spot to send the NPC, a waypoint must be created at thje sending and return spots so that the NPC can get there, and then get back to their current location
            if(Input.GetMouseButtonDown(0)){
                var selectedTile:GameObject = SelectSpot(Camera.main.ScreenToWorldPoint(Input.mousePosition));
                if(selectedTile!=null){
                    playerReference.GetComponent(Player_Controller).bHasAbilitySeduce = false;
                    bChoosingSpot = false;
                    Destroy(targetingReticle);
                    var newWaypoint = Instantiate(waypointClass,selectedTile.transform.position,transform.rotation);
                    newWaypoint.transform.position.z=0;
                    newWaypoint.GetComponent(PathfindingTileHandler).iWaitTime = 600;
                    newWaypoint.transform.parent = gameObject.transform;

                    var currentSpot = Instantiate(waypointClass,affectedCharacter.transform.position,transform.rotation);
                    currentSpot.transform.position.z=0;
                    currentSpot.transform.parent = gameObject.transform;

                    GameObject.Find("GameController").GetComponent(GameController).UnPauseGame();
                    affectedCharacter.GetComponent(EnemyController).BecomeSeduced(newWaypoint,currentSpot);
                }else{
                    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("Cannot send someone there.");
                    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("(You can press Escape to cancel)");
                }
            }else if(Input.GetKeyDown("escape")){//Allows player to cancel using the ability
                bChoosingTarget=false;
                Destroy(targetingReticle);
                GameObject.Find("GameController").GetComponent(GameController).UnPauseGame();
            }
        }
	if(bChoosingTarget==true){//If using the guard shout ability, the game is paused while the player chooses a target to call over. Once it has been determined whether the target is possible,
        //a waypoint is created at the player's location, and the NPC's current location so that they can get to the target, and make their way back after a short delay. 
	    var selectedEnemy:GameObject = SelectTarget();
	    var allowed:boolean =true;
	    if(selectedEnemy !=null){
	        var selectedCharTraits = selectedEnemy.GetComponent(EnemyController).traits;
	        for(var x:int =0 ;x<selectedCharTraits.length; x++){
                if(selectedCharTraits[x] == "stubborn"){
                    allowed = false;
	            }
            }
	        if(allowed==true){
	            selectedEnemy.Find("targetIndicator").GetComponent(SpriteRenderer).sprite = abilityIndicator;
	            selectedEnemy.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = true;
	        }else{
                selectedEnemy.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = false;
            }
	    }
        if(Input.GetMouseButtonDown(0)){
                if(selectedEnemy!=null){
                    var positionToGo:GameObject = SelectSpot(playerReference.transform.position);
                    if(positionToGo!=null){
                        if(allowed==true){
                            playerReference.GetComponent(Player_Controller).bHasAbilityGuardShout = false;
                            bChoosingTarget=false;
                            Destroy(targetingReticle);
                            var newShoutWaypoint = Instantiate(waypointClass,positionToGo.transform.position,transform.rotation);
                            newShoutWaypoint.transform.position.z=0;
                            newShoutWaypoint.GetComponent(PathfindingTileHandler).iWaitTime=600;
                            newShoutWaypoint.transform.parent = gameObject.transform;

                            var currentShoutSpot = Instantiate(waypointClass, SelectSpot(selectedEnemy.transform.position).transform.position,transform.rotation);
                            currentShoutSpot.transform.position.z =0 ;
                            currentShoutSpot.transform.parent = gameObject.transform;

                            GameObject.Find("GameController").GetComponent(GameController).UnPauseGame();
                            selectedEnemy.GetComponent(EnemyController).BecomeSeduced(newShoutWaypoint,currentShoutSpot);
                            selectedEnemy.Find("targetIndicator").GetComponent(SpriteRenderer).enabled = false;
                        }else{
                            GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("That person doesn't seem to be listening.");
                            GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("(You can press Escape to cancel)");
                        }
                    }else{
                        GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("That person can't get here.");
                        GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("(You can press Escape to cancel");
                    }
                    
                }else{
                    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("Select a lower-ranking person to call over.");
                }
            }else if(Input.GetKeyDown("escape")){//Allows player to cancel the ability
                bChoosingTarget=false;
                Destroy(targetingReticle);
                GameObject.Find("GameController").GetComponent(GameController).UnPauseGame();
            }
        }
    }
}

public function placeBlood(position:Vector3){ //Places a blood graphic after an NPC has been killed. 
    var newBlood:GameObject = Instantiate(bloodClass,position,transform.rotation);
    childList.Add(newBlood);
}

function SelectSpot(position:Vector3):GameObject{//Function to allow the player to select a walkable tile for the 'seduce' ability
    //var mousePos:Vector3 = Camera.main.ScreenToWorldPoint(Input.mousePosition);
    for(var child:Transform in transform){
        if(child.gameObject.tag == "walkable"){
            if(checkScalarDistance(position,child.transform.position)<0.2){
                return child.gameObject;     
            }
        }
    }
    return null;
}

function SelectTarget():GameObject{ //Function to allow the player to select an NPC target for the 'guard shout' ability.
    var mousePos:Vector3 = Camera.main.ScreenToWorldPoint(Input.mousePosition);
    for(var child:Transform in transform){
        if(child.gameObject.tag == "enemy"){
            if(checkScalarDistance(mousePos,child.transform.position)<0.18 && checkScalarDistance(playerReference.transform.position,child.transform.position)<3.5){
                return child.gameObject;
            }
        }
    }
    return null;
}

function PauseGame(){//Pauses the puzzle and all children
    currentState = GameState.Paused;
    for(var child:Transform in transform){
        if(child.gameObject.tag == "enemy"){
            child.gameObject.GetComponent(EnemyController).currentState = GameState.Paused;
        }
    }
}

function UnPauseGame(){ //Unpauses the puzzle and all children
    currentState = GameState.Playing;
    for(var child:Transform in transform){
        if(child.gameObject.tag == "enemy"){
            child.gameObject.GetComponent(EnemyController).currentState = GameState.Playing;
        }
    }
}

public function SwitchPause(){//Switches the current paude/unpause setup
    if(currentState == GameState.Playing){
        PauseGame();
    }else{
        UnPauseGame();
    }
}

function UpdateChildList(){
	
}

function StartPuzzle(){ //Carrues out functions to start the puzzle 
	if(bActive==false){
		Start();
		bActive = true;
		var iCounter:int;
		for(iCounter=0;iCounter<childList.length;iCounter++){
			var tempObject:GameObject = childList[iCounter];
			if(tempObject.tag == "enemy"){
				tempObject.GetComponent(EnemyController).Setup();
			}
		}
	}
}

function EndPuzzle(){ //Stops processes from taking place in this puzzle, and activates a blocker to stop the player from returning to this area. 
	if(reEnterBlocker!=null){
		reEnterBlocker.GetComponent(Collider2D).enabled = true;
	}
    //UnhideAllWalls();
	PauseGame();
}

function UnhideAllWalls(){ //A function no longer really used, stops hiding any of the walls in this puzzle. 
	var iCounter:int;
	for(iCounter=0;iCounter<wallList.length;iCounter++){
		var wallObject:GameObject = wallList[iCounter];
		wallObject.transform.Find("mid").GetComponent(SpriteRenderer).enabled = true;
		wallObject.transform.Find("top").GetComponent(SpriteRenderer).enabled = true;
		if(wallObject.transform.Find("lowEnd")!=null){
		//	wallObject.transform.Find("lowEnd").GetComponent(SpriteRenderer).enabled = false;
			wallObject.transform.Find("midEnd").GetComponent(SpriteRenderer).enabled = true;
			wallObject.transform.Find("topEnd").GetComponent(SpriteRenderer).enabled = true;
		}
	}
}

function KillEnemy(enemy:GameObject){ //Removes an enemy that has been killed, and checks to see if a door should be unlocked. 
    yield WaitForSeconds(0.5);
	//Destroy(enemy)
    for(var y:int=0; y<childList.length;y++){
		if(childList[y] == enemy){
            if(enemy.GetComponent(EnemyController).unlockDoor !=null){
                enemy.GetComponent(EnemyController).unlockDoor.GetComponent(DoorController).UnlockDoor();
	        }
			childList.RemoveAt(y);
			Destroy(enemy);
		}
	}
}

function removeChildFromList(child:GameObject){//Removes a child from the depth sorting arrays
    for(var y:int=0; y<childList.length;y++){
		if(childList[y] == child){
			childList.RemoveAt(y);
        }
    }
}

function CheckVectors(){//THIS FUNCTION IS NO LONGER USED, IT WAS PART OF THE PREVIOUS, REPLACED ENEMY VISION SYSTEM

	//This function checks if an enemy can see the player unobscured by a wall, if not - it removes that enemies view cone
	var iCounter:int;
	for(iCounter=0; iCounter<childList.length;iCounter++){
		var currentChild:GameObject = GameObject(childList[iCounter]);
		if(currentChild.tag == "enemy"){
			var vector:Vector2 = playerReference.transform.Find("CollisionBall").position - currentChild.transform.Find("CollisionBall").position;
			Debug.DrawLine(currentChild.transform.Find("CollisionBall").position,playerReference.transform.Find("CollisionBall").position,Color.blue);
			var magnitude:int = vector.magnitude;
			vector = vector/magnitude;
			var ray:RaycastHit2D;
			var layerMask:int = 1 << 8;
			if(Physics2D.Raycast(currentChild.transform.Find("CollisionBall").position,vector,magnitude,layerMask)){
				ray = Physics2D.Raycast(currentChild.transform.Find("CollisionBall").position,vector,magnitude,layerMask);
				if(ray.collider.gameObject.tag != "Player"){
					Debug.DrawLine(currentChild.transform.Find("CollisionBall").position,ray.point, Color.red);
					currentChild.transform.Find("ViewVector").GetComponent(SpriteRenderer).enabled = false;
				}else{
					Debug.DrawLine(currentChild.transform.Find("CollisionBall").position,ray.point, Color.green);
					currentChild.transform.Find("ViewVector").GetComponent(SpriteRenderer).enabled = true;
				}
			}
		}
	}
}

function DepthSort(){//Depth sorts just this puzzle
	//Handles Invisible Walls
	var iCounter:int;
	for(iCounter=0;iCounter<wallList.length;iCounter++){
		var wallObject:GameObject = wallList[iCounter];
		var yDistance:float = playerReference.transform.position.y-wallObject.transform.position.y;
		if(yDistance >0.05 && yDistance < 1){
			wallObject.transform.Find("mid").GetComponent(SpriteRenderer).enabled = false;
			wallObject.transform.Find("top").GetComponent(SpriteRenderer).enabled = false;
			if(wallObject.transform.Find("lowEnd")!=null){
			//	wallObject.transform.Find("lowEnd").GetComponent(SpriteRenderer).enabled = false;
				wallObject.transform.Find("midEnd").GetComponent(SpriteRenderer).enabled = false;
				wallObject.transform.Find("topEnd").GetComponent(SpriteRenderer).enabled = false;
			}
			for(var x:int=0;x<wallObject.transform.childCount;x++){
                if(wallObject.transform.GetChild(x).tag=="detail"){
                    wallObject.transform.GetChild(x).GetComponent(SpriteRenderer).enabled = false;
			    }
			}
		}else{
			wallObject.transform.Find("mid").GetComponent(SpriteRenderer).enabled = true;
			wallObject.transform.Find("top").GetComponent(SpriteRenderer).enabled = true;
			if(wallObject.transform.Find("lowEnd")!=null){
			//	wallObject.transform.Find("lowEnd").GetComponent(SpriteRenderer).enabled = true;
				wallObject.transform.Find("midEnd").GetComponent(SpriteRenderer).enabled = true;
				wallObject.transform.Find("topEnd").GetComponent(SpriteRenderer).enabled = true;
			}
			for(var y:int=0;y<wallObject.transform.childCount;y++){
                if(wallObject.transform.GetChild(y).tag=="detail"){
                    wallObject.transform.GetChild(y).GetComponent(SpriteRenderer).enabled = true;
			    }
			}
		}
	}
	//-----------------
	SortChildList();
	var zModifier:float = 8f/childList.length;
	if(bFirstPass==false){
	    for(iCounter=0;iCounter<childList.length;iCounter++){
	        var currentSelection:GameObject = childList[iCounter];
	        if(currentSelection.tag == "prop" || currentSelection.tag == "nonVisionBlockerProp"){
	            //currentSelection.transform.Find("prop").position.z = -0.5 - (zModifier*iCounter);
	            currentSelection.transform.Find("prop").position.z = 0;
	            currentSelection.transform.Find("prop").GetComponent(SpriteRenderer).sortingOrder = 1 + iCounter;
	        }else if(currentSelection.tag == "player"){
	            currentSelection.GetComponent(SpriteRenderer).sortingOrder = 1 + iCounter;
	        }else{
	            //currentSelection.transform.position.z = -0.5 - (zModifier*iCounter);
	            currentSelection.transform.position.z = 0;
	            if(currentSelection.GetComponent(SpriteRenderer)!=null){
	                currentSelection.GetComponent(SpriteRenderer).sortingOrder = 1 + iCounter;
	            }
	            for(var childCounter =0 ; childCounter<currentSelection.transform.childCount;childCounter++){
	                if(currentSelection.transform.GetChild(childCounter).GetComponent(SpriteRenderer)!=null){
	                    currentSelection.transform.GetChild(childCounter).position.z = 0;
	                    currentSelection.transform.GetChild(childCounter).GetComponent(SpriteRenderer).sortingOrder = 1 + iCounter;
	                }
	            }
	            if(currentSelection.tag == "enemy"){

	            }
	        }
	    }
	    bFirstPass = true;
	}
}

function SortChildList(){//Bubble sorts this puzzles child list 
	var bDone:boolean;
	while (bDone==false){
		bDone = true;
		for(var x:int=1; x<childList.length;x++){
			var object1:GameObject = childList[x];
			var object2:GameObject = childList[x-1];
			if(object1.tag=="enemy" || object1.tag=="player"){
				if(object2.tag=="enemy" || object2.tag == "player"){
					if(object1.transform.position.y-0.3 > object2.transform.position.y-0.3){
						childList[x-1] = object1;
						childList[x] = object2;
						bDone = false;
					}
				}else{
					if(object1.transform.position.y-0.3 > object2.transform.position.y){
						childList[x-1] = object1;
						childList[x] = object2;
						bDone = false;
					}
				}
			}else{
				if(object2.tag=="enemy" || object2.tag == "player"){
					if(object1.transform.position.y > object2.transform.position.y-0.3){
						childList[x-1] = object1;
						childList[x] = object2;
						bDone = false;
					}
				}else{
					if(object1.transform.position.y > object2.transform.position.y){
						childList[x-1] = object1;
						childList[x] = object2;
						bDone = false;
					}
				}
			}
		}
	}
}

function checkScalarDistance(character1:Vector2,character2:Vector2):float{//Utility function to check distance 
	var xDistance:float = character1.x - character2.x;
	var yDistance:float = character1.y - character2.y;
	
	var vectorDistance:float = Mathf.Sqrt((xDistance*xDistance)+(yDistance*yDistance));
	return vectorDistance;
}