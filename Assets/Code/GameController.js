#pragma strict

public var PossiblePuzzleList:GameObject[];
private var playerReference:GameObject;
public var bCameraEnabled:boolean;
public var bCameraLocked:boolean;
private var fScrollSpeed:float;

private var currentWaypointID:int;

//camera pan variables----
private var bPanning:boolean;
private var panTarget:Vector2;
private var panAmount:Vector2;
private var iPanInterval:int;
private var originPoint:Vector2;
//--------------

//Depth Sort Variables
private var objectList:Array;
//---------------------------
//Utility variables

public var abilityIndicator:Sprite;
//---------------------------

enum GameState{Playing,Paused};

function Start () { 
	playerReference = GameObject.Find("Player_Character");
	
	PauseGame();

	fScrollSpeed = 3;
	bCameraEnabled = false;
	
	//SetWaypoint(1);
	bCameraLocked = true;

	GameObject.Find("Main Camera").transform.localPosition.x = 13.9;
	GameObject.Find("Main Camera").transform.localPosition.y = -7.15;
	GameObject.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).HideUI();
}

function Update () { //Mainly used to update the camera position
	GameObject.Find("Main Camera").transform.position.z =-10;
	if(bCameraEnabled == true && bCameraLocked==false){
		CameraControls();
	}
	if(bPanning == true){
		ContinuePan();
	}

	DepthSort(); //Updates the depth sorting for the gameworld

	/*if(Input.GetKeyDown("k")){ //Used during testing to skip to certain levels
	    SkipToLevel(6);
	}*/
}
//EXITS THE MAIN MENU TO START THE INTRO SECTION
public function BeginGame(){
    GameObject.Find("Main Camera").transform.position = new Vector2(1.2,-1.2);
    playerReference.transform.parent = GameObject.Find("IntroArea(Clone)").transform;
    GameObject.Find("Main Camera").transform.parent = playerReference.transform;
    bCameraEnabled = true;
    bCameraLocked = false;
    UnPauseGame();
    SetWaypoint(1);
}

//STARTS THE MAIN ASPECT OF THE GAME
public function StartGame(){
    playerReference.transform.parent = null;
    GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
    GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).bActive = false;
    Destroy(GameObject.Find("IntroArea3(Clone)"));
    Destroy(GameObject.Find("IntroArea(Clone)"));
    Instantiate(PossiblePuzzleList[3], new Vector2(-24.8,5.31),transform.rotation);
    Instantiate(PossiblePuzzleList[8], new Vector2(0,0),transform.rotation);
    GameObject.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).ShowUI();
}

public function PauseGame(){//Changes the gamestate on all objects to pause
    playerReference.GetComponent(Player_Controller).Pause();//.currentState = GameState.Paused;
    if(playerReference.gameObject.transform.parent!=null){
        playerReference.gameObject.transform.parent.GetComponent(Puzzle_Controller).PauseGame();
    }
    GameObject.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).Pause();
}

public function UnPauseGame(){ //Changes the gamestate on all objects to playing
    playerReference.GetComponent(Player_Controller).UnPause();//.currentState = GameState.Playing;
    if(playerReference.gameObject.transform.parent!=null){
        playerReference.gameObject.transform.parent.GetComponent(Puzzle_Controller).UnPauseGame();
    }
    playerReference.transform.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).UnPause();
}

function CameraControls(){ //Handles camera movement based on mouse position
	var mousePos:Vector3 = Input.mousePosition;
	var cameraObject:GameObject = GameObject.Find("Main Camera");
	if(mousePos.x <20 && cameraObject.transform.position.x > (playerReference.transform.position.x - 3f)){
		cameraObject.transform.position.x -= fScrollSpeed * Time.deltaTime;
	    bPanning = false;
	}else if(Screen.width - mousePos.x<20 && cameraObject.transform.position.x < (playerReference.transform.position.x + 3f)){
	    cameraObject.transform.position.x += fScrollSpeed * Time.deltaTime;
	    bPanning = false;
	}
	
	if(mousePos.y<20 && cameraObject.transform.position.y > (playerReference.transform.position.y - 3f)){
		cameraObject.transform.position.y -= fScrollSpeed * Time.deltaTime;
	    bPanning = false;
	}else if(Screen.height - mousePos.y<20 && cameraObject.transform.position.y < (playerReference.transform.position.y + 3f)){
		cameraObject.transform.position.y += fScrollSpeed * Time.deltaTime;
	    bPanning = false;
	}
}

function PanCamera(targetPosition:Vector3,lock:boolean){ //Sets up for a camera pan to a particular location, used at the start of puzzles 
    var cameraObject:GameObject = GameObject.Find("Main Camera");
    if(lock==true){
        bCameraEnabled = false;
        playerReference.GetComponent(Player_Controller).bMovementEnabled = false;
    }
	
	bPanning = true;
	
	panTarget = new Vector2(0,0);
	panTarget.x = targetPosition.x;
	panTarget.y = targetPosition.y;
	
	originPoint = new Vector2(0,0);
	originPoint.x = cameraObject.transform.position.x;
	originPoint.y = cameraObject.transform.position.y;
	
	panAmount = panTarget - originPoint;
	panAmount = panAmount/180;
	iPanInterval = 0;
}

function ContinuePan(){ //Continues panning to a location, once a pan has been started 
	var cameraObject:GameObject = GameObject.Find("Main Camera");
	cameraObject.transform.position +=panAmount;
	cameraObject.transform.position.z = -10.2;
	iPanInterval++;
	if(iPanInterval==180){
	    if(bCameraEnabled==false){
	        if(bCameraLocked==false){
	            bCameraEnabled = true;
	        }
	        playerReference.GetComponent(Player_Controller).bMovementEnabled = true;
	    }
		bPanning = false;
	}
}

function ResetAllPuzzles(ID:int):Vector2{ //Remove and replace a given puzzle to reset it.
	var newPuzzle:GameObject;
	playerReference.transform.parent = null;
	switch(ID){
		case 1:
		    Destroy(GameObject.Find("IntroArea(Clone)"));
			newPuzzle = Instantiate(PossiblePuzzleList[0],Vector2(0,0),transform.rotation);
			//newPuzzle.GetComponent(Puzzle_Controller).StartPuzzle();
			break;
		case 2:
		    Destroy(GameObject.Find("IntroArea2(Clone)"));
			newPuzzle = Instantiate(PossiblePuzzleList[1],Vector2(-0.93,1.872),transform.rotation);
			//newPuzzle.GetComponent(Puzzle_Controller).StartPuzzle();
			break;
		case 3:
		    Destroy(GameObject.Find("IntroArea3(Clone)"));
			newPuzzle = Instantiate(PossiblePuzzleList[2],Vector2(-24.8,5.31),transform.rotation);
			//newPuzzle.GetComponent(Puzzle_Controller).StartPuzzle();
			break;
		case 4:
			Destroy(GameObject.Find("Puzzle01(Clone)"));
			newPuzzle = Instantiate(PossiblePuzzleList[3],Vector2(-24.8,5.31),transform.rotation);
			//newPuzzle.GetComponent(Puzzle_Controller).StartPuzzle();
			break;
		case 5:
			Destroy(GameObject.Find("Puzzle02(Clone)"));
			newPuzzle = Instantiate(PossiblePuzzleList[4],Vector2(-22.01,3.59),transform.rotation);
			break;
	    case 6:
	        Destroy(GameObject.Find("Puzzle03(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[5],Vector2(-9.3,0.31),transform.rotation);
	        break;
	    case 7:
	        Destroy(GameObject.Find("Puzzle04(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[6],Vector2(-0.31,-3.59),transform.rotation);
	        break;
	    case 8:
	        Destroy(GameObject.Find("Puzzle05(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[7],Vector2(5.58,-2.496),transform.rotation);
	        break;
	    case 9:
	        if(GameObject.Find("IntroArea(Clone)")!=null){
	            Destroy(GameObject.Find("IntroArea(Clone"));
	        }else{
	            Destroy(GameObject.Find("Puzzle06(Clone)"));
	        }
	        newPuzzle = Instantiate(PossiblePuzzleList[8],Vector2(0,0),transform.rotation);
	        break;
	    case 10:
	        Destroy(GameObject.Find("Puzzle07(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[9],Vector2(1.86,-0.624),transform.rotation);
	        break;
	    case 11:
	        Destroy(GameObject.Find("Puzzle08(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[10],Vector2(5.89,0.156),transform.rotation);
	        break;
	    case 12:
	        Destroy(GameObject.Find("Puzzle09(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[11],Vector2(8.37,0.16),transform.rotation);
	        break;
	    case 13:
	        Destroy(GameObject.Find("Puzzle10(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[12],Vector2(12.09,1.09),transform.rotation);
	        break;
	    case 14:
	        Destroy(GameObject.Find("Puzzle11(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[13],Vector2(12.09,2.652),transform.rotation);
	        break;
	    case 15:
	        Destroy(GameObject.Find("Puzzle12(Clone)"));
	        newPuzzle = Instantiate(PossiblePuzzleList[14],Vector2(8.68,3.744),transform.rotation);
	        break;
	}
	
	playerReference.transform.parent = newPuzzle.transform;
	newPuzzle.GetComponent(Puzzle_Controller).StartPuzzle();
	return newPuzzle.transform.Find("CheckPoint").transform.position;
}

public function SkipToLevel(ID:int){//Function used during testing to skip to a particular level
    StartGame();
    SetWaypoint(ID);
    playerReference.GetComponent(Player_Controller).waypointID = ID;
    playerReference.GetComponent(Player_Controller).currentSpriteSet = "";
    playerReference.GetComponent(Player_Controller).Death();
    bCameraEnabled = true;
    playerReference.GetComponent(Player_Controller).bMovementEnabled = true;
    bPanning = false;
}

public function SetWaypoint(ID:int){ //This is called when the player hits a new waypoint, it changes the 'current puzzle' and displays any messages played at the start of a puzzle.
    if(ID == currentWaypointID){
        //Waypoint already set 
        return;
    }
	switch(ID){//The previous puzzle must be disabled to prevent unneccesary processing
		case 1:
		    playerReference.transform.parent = GameObject.Find("IntroArea(Clone)").transform;
		    GameObject.Find("IntroArea(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
			//GameObject.Find("Puzzle02(Clone)").GetComponent(Puzzle_Controller).bActive = false;
			if(ID!=currentWaypointID){
			    PanCamera(GameObject.Find("IntroArea(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
			    DisplayUIMessage("Use Arrow Keys or 'Right Click' to move around...");
			    DisplayUIMessage("Press Space or 'Left Click' to talk");
			}
			break;
		case 2:
		    GameObject.Find("IntroArea(Clone)").GetComponent(Puzzle_Controller).bActive = false;
		    playerReference.transform.parent = GameObject.Find("IntroArea2(Clone)").transform;
		    GameObject.Find("IntroArea(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
			GameObject.Find("IntroArea2(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
			if(ID!=currentWaypointID){
			    PanCamera(GameObject.Find("IntroArea2(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
			    //DisplayUIMessage("Press space or 'Left Click' to kill a nearby human...");
			    //DisplayUIMessage("...and wear their skin");
			}
			break;
		case 3:
		    GameObject.Find("IntroArea2(Clone)").GetComponent(Puzzle_Controller).bActive = false;
		    playerReference.transform.parent = GameObject.Find("IntroArea3(Clone)").transform;
			GameObject.Find("IntroArea2(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
			GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
			if(ID!=currentWaypointID){
			    PanCamera(GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
			    //DisplayUIMessage("The Innocent are tinted green...");
			    //DisplayUIMessage("They don't deserve to die");
			}
			break;
		case 4:
		    //GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).bActive = false;
			playerReference.transform.parent = GameObject.Find("Puzzle01(Clone)").transform;
			//GameObject.Find("IntroArea3(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
			GameObject.Find("Puzzle01(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
			if(ID!=currentWaypointID){
			    PanCamera(GameObject.Find("Puzzle01(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
			    DisplayUIMessage("I'm ...alive? Cold...");
			    //DisplayUIMessage("I need to get inside, warm up");
			}
			break;
	    case 5:
			GameObject.Find("Puzzle01(Clone)").GetComponent(Puzzle_Controller).bActive = false;
			playerReference.transform.parent = GameObject.Find("Puzzle02(Clone)").transform;
			GameObject.Find("Puzzle01(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
			GameObject.Find("Puzzle02(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
			if(ID!=currentWaypointID){
			    PanCamera(GameObject.Find("Puzzle02(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
			    DisplayUIMessage("One of those Republican bastards!");
			    DisplayUIMessage("I could walk right up behind him and rip him apart!");
			    DisplayUIMessage("(Press V to toggle vision indicators)");
			}
			break;
	    case 6:
	        GameObject.Find("Puzzle02(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle03(Clone)").transform;
	        GameObject.Find("Puzzle02(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle03(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle03(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            DisplayUIMessage("They're guarding the entrance to my Inn!");
	            DisplayUIMessage("I'll have to find another way inside");
	        }
	        break;
	    case 7:
	        GameObject.Find("Puzzle03(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle04(Clone)").transform;
	        GameObject.Find("Puzzle03(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle04(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle04(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            DisplayUIMessage("The Servant's entrance is around here");
	            DisplayUIMessage("(Press Q to restart the current level)");
	        }
	        break;
	    case 8:
	        GameObject.Find("Puzzle04(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle05(Clone)").transform;
	        GameObject.Find("Puzzle04(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle05(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle05(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            DisplayUIMessage("All the doors out of the Kitchens are locked...");
	            DisplayUIMessage("I bet that Officer has a key to one of these doors.");
	        }
	        break;
	    case 9:
	        GameObject.Find("Puzzle05(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle06(Clone)").transform;
	        GameObject.Find("Puzzle05(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle06(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle06(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 10:
	        GameObject.Find("Puzzle06(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle07(Clone)").transform;
	        GameObject.Find("Puzzle06(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle07(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle07(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 11:
	        GameObject.Find("Puzzle07(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle08(Clone)").transform;
	        GameObject.Find("Puzzle07(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle08(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle08(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 12:
	        GameObject.Find("Puzzle08(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle09(Clone)").transform;
	        GameObject.Find("Puzzle08(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle09(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle09(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 13:
	        GameObject.Find("Puzzle09(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle10(Clone)").transform;
	        GameObject.Find("Puzzle09(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle10(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle10(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 14:
	        GameObject.Find("Puzzle10(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle11(Clone)").transform;
	        GameObject.Find("Puzzle10(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle11(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle11(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	    case 15:
	        GameObject.Find("Puzzle11(Clone)").GetComponent(Puzzle_Controller).bActive = false;
	        playerReference.transform.parent = GameObject.Find("Puzzle12(Clone)").transform;
	        GameObject.Find("Puzzle11(Clone)").GetComponent(Puzzle_Controller).EndPuzzle();
	        GameObject.Find("Puzzle12(Clone)").GetComponent(Puzzle_Controller).StartPuzzle();
	        if(ID!=currentWaypointID){
	            PanCamera(GameObject.Find("Puzzle12(Clone)").GetComponent(Puzzle_Controller).panPosition.transform.position,true);
	            //DisplayUIMessage("Ahh... the Kitchens");
	        }
	        break;
	}
	currentWaypointID = ID;
	
}

function DisplayUIMessage(Message:String){ //Calls a function in the UI manager to display a message.
    if(playerReference.transform.Find("Main Camera")!=null){
        playerReference.transform.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).ShowMessage(Message);
    }
}

function StartConversation(speech:Conversation){//Calls a function in the UI manager to display a conversation.
    playerReference.transform.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller).ShowConversation(speech,true);
}

function DepthSort(){//Depth sorting function allows the actually-2d game to give the perspective of 3D space by placing objects higher up on the Y-axis behind other objects

    BubbleSortObjects();//A bubble sort is used to establish the order of objects on the Y-axis
    for(var iCounter=0;iCounter<objectList.length;iCounter++){
        var currentSelection:GameObject = objectList[iCounter];
        if(currentSelection.tag == "prop" || currentSelection.tag == "nonVisionBlockerProp"){
            //currentSelection.transform.Find("prop").position.z = -0.5 - (zModifier*iCounter);
            for(var childCounter1 =0 ; childCounter1<currentSelection.transform.childCount;childCounter1++){
                if(currentSelection.transform.GetChild(childCounter1).GetComponent(SpriteRenderer)!=null){
                    currentSelection.transform.GetChild(childCounter1).position.z = 0;
                    if(currentSelection.transform.GetChild(childCounter1).tag== "detail"){
                        currentSelection.transform.GetChild(childCounter1).GetComponent(SpriteRenderer).sortingOrder = 2+(2*iCounter);
                    }
                    if(currentSelection.transform.GetChild(childCounter1).name == "prop"){
                        currentSelection.transform.GetChild(childCounter1).GetComponent(SpriteRenderer).sortingOrder = 1 + (2*iCounter);
                    }
                }
            }
        }else if(currentSelection.tag == "player"){
            currentSelection.GetComponent(SpriteRenderer).sortingOrder = 1 + (2*iCounter);
        }else{
            //currentSelection.transform.position.z = -0.5 - (zModifier*iCounter);
            currentSelection.transform.position.z = 0;
            if(currentSelection.GetComponent(SpriteRenderer)!=null){
                currentSelection.GetComponent(SpriteRenderer).sortingOrder = 1 + (2*iCounter);
            }
            for(var childCounter =0 ; childCounter<currentSelection.transform.childCount;childCounter++){
                if(currentSelection.transform.GetChild(childCounter).GetComponent(SpriteRenderer)!=null){
                    currentSelection.transform.GetChild(childCounter).position.z = 0;
                    if(currentSelection.transform.GetChild(childCounter).tag== "detail" || currentSelection.transform.GetChild(childCounter).name == "door"){
                        currentSelection.transform.GetChild(childCounter).GetComponent(SpriteRenderer).sortingOrder = 2+(2*iCounter);
                    }else{
                        currentSelection.transform.GetChild(childCounter).GetComponent(SpriteRenderer).sortingOrder = 1 + (2*iCounter);
                    } 
                }
            }
            if(currentSelection.tag == "enemy"){
                currentSelection.transform.Find("targetIndicator").gameObject.GetComponent(SpriteRenderer).sortingOrder = 1;
            }
        }
    }
}

function BubbleSortObjects(){//This function sorts objects based on the Y-position, after gathering them from the puzzles.
    objectList = new Array();
    //-------------------------POPULATE WITH ALL PUZZLE OBJECTS------------------
    if(GameObject.Find("IntroArea(Clone)") !=null){
        PopulateObjectList(GameObject.Find("IntroArea(Clone)"));
    }
    if(GameObject.Find("IntroArea2(Clone)") !=null){
        PopulateObjectList(GameObject.Find("IntroArea2(Clone)"));
    }
    if(GameObject.Find("IntroArea3(Clone)") !=null){
        PopulateObjectList(GameObject.Find("IntroArea3(Clone)"));
    }
    if(GameObject.Find("Puzzle01(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle01(Clone)"));
    }
    if(GameObject.Find("Puzzle02(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle02(Clone)"));
    }
    if(GameObject.Find("Puzzle03(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle03(Clone)"));
    }
    if(GameObject.Find("Puzzle04(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle04(Clone)"));
    }
    if(GameObject.Find("Puzzle05(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle05(Clone)"));
    }
    if(GameObject.Find("Puzzle06(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle06(Clone)"));
    }
    if(GameObject.Find("Puzzle07(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle07(Clone)"));
    }
    if(GameObject.Find("Puzzle08(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle08(Clone)"));
    }
    if(GameObject.Find("Puzzle09(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle09(Clone)"));
    }
    if(GameObject.Find("Puzzle10(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle10(Clone)"));
    }
    if(GameObject.Find("Puzzle11(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle11(Clone)"));
    }
    if(GameObject.Find("Puzzle12(Clone)") !=null){
        PopulateObjectList(GameObject.Find("Puzzle12(Clone)"));
    }
    //--------------------------------------------------------------------
    var bDone:boolean;
    while (bDone==false){
        bDone = true;
        for(var x:int=1; x<objectList.length;x++){
			var object1:GameObject = objectList[x];
			var object2:GameObject = objectList[x-1];
			if(object1.tag=="enemy" || object1.tag=="player"){
				if(object2.tag=="enemy" || object2.tag == "player"){
					if(object1.transform.position.y > object2.transform.position.y){
						objectList[x-1] = object1;
						objectList[x] = object2;
						bDone = false;
                    }
                }else{
					if(object1.transform.position.y > object2.transform.position.y){
					    objectList[x-1] = object1;
					    objectList[x] = object2;
					    bDone = false;
					}
                }
            }else{
				if(object2.tag=="enemy" || object2.tag == "player"){
				    if(object1.transform.position.y > object2.transform.position.y){
				        objectList[x-1] = object1;
				        objectList[x] = object2;
				        bDone = false;
				    }
				}else{
					if(object1.transform.position.y > object2.transform.position.y){
					    objectList[x-1] = object1;
					    objectList[x] = object2;
					    bDone = false;
					}
                }
            }
        }
    }
}

function PopulateObjectList(puzzle:GameObject){//This function checks to see if objects are close enough to the camera to be depth-sorted. Objects off-screen are not sorted, so as to reduce the processing required.
    var camPos:Vector3 = GameObject.Find("Main Camera").transform.position;
    camPos.z =0 ;
    var distanceToPuzzle:float = (puzzle.transform.position - camPos).magnitude;
    if(distanceToPuzzle < 13 && distanceToPuzzle> -13){
        var tempArray = puzzle.GetComponent(Puzzle_Controller).childList;
        if(tempArray!=null){
            for(var iCounter:int = 0;iCounter < tempArray.length; iCounter++){
                var object:GameObject = tempArray[iCounter];
                var distanceToObject:float = (object.transform.position - camPos).magnitude;
                if(distanceToObject<2.5 && distanceToObject>-2.5){
                    objectList.Push(tempArray[iCounter]);
                }
            }
        }
    }
}

public function CinematicCollision(cinematicID:String){//Used to cause cinematic events
    if(cinematicID=="i1"){
        GameObject.Find("IntroManager").GetComponent(IntroHandler).CinematicCollision(cinematicID);
    }
}